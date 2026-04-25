precision highp float;

varying vec2 vUv;

uniform vec3 uColor;
uniform float uRadius;

float aastep(float threshold, float value) {
  float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;
  return smoothstep(threshold - afwidth, threshold + afwidth, value);
}

void main() {
  float d = length(vUv - vec2(0.5));
  float inside = 1.0 - aastep(uRadius, d);
  if (inside < 0.001) discard;
  gl_FragColor = vec4(uColor, inside);
}
