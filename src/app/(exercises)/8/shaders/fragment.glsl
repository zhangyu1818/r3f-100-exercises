uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;

uniform float uColorMultiplier;
uniform float uColorOffset;

varying float vElevation;


void main() {
    float strength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 color = mix(uDepthColor, uSurfaceColor, strength);
    gl_FragColor = vec4(color, 1.0);
}
