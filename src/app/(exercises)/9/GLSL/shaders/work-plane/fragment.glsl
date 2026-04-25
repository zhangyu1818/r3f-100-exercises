uniform sampler2D uMap;
uniform sampler2D uFrost;

uniform float uTime;
uniform float uHoverTime;
uniform float uIndex;
uniform float uHover;
uniform float uVelocity;
uniform float uLines;
uniform float uFluidLine;
uniform float uDisplacement;
uniform float uFrostAmount;
uniform float uViewport;
uniform float uRadius;
uniform float uPortrait;
uniform float uMobile;

uniform vec2 uResolution;
uniform vec2 uMapSize;
uniform vec2 uScale;

varying vec2 vUv;

#ifdef USE_FLUID
uniform sampler2D tFluid;
uniform float uFluid;
#endif

float random(vec2 n, float offset) {
  return 0.5 - fract(
    sin(dot(n.xy + vec2(offset, 0.0), vec2(12.9898, 78.233))) * 43758.5453
  );
}

float cmap(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}

vec2 scaleUV(vec2 uv, vec2 scale) {
  return (uv - 0.5) / scale + 0.5;
}

vec2 uvFromTextureSize(vec2 uv, vec2 textureSize, vec2 viewportSize) {
  float textureAspect = textureSize.x / textureSize.y;
  float viewportAspect = viewportSize.x / viewportSize.y;
  vec2 ratio = vec2(1.0);

  if (textureAspect > viewportAspect) {
    ratio.x = viewportAspect / textureAspect;
  } else {
    ratio.y = textureAspect / viewportAspect;
  }

  return (uv - 0.5) * ratio + 0.5;
}

float roundedBoxSdf(vec2 center, vec2 size, float radius) {
  return length(max(abs(center) - size + radius, 0.0)) - radius;
}

vec2 mirror(vec2 v) {
  vec2 m = mod(v, 2.0);
  return mix(m, 2.0 - m, step(1.0, m));
}

float circularIn(float t) {
  return 1.0 - sqrt(1.0 - t * t);
}

float blendScreen(float base, float blend) {
  return 1.0 - (1.0 - base) * (1.0 - blend);
}

vec3 blendScreen(vec3 base, vec3 blend) {
  return vec3(
    blendScreen(base.r, blend.r),
    blendScreen(base.g, blend.g),
    blendScreen(base.b, blend.b)
  );
}

vec3 blendScreen(vec3 base, vec3 blend, float opacity) {
  return blendScreen(base, blend) * opacity + base * (1.0 - opacity);
}

vec2 dispUv(
  vec2 uv,
  float r,
  float dx,
  float dix,
  vec4 frost,
  vec4 fluid,
  float maskInner
) {
  vec2 newUv = uv;
  float fX = cmap(frost.x, 0.0, 1.0, -1.0, 1.0);
  float fY = cmap(frost.y, 0.0, 1.0, -1.0, 1.0);

  newUv.x += dx * 0.7;
  newUv.x += dx * fX * 0.2;
  newUv.y += dx * fY * 0.2;
  newUv.x += fluid.x * uHover * uFluidLine * r * 1.3 * 0.01;
  newUv.x += r * uVelocity * 0.0001;
  newUv.x += dix * r * uHover * 0.7;
  newUv.x +=
    fX *
    cmap(uHover, 0.0, 1.0, 0.0, 2.0) *
    dix *
    (uFrostAmount * 0.1 + fluid.x * 0.0043 + uVelocity * 0.003);
  newUv.x += fX * fluid.x * 0.005 * cmap(uHover, 0.0, 1.0, 0.5, 1.0);
  newUv.y += fY * (fluid.y * 0.002) * cmap(uHover, 0.0, 1.0, 1.0, 1.0);

  return newUv;
}

void main() {
  vec2 st = gl_FragCoord.xy / uResolution.xy;
  vec2 frostUv = vUv;
  frostUv.x *= uScale.x / uScale.y;
  frostUv.x = mod(frostUv.x, 1.0);

  vec4 frost = texture2D(uFrost, frostUv);
  float index = ceil(vUv.x * uLines);
  float x = ceil(vUv.x * uLines) / uLines;

  vec2 uv = vUv;
  vec4 fluid = vec4(0.0);

  #ifdef USE_FLUID
  fluid = texture2D(tFluid, st);
  fluid.xy *= vec2(uFluid);
  #endif

  vec2 tUv = scaleUV(uvFromTextureSize(uv, uMapSize, uScale), vec2(1.1));
  tUv.x += cmap(uViewport, 0.0, 1.0, -1.0, 1.0) * 0.02;

  float r = random(vec2(index), index);
  float time = uTime + uHoverTime;
  float offset = -0.7 * uIndex * uPortrait;

  float mask = circularIn(
    cmap(sin(st.x * 5.0 - time * 0.8 + offset), 0.0, 1.0, 0.0, 1.0)
  );
  float maskInner = circularIn(
    cmap(sin(uv.x * 1.5 - time * 3.0 + offset), 0.0, 1.0, 0.0, 1.0)
  );
  float dispX = mask * abs(x - 0.5) * 0.6;
  float dispInX = maskInner * abs(x - 0.5);

  tUv = dispUv(tUv, r, dispX, dispInX, frost, fluid, maskInner);

  vec4 texel = texture2D(uMap, mirror(tUv));

  float edgeSoftness = 0.001;
  float radius = uRadius;
  float ratio = uScale.x / uScale.y;
  vec2 rectUv = vUv;
  rectUv = rectUv * 2.0 - 1.0;
  rectUv.y /= ratio;
  rectUv = rectUv * 0.5 + 0.5;
  float dist = roundedBoxSdf(
    rectUv.xy - vec2(0.5, 0.5),
    vec2(0.5, 0.5 / ratio),
    radius
  );
  float smoothedAlpha = 1.0 - smoothstep(-edgeSoftness, edgeSoftness, dist);
  texel.a *= smoothedAlpha;

  vec3 colorize = blendScreen(
    texel.rgb,
    texel.rgb,
    0.5 + clamp(fluid.z * 0.1, 0.0, 0.25)
  );
  texel.rgb = mix(texel.rgb, colorize, min(1.0, uHover) * 1.2);

  float darkMix = uHover * 0.54;
  darkMix += uMobile * 0.6;
  texel.rgb = mix(
    texel.rgb,
    vec3(0.0),
    darkMix * cmap((1.0 - vUv.y), 0.4, 1.0, 0.0, 1.0)
  );

  gl_FragColor = texel;
}
