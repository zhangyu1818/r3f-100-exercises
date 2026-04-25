attribute vec2 offset;

varying vec2 vUv;

void main() {
  vUv = uv;
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  mvPos.xy += offset;
  gl_Position = projectionMatrix * mvPos;
}
