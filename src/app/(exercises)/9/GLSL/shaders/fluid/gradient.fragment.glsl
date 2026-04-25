precision mediump float;
precision mediump sampler2D;

uniform sampler2D tPressure;
uniform sampler2D tVelocity;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;

void main() {
  float L = texture2D(tPressure, vL).x;
  float R = texture2D(tPressure, vR).x;
  float T = texture2D(tPressure, vT).x;
  float B = texture2D(tPressure, vB).x;
  vec2 velocity = texture2D(tVelocity, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
