precision highp float;

uniform vec2 uTexelSize;

varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main() {
  vUv = uv;
  vL = vUv - vec2(uTexelSize.x, 0.0);
  vR = vUv + vec2(uTexelSize.x, 0.0);
  vT = vUv + vec2(0.0, uTexelSize.y);
  vB = vUv - vec2(0.0, uTexelSize.y);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
