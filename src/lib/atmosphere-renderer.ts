import { createRingGeometry } from "./atmosphere-rings";
import { descentPlayback } from "./loss-landscape.mjs";
import { resolveParticleChoreography, resolveRingChoreography } from "./particle-transition";
import { formationCamera, formationView } from "./atmosphere-view.mjs";
import { atmosphereQuality, createParticleGeometry, createTrajectoryGeometry, particleStride, type AtmosphereQuality } from "./atmosphere-geometry";

export interface AtmospherePose { yaw: number; pitch: number; roll: number; scale: number; centerX: number; centerY: number; detail: number; lightX: number; lightY: number; pointerStrength: number; scroll: number; }
export const restingPose: AtmospherePose = { ...formationView, detail: 1, lightX: 0, lightY: 0, pointerStrength: 0, scroll: 0 };

const vertexSource = `
attribute vec3 aPosition;
attribute vec3 aDestination;
attribute vec3 aSeed;
attribute vec4 aSurface;
uniform float uTime;
uniform mediump float uKind;
uniform highp vec3 uRings;
uniform vec3 uMarker;
uniform highp float uTrajectoryAlpha;
uniform highp float uHead;
uniform float uSeparation;
uniform float uRelease;
uniform float uShrink;
uniform mediump float uExpansion;
uniform vec3 uRotation;
uniform vec4 uProjection;
uniform float uRatio;
uniform vec2 uLight;
uniform float uPointerStrength;
uniform float uScroll;
varying float vLight;
varying float vPulse;
varying float vPath;
void main() {
  vec3 p = uKind > 1.5 && uKind < 2.5 ? uMarker : aPosition;
  vPath = aSeed.x;
  vec3 normal = aSurface.xyz;
  float density = clamp(aSurface.w, 0.0, 1.0);
  vPulse = 0.94 + sin(uTime * 0.35 + aSeed.x * 8.0) * 0.06;
  // Geometry stays on the exact loss surface at rest; only dissolution displaces it.
  if (uKind < 0.5) p += normal * uSeparation * 0.045;
  if (uKind < 0.5) p.y += sin(uTime * 0.21 + aSeed.x * 30.0) * 0.025 * uExpansion * (1.0 - uExpansion);
  if (uKind > 2.5) {
    // Scroll adds a bounded rotation offset, avoiding time * progress discontinuities.
    float angle = uTime * aSeed.z + sign(aSeed.z) * uRings.x * 0.24;
    p *= 0.85 * (1.0 + uRings.x * 0.48);
    p += vec3(sin(aSeed.x * 75.0), cos(aSeed.x * 62.0), sin(aSeed.x * 43.0)) * uRings.y * 0.065;
    if (aSeed.y < 0.5) p.xz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p.xz;
    else if (aSeed.y < 1.5) p.yz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p.yz;
    else p.xy = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p.xy;
    vPulse = 0.42 + 0.58 * pow(0.5 + 0.5 * cos(aSeed.x * 6.283185 - uTime * 0.65 + aSeed.y), 12.0);
  }
  float cy = cos(uRotation.x), sy = sin(uRotation.x);
  p.xz = mat2(cy, -sy, sy, cy) * p.xz;
  float cx = cos(uRotation.y), sx = sin(uRotation.y);
  p.yz = mat2(cx, sx, -sx, cx) * p.yz;
  float cz = cos(uRotation.z), sz = sin(uRotation.z);
  p.xy = mat2(cz, sz, -sz, cz) * p.xy;
  float perspective = ${formationCamera.toFixed(1)} / (${formationCamera.toFixed(1)} + p.z);
  vec2 projected = p.xy * uProjection.x * perspective;
  projected.x /= uProjection.y;
  // Slightly staggered departures flow along curved paths, with exact endpoints.
  float phase = smoothstep(0.0, 1.0, clamp((uRelease - aSeed.x * 0.06) / 0.94, 0.0, 1.0));
  if (uKind > 0.5) phase = 0.0;
  vec2 destination = aDestination.xy;
  // Depth is independent of formation rotation once the data fills the viewport.
  float depth = aDestination.z - 0.5 + sin(uTime * 0.08 + aSeed.x * 9.0) * 0.06;
  destination += uLight * depth * 0.018 * uPointerStrength;
  destination.y += sin(uScroll * 0.25 + aSeed.y * 6.28) * depth * 0.055;
  // Time-driven, smoothly varying velocities continue while scroll and cursor idle.
  destination += vec2(sin(uTime * (0.12 + aSeed.z * 0.045) + aSeed.x * 18.0),
    cos(uTime * (0.10 + aSeed.y * 0.04) + aSeed.y * 8.0)) * 0.065;
  destination += vec2(cos(uTime * 0.075 + aSeed.z * 14.0), sin(uTime * 0.085 + aSeed.x * 11.0)) * 0.012;
  vec2 flow = vec2(sin(aSeed.x * 6.28), cos(aSeed.y * 6.28)) * sin(phase * 3.141593) * 0.13;
  vec2 screen = mix(projected + uProjection.zw, destination, phase) + flow;
  vec2 offset = (screen - uLight) * vec2(uProjection.y, 1.0);
  float distanceToPointer = length(offset);
  float influence = exp(-dot(offset, offset) * 32.0) * uPointerStrength;
  screen += offset / max(distanceToPointer, 0.02) * vec2(1.0 / uProjection.y, 1.0) * influence * 0.035;
  gl_Position = vec4(screen, 0.0, 1.0);
  float visualDepth = mix(p.z, depth * 2.0, phase);
  float front = clamp((1.8 - visualDepth) / 3.6, 0.0, 1.0);
  float illumination = 0.65 + max(0.0, dot(normal, normalize(vec3(-0.4, 0.8, 0.5)))) * 0.35;
  float formationLight = illumination * (0.75 + front * 0.25);
  vLight = mix(formationLight, mix(0.16, 0.72, front), phase);
  vLight *= mix(smoothstep(-0.1, 0.4, screen.x), 1.0, phase);
  vLight *= 1.0 + influence * 0.22;
  vLight *= 0.65 + aSeed.y * 0.5;
  // Illuminate the sampled surface without moving it away from the objective.
  if (uKind < 0.5 && uTrajectoryAlpha > 0.001) {
    float markerDistance = length(aPosition - uMarker);
    float proximity = exp(-markerDistance * markerDistance * 18.0);
    float minimumPulse = smoothstep(0.94, 0.99, uHead) *
      pow(0.5 + 0.5 * cos(markerDistance * 24.0 - uTime * 3.0), 8.0) * exp(-markerDistance * 3.0);
    vLight += (proximity * 0.55 + minimumPulse * 0.15) * uTrajectoryAlpha;
  }
  float pointSize = mix(6.3 + aSeed.z * 1.0, 1.15 + aSeed.z * 0.65, uShrink);
  if (uKind > 0.5) vLight = 1.0;
  if (uKind > 2.5) vLight = (0.5 + front * 0.5) * smoothstep(-0.1, 0.4, screen.x);
  gl_PointSize = clamp(pointSize * mix(perspective, 1.0 - depth * 0.3, phase) * uRatio, 1.0, 10.0 * uRatio);
  if (uKind > 1.5 && uKind < 2.5) gl_PointSize = 22.0 * uRatio;
}`;
const fragmentSource = `
precision mediump float;
uniform highp float uTime;
uniform vec3 uColor;
uniform float uPoint;
uniform mediump float uKind;
uniform highp vec3 uRings;
uniform highp float uTrajectoryAlpha;
uniform highp float uHead;
uniform float uLinks;
uniform float uDetail;
varying float vLight;
varying float vPulse;
varying float vPath;
void main() {
  float alpha = vLight;
  if (uPoint < 0.5) alpha *= vPulse * 0.48 * uLinks;
  if (uPoint > 0.5) alpha *= (1.0 - smoothstep(0.15, 0.5, length(gl_PointCoord - vec2(0.5)))) * uDetail;
  vec3 color = uColor;
  if (uKind > 0.5 && uKind < 2.5) {
    alpha = uTrajectoryAlpha;
    color = mix(uColor, vec3(0.71, 0.804, 1.0), 0.7);
    if (uKind < 1.5) {
      alpha *= (0.16 + 0.84 * smoothstep(uHead - 0.32, uHead, vPath)) *
        (1.0 - smoothstep(uHead - 0.002, uHead + 0.002, vPath));
    } else {
      float radius = length(gl_PointCoord - vec2(0.5));
      float core = 1.0 - smoothstep(0.07, 0.16, radius);
      float halo = exp(-radius * radius * 20.0) * (1.0 - smoothstep(0.35, 0.5, radius));
      alpha *= max(core, halo * (0.3 + sin(uTime * 2.0) * 0.035));
    }
  }
  if (uKind > 2.5) {
    float segment = fract(vPath * 36.0);
    float intact = smoothstep(uRings.y * 0.88, uRings.y * 0.88 + 0.1, segment);
    alpha = (0.28 + vPulse * 0.32) * uRings.z * mix(1.0, intact, uRings.y);
    alpha *= vLight;
    color = mix(uColor, vec3(0.71, 0.804, 1.0), vPulse * 0.25);
  }
  gl_FragColor = vec4(color, alpha);
}`;

/** Shared program and static buffers; expanded fields need only the points pass. */
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
    gl.bindAttribLocation(program, 0, "aPosition"); gl.bindAttribLocation(program, 1, "aDestination"); gl.bindAttribLocation(program, 2, "aSeed"); gl.bindAttribLocation(program, 3, "aSurface"); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("Atmosphere shader link failed");
    // Shader objects can be released once linked; the program retains its executable.
    shaders.forEach((shader) => gl.deleteShader(shader)); shaders.length = 0;
    gl.useProgram(program);
    const uniforms = Object.fromEntries(["uTime", "uRings", "uKind", "uMarker", "uTrajectoryAlpha", "uHead", "uExpansion", "uRelease", "uShrink", "uSeparation", "uLinks", "uRotation", "uProjection", "uRatio", "uColor", "uPoint", "uDetail", "uLight", "uPointerStrength", "uScroll"].map((name) => [name, gl.getUniformLocation(program!, name)]));
    const allocate = (data: Float32Array) => {
      const buffer = gl.createBuffer();
      if (!buffer) throw new Error("Buffer allocation failed");
      buffers.add(buffer); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return { buffer, count: data.length / particleStride };
    };
    const geometry = createParticleGeometry(quality);
    let lines = allocate(geometry.lines);
    let points = allocate(geometry.points);
    const trajectoryModel = createTrajectoryGeometry();
    const trail = allocate(trajectoryModel.data);
    const rings = allocate(createRingGeometry());
    const playback = { x: 0, y: 0, z: 0, progress: 0, alpha: 0 };
    if (gl.getError() !== gl.NO_ERROR) throw new Error("Geometry upload failed");
    for (let i = 0; i < 4; i++) gl.enableVertexAttribArray(i); gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.uniform3f(uniforms.uColor, color[0], color[1], color[2]);
    let width = 1, height = 1, ratio = 1;
    const ringChoreography = { expansion: 0, fragments: 0, opacity: 1 };
    const choreography = { separation: 0, release: 0, links: 1, shrink: 0 };
    const draw = (geometry: { buffer: WebGLBuffer; count: number }, mode: number, count = geometry.count) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, geometry.buffer); for (let i = 0; i < 4; i++) gl.vertexAttribPointer(i, i === 3 ? 4 : 3, gl.FLOAT, false, particleStride * 4, i * 12); gl.drawArrays(mode, 0, count);
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
        resolveParticleChoreography(expansion, choreography);
        resolveRingChoreography(expansion, ringChoreography);
        gl.uniform3f(uniforms.uRings, ringChoreography.expansion, ringChoreography.fragments, ringChoreography.opacity);
        gl.uniform1f(uniforms.uTime, time); gl.uniform1f(uniforms.uExpansion, expansion);
        gl.uniform1f(uniforms.uSeparation, choreography.separation); gl.uniform1f(uniforms.uRelease, choreography.release); gl.uniform1f(uniforms.uLinks, choreography.links);
        gl.uniform1f(uniforms.uShrink, choreography.shrink);
        gl.uniform3f(uniforms.uRotation, pose.yaw + Math.sin(time * 0.075) * 0.12, pose.pitch + Math.sin(time * 0.12) * 0.025, pose.roll + Math.sin(time * 0.08) * 0.012);
        gl.uniform4f(uniforms.uProjection, pose.scale, width / height, pose.centerX, pose.centerY);
        gl.uniform1f(uniforms.uRatio, ratio); gl.uniform1f(uniforms.uDetail, pose.detail);
        gl.uniform2f(uniforms.uLight, pose.lightX, pose.lightY);
        gl.uniform1f(uniforms.uPointerStrength, pose.pointerStrength); gl.uniform1f(uniforms.uScroll, pose.scroll);
        descentPlayback(time, trajectoryModel.trajectory, playback);
        gl.uniform1f(uniforms.uTrajectoryAlpha, playback.alpha * choreography.links * 0.85);
        gl.uniform1f(uniforms.uHead, playback.progress);
        gl.uniform3f(uniforms.uMarker, playback.x, playback.y, playback.z);
        if (ringChoreography.opacity > 0.001) { gl.uniform1f(uniforms.uKind, 3); draw(rings, gl.TRIANGLES); }
        gl.uniform1f(uniforms.uKind, 0);
        // Expanded sections have no visible relationships; omit their entire draw.
        if (choreography.links > 0.001) { gl.uniform1f(uniforms.uPoint, 0); draw(lines, gl.LINES); }
        if (pose.detail > 0.01) { gl.uniform1f(uniforms.uPoint, 1); draw(points, gl.POINTS); }
        if (choreography.links > 0.001) {
          if (playback.alpha > 0.001) {
            gl.uniform1f(uniforms.uKind, 1); draw(trail, gl.LINE_STRIP);
            gl.uniform1f(uniforms.uKind, 2); draw(trail, gl.POINTS, 1);
          }
        }
        return true;
      },
      destroy() { if (!disposed) { disposed = true; cleanup(); } },
    };
  } catch (error) { cleanup(); throw error; }
}
export type AtmosphereRenderer = ReturnType<typeof createAtmosphereRenderer>;
