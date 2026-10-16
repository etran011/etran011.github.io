import { atmosphereQuality, createParticleGeometry, type AtmosphereQuality } from "./atmosphere-geometry";

export interface AtmospherePose { yaw: number; pitch: number; roll: number; scale: number; centerX: number; centerY: number; detail: number; lightX: number; lightY: number; pointerStrength: number; scroll: number; }
export const restingPose: AtmospherePose = { yaw: 0.48, pitch: -0.7, roll: -0.38, scale: 0.64, centerX: 0.58, centerY: 0.02, detail: 1, lightX: 0, lightY: 0, pointerStrength: 0, scroll: 0 };

const vertexSource = `
attribute vec3 aPosition;
attribute vec3 aDestination;
attribute vec3 aSeed;
uniform float uTime;
uniform mediump float uExpansion;
uniform vec3 uRotation;
uniform vec4 uProjection;
uniform float uRatio;
uniform vec2 uLight;
uniform float uPointerStrength;
uniform float uScroll;
varying float vLight;
void main() {
  vec3 p = aPosition;
  float wave = sin(p.x * 2.6 + uTime * 0.2 + aSeed.x * 6.28);
  p.y += wave * 0.035;
  float cy = cos(uRotation.x), sy = sin(uRotation.x);
  p.xz = mat2(cy, -sy, sy, cy) * p.xz;
  float cx = cos(uRotation.y), sx = sin(uRotation.y);
  p.yz = mat2(cx, sx, -sx, cx) * p.yz;
  float cz = cos(uRotation.z), sz = sin(uRotation.z);
  p.xy = mat2(cz, sz, -sz, cz) * p.xy;
  float perspective = 4.5 / (4.5 + p.z);
  vec2 projected = p.xy * uProjection.x * perspective;
  projected.x /= uProjection.y;
  // Slightly staggered departures flow along curved paths, with exact endpoints.
  float phase = smoothstep(0.0, 1.0, clamp((uExpansion - aSeed.x * 0.08) / 0.92, 0.0, 1.0));
  vec2 destination = aDestination.xy;
  // Depth is independent of formation rotation once the data fills the viewport.
  float depth = aDestination.z - 0.5;
  destination += uLight * depth * 0.018 * uPointerStrength;
  destination.y += sin(uScroll * 0.25 + aSeed.y * 6.28) * depth * 0.055;
  destination += vec2(sin(uTime * 0.09 + aSeed.x * 18.0), cos(uTime * 0.07 + aSeed.y * 8.0)) * 0.028;
  vec2 flow = vec2(sin(aSeed.x * 6.28), cos(aSeed.y * 6.28)) * sin(phase * 3.141593) * 0.13;
  vec2 screen = mix(projected + uProjection.zw, destination, phase) + flow;
  vec2 offset = (screen - uLight) * vec2(uProjection.y, 1.0);
  float distanceToPointer = length(offset);
  float influence = exp(-dot(offset, offset) * 32.0) * uPointerStrength;
  screen += offset / max(distanceToPointer, 0.02) * vec2(1.0 / uProjection.y, 1.0) * influence * 0.035;
  gl_Position = vec4(screen, 0.0, 1.0);
  vLight = mix(0.1, 0.66, clamp((1.8 - p.z) / 3.6, 0.0, 1.0));
  vLight *= 1.0 + influence * 0.22;
  vLight *= 0.65 + aSeed.y * 0.5;
  gl_PointSize = clamp((1.5 + aSeed.z * 1.1) * perspective * uRatio, 1.0, 4.5);
}`;
const fragmentSource = `
precision mediump float;
uniform vec3 uColor;
uniform float uPoint;
uniform mediump float uExpansion;
uniform float uDetail;
varying float vLight;
void main() {
  float alpha = vLight;
  if (uPoint < 0.5) alpha *= 0.25 * (1.0 - smoothstep(0.08, 0.65, uExpansion));
  if (uPoint > 0.5) alpha *= (1.0 - smoothstep(0.15, 0.5, length(gl_PointCoord - vec2(0.5)))) * uDetail;
  gl_FragColor = vec4(uColor, alpha);
}`;

/** Two batched draws, static buffers, procedural deformation in the vertex shader. */
export function createAtmosphereRenderer(canvas: HTMLCanvasElement, initialQuality: AtmosphereQuality, color: readonly number[]) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: "low-power" });
  if (!gl) throw new Error("WebGL unavailable");
  const shaders: WebGLShader[] = [];
  const buffers = new Set<WebGLBuffer>();
  let program: WebGLProgram | null = null;
  let quality = initialQuality;
  let disposed = false;
  const cleanup = () => {
    for (const buffer of buffers) gl.deleteBuffer(buffer);
    buffers.clear();
    for (const shader of shaders) gl.deleteShader(shader);
    shaders.length = 0;
    if (program) gl.deleteProgram(program);
    program = null;
  };
  try {
    for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Shader allocation failed");
      shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
    }
    program = gl.createProgram();
    if (!program) throw new Error("Program allocation failed");
    shaders.forEach((shader) => gl.attachShader(program!, shader));
    gl.bindAttribLocation(program, 0, "aPosition"); gl.bindAttribLocation(program, 1, "aDestination"); gl.bindAttribLocation(program, 2, "aSeed"); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Atmosphere shader link failed");
    // Shader objects can be released once linked; the program retains its executable.
    shaders.forEach((shader) => gl.deleteShader(shader)); shaders.length = 0;
    gl.useProgram(program);
    const uniforms = Object.fromEntries(["uTime", "uExpansion", "uRotation", "uProjection", "uRatio", "uColor", "uPoint", "uDetail", "uLight", "uPointerStrength", "uScroll"].map((name) => [name, gl.getUniformLocation(program!, name)]));
    const allocate = (data: Float32Array) => {
      const buffer = gl.createBuffer();
      if (!buffer) throw new Error("Buffer allocation failed");
      buffers.add(buffer); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return { buffer, count: data.length / 9 };
    };
    const geometry = createParticleGeometry(quality);
    let lines = allocate(geometry.lines);
    let points = allocate(geometry.points);
    if (gl.getError() !== gl.NO_ERROR) throw new Error("Geometry upload failed");
    for (let i = 0; i < 3; i++) gl.enableVertexAttribArray(i); gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.uniform3f(uniforms.uColor, color[0], color[1], color[2]);
    let width = 1, height = 1, ratio = 1;
    const draw = (geometry: { buffer: WebGLBuffer; count: number }, mode: number) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, geometry.buffer); for (let i = 0; i < 3; i++) gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 36, i * 12); gl.drawArrays(mode, 0, geometry.count);
    };
    return {
      resize(w: number, h: number) {
        width = Math.max(1, w); height = Math.max(1, h);
        ratio = Math.min(devicePixelRatio || 1, atmosphereQuality[quality].pixelRatio, Math.sqrt(2_400_000 / (width * height)), 4096 / width, 4096 / height);
        canvas.width = Math.max(1, Math.round(width * ratio)); canvas.height = Math.max(1, Math.round(height * ratio));
        gl.viewport(0, 0, canvas.width, canvas.height);
      },
      setQuality(next: AtmosphereQuality) {
        if (next === quality || disposed) return;
        const geometry = createParticleGeometry(next);
        const nextLines = allocate(geometry.lines); const nextPoints = allocate(geometry.points);
        gl.deleteBuffer(lines.buffer); buffers.delete(lines.buffer); gl.deleteBuffer(points.buffer); buffers.delete(points.buffer);
        lines = nextLines; points = nextPoints; quality = next;
        this.resize(width, height);
      },
      render(time: number, pose: AtmospherePose = restingPose, expansion = 0) {
        if (disposed || gl.isContextLost()) return false;
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(uniforms.uTime, time); gl.uniform1f(uniforms.uExpansion, expansion);
        gl.uniform3f(uniforms.uRotation, pose.yaw + time * 0.025, pose.pitch + Math.sin(time * 0.12) * 0.06, pose.roll + Math.sin(time * 0.08) * 0.05);
        gl.uniform4f(uniforms.uProjection, pose.scale, width / height, pose.centerX, pose.centerY);
        gl.uniform1f(uniforms.uRatio, ratio); gl.uniform1f(uniforms.uDetail, pose.detail);
        gl.uniform2f(uniforms.uLight, pose.lightX, pose.lightY);
        gl.uniform1f(uniforms.uPointerStrength, pose.pointerStrength); gl.uniform1f(uniforms.uScroll, pose.scroll);
        gl.uniform1f(uniforms.uPoint, 0); draw(lines, gl.LINES);
        if (pose.detail > 0.01) { gl.uniform1f(uniforms.uPoint, 1); draw(points, gl.POINTS); }
        return true;
      },
      destroy() { if (!disposed) { disposed = true; cleanup(); } },
    };
  } catch (error) { cleanup(); throw error; }
}
export type AtmosphereRenderer = ReturnType<typeof createAtmosphereRenderer>;
