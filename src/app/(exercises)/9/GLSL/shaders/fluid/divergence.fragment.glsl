precision mediump float;
precision mediump sampler2D;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;

uniform sampler2D tVelocity;

void main() {
  float L = texture2D(tVelocity, vL).x;
  float R = texture2D(tVelocity, vR).x;
  float T = texture2D(tVelocity, vT).y;
  float B = texture2D(tVelocity, vB).y;
  vec2 C = texture2D(tVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}
