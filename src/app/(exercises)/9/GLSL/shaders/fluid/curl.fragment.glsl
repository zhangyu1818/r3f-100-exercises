precision mediump float;
precision mediump sampler2D;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;

uniform sampler2D tVelocity;

void main() {
  float L = texture2D(tVelocity, vL).y;
  float R = texture2D(tVelocity, vR).y;
  float T = texture2D(tVelocity, vT).x;
  float B = texture2D(tVelocity, vB).x;
  float vorticity = R - L - T + B;
  gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}
