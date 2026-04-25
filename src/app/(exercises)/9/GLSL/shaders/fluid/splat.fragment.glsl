precision highp float;
precision highp sampler2D;

uniform sampler2D tTarget;
uniform float uAspectRatio;
uniform vec3 uColor;
uniform vec2 uPoint;
uniform float uRadius;

varying vec2 vUv;

void main() {
  vec2 p = vUv - uPoint.xy;
  vec3 splat = exp(-dot(p, p) / uRadius) * uColor;
  vec3 base = texture2D(tTarget, vUv).xyz;
  gl_FragColor = vec4(base + splat, 1.0);
}
