precision mediump float;
precision mediump sampler2D;

uniform sampler2D tDiffuse;
uniform float uDissipation;

varying highp vec2 vUv;

void main() {
  gl_FragColor = uDissipation * texture2D(tDiffuse, vUv);
}
