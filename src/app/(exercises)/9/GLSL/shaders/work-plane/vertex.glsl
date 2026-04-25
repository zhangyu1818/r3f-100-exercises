uniform float uTime;
uniform float uVelocity;
uniform float uVelocityFactor;
uniform float uOffset;
uniform float uPortrait;

varying vec2 vUv;

void main() {
  vUv = uv;

  vec4 pos = modelViewMatrix * vec4(position, 1.0);
  float offsetZLandscape = sin(pos.x * 0.25 + uTime) * 0.12;
  float offsetZPortrait = sin(pos.y * 0.5 + uTime) * 0.1;
  float offsetZ = mix(offsetZLandscape, offsetZPortrait, uPortrait);

  pos.y += offsetZ * (0.4 + uVelocity * uVelocityFactor * 0.003) * 0.7 + offsetZ * 0.1;
  pos.z += offsetZ * (1.0 + uVelocity * uVelocityFactor * 0.02) * 0.7 + offsetZ * 0.1;

  gl_Position = projectionMatrix * pos;
}
