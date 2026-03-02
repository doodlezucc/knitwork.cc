varying vec3 vPosition;
uniform vec3 target;
uniform float t;

void main() {
  vec3 color = vec3(1, 0, 0.451);
  float opacity = 0.5;
  float gradientLength = 0.005;

  float edge = mix(0.1, 0.05, t);

  float dist = length(target - vPosition);
  float intensity = 1.0 - smoothstep(edge, edge + gradientLength, dist);


  gl_FragColor = vec4(color, t * intensity * opacity);
}
