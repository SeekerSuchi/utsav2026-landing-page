import { useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';
import {
  WebGLRenderer,
  ShaderMaterial,
  Scene,
  OrthographicCamera,
  PlaneGeometry,
  Mesh,
  Vector2,
  Vector3,
  Color,
} from 'three';

// ─── Module-level constants (computed once, shared across all instances) ─────

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Reusable Color instance to avoid allocations
const _tmpColor = new Color();
function parseColor(hex: string): Vector3 {
  _tmpColor.set(hex);
  return new Vector3(_tmpColor.r, _tmpColor.g, _tmpColor.b);
}

// Pre-compute wave rotation values (constant 0.4 rad across all instances)
const WAVE_SIN = Math.sin(0.4);
const WAVE_COS = Math.cos(0.4);
const WAVE_SIN_ARR = new Float32Array([WAVE_SIN, WAVE_SIN, WAVE_SIN, WAVE_SIN]);
const WAVE_COS_ARR = new Float32Array([WAVE_COS, WAVE_COS, WAVE_COS, WAVE_COS]);

// One-time WebGL support check (avoids extra render via useState)
let _webGLChecked = false;
let _webGLSupported = true;
function isWebGLSupported(): boolean {
  if (_webGLChecked) return _webGLSupported;
  _webGLChecked = true;
  try {
    const c = document.createElement('canvas');
    _webGLSupported = !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch {
    _webGLSupported = false;
  }
  return _webGLSupported;
}

// Device capability detection (runs once)
const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const IS_LOW_END = IS_MOBILE || (navigator.hardwareConcurrency != null && navigator.hardwareConcurrency <= 4);

const QUALITY_SETTINGS = {
  low:    { iterations: 24, waveIterations: 1, pixelRatio: 0.5,  precision: 'mediump' as const, stepMultiplier: 1.5, targetFPS: 30 },
  medium: { iterations: 40, waveIterations: 2, pixelRatio: 0.65, precision: 'mediump' as const, stepMultiplier: 1.2, targetFPS: 60 },
  high:   { iterations: 80, waveIterations: 4, pixelRatio: Math.min(window.devicePixelRatio, 2), precision: 'highp' as const, stepMultiplier: 1.0, targetFPS: 60 },
} as const;

function getEffectiveQuality(quality: 'low' | 'medium' | 'high') {
  if (IS_MOBILE) return 'low';
  if (IS_LOW_END && quality === 'high') return 'medium';
  return quality;
}

// Build fragment shader with baked-in iteration counts (compile-time constants)
function buildFragmentShader(iterations: number, waveIterations: number, stepMultiplier: number): string {
  return `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    uniform vec3 uTopColor;
    uniform vec3 uBottomColor;
    uniform float uIntensity;
    uniform bool uInteractive;
    uniform float uGlowAmount;
    uniform float uPillarWidth;
    uniform float uPillarHeight;
    uniform float uNoiseIntensity;
    uniform float uRotCos;
    uniform float uRotSin;
    uniform float uPillarRotCos;
    uniform float uPillarRotSin;
    uniform float uWaveSin[4];
    uniform float uWaveCos[4];
    varying vec2 vUv;

    const float PI = 3.141592653589793;
    const float EPSILON = 0.001;
    const float E = 2.71828182845904523536;

    float noise(vec2 coord) {
      vec2 r = E * sin(E * coord);
      return fract(r.x * r.y * (1.0 + coord.x));
    }

    void main() {
      vec2 fragCoord = vUv * uResolution;
      vec2 uv = (fragCoord * 2.0 - uResolution) / uResolution.y;

      uv = vec2(
        uv.x * uPillarRotCos - uv.y * uPillarRotSin,
        uv.x * uPillarRotSin + uv.y * uPillarRotCos
      );

      vec3 origin = vec3(0.0, 0.0, -10.0);
      vec3 direction = normalize(vec3(uv, 1.0));
      float maxDepth = 50.0;
      float depth = 0.1;

      float rotCos = uRotCos;
      float rotSin = uRotSin;
      if (uInteractive && length(uMouse) > 0.0) {
        float mouseAngle = uMouse.x * PI * 2.0;
        rotCos = cos(mouseAngle);
        rotSin = sin(mouseAngle);
      }

      vec3 color = vec3(0.0);
      const int ITERATIONS = ${iterations};
      const int WAVE_ITERATIONS = ${waveIterations};
      const float STEP_MULT = ${stepMultiplier.toFixed(1)};

      for (int i = 0; i < ITERATIONS; i++) {
        vec3 pos = origin + direction * depth;

        float newX = pos.x * rotCos - pos.z * rotSin;
        float newZ = pos.x * rotSin + pos.z * rotCos;
        pos.x = newX;
        pos.z = newZ;

        vec3 deformed = pos;
        deformed.y *= uPillarHeight;
        deformed.y += uTime;

        float frequency = 1.0;
        float amplitude = 1.0;
        for (int j = 0; j < WAVE_ITERATIONS; j++) {
          float wx = deformed.x * uWaveCos[j] - deformed.z * uWaveSin[j];
          float wz = deformed.x * uWaveSin[j] + deformed.z * uWaveCos[j];
          deformed.x = wx;
          deformed.z = wz;

          float phase = uTime * float(j) * 2.0;
          vec3 oscillation = cos(deformed.zxy * frequency - phase);
          deformed += oscillation * amplitude;
          frequency *= 2.0;
          amplitude *= 0.5;
        }

        vec2 cosinePair = cos(deformed.xz);
        float fieldDistance = length(cosinePair) - 0.2;

        float radialBound = length(pos.xz) - uPillarWidth;
        float k = 4.0;
        float h = max(k - abs(-radialBound - (-fieldDistance)), 0.0);
        fieldDistance = -(min(-radialBound, -fieldDistance) - h * h * 0.25 / k);
        fieldDistance = abs(fieldDistance) * 0.15 + 0.01;

        vec3 gradient = mix(uBottomColor, uTopColor, smoothstep(15.0, -15.0, pos.y));
        color += gradient / fieldDistance;

        if (fieldDistance < EPSILON || depth > maxDepth) break;
        depth += fieldDistance * STEP_MULT;
      }

      float widthNormalization = uPillarWidth / 3.0;
      color = tanh(color * uGlowAmount / widthNormalization);

      float rnd = noise(gl_FragCoord.xy);
      color -= rnd / 15.0 * uNoiseIntensity;

      gl_FragColor = vec4(color * uIntensity, 1.0);
    }
  `;
}

// ─── Component ──────────────────────────────────────────────────────────────

interface LightPillarProps {
  topColor?: string;
  bottomColor?: string;
  intensity?: number;
  rotationSpeed?: number;
  interactive?: boolean;
  className?: string;
  glowAmount?: number;
  pillarWidth?: number;
  pillarHeight?: number;
  noiseIntensity?: number;
  mixBlendMode?: CSSProperties['mixBlendMode'];
  pillarRotation?: number;
  quality?: 'low' | 'medium' | 'high';
}

/** Consolidated WebGL state — single ref instead of 7 individual refs */
interface GLState {
  renderer: WebGLRenderer;
  material: ShaderMaterial;
  scene: Scene;
  camera: OrthographicCamera;
  geometry: PlaneGeometry;
  raf: number;
  time: number;
  disposed: boolean;
}

export default function LightPillar({
  topColor = '#5227FF',
  bottomColor = '#FF9FFC',
  intensity = 1.0,
  rotationSpeed = 0.3,
  interactive = false,
  className = '',
  glowAmount = 0.005,
  pillarWidth = 3.0,
  pillarHeight = 0.4,
  noiseIntensity = 0.5,
  mixBlendMode = 'screen',
  pillarRotation = 0,
  quality = 'high',
}: LightPillarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<GLState | null>(null);
  const mouseRef = useRef(new Vector2(0, 0));
  // Mutable ref so the animation loop always reads the latest value without teardown
  const rotationSpeedRef = useRef(rotationSpeed);
  useEffect(() => { rotationSpeedRef.current = rotationSpeed; }, [rotationSpeed]);

  // ── Setup / teardown WebGL context ────────────────────────────────────────
  // Only depends on `quality` and `pillarRotation` (shader recompile needed).
  // All other props update uniforms in the lighter effect below.
  useEffect(() => {
    if (!isWebGLSupported() || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const effectiveQuality = getEffectiveQuality(quality);
    const settings = QUALITY_SETTINGS[effectiveQuality];

    // Scene
    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: effectiveQuality === 'low' ? 'low-power' : 'high-performance',
        precision: settings.precision,
        stencil: false,
        depth: false,
      });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(settings.pixelRatio);
    container.appendChild(renderer.domElement);

    // Pre-compute pillar rotation
    const pillarRotRad = (pillarRotation * Math.PI) / 180;

    const material = new ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: buildFragmentShader(settings.iterations, settings.waveIterations, settings.stepMultiplier),
      uniforms: {
        uTime:           { value: 0 },
        uResolution:     { value: new Vector2(width, height) },
        uMouse:          { value: mouseRef.current },
        uTopColor:       { value: parseColor(topColor) },
        uBottomColor:    { value: parseColor(bottomColor) },
        uIntensity:      { value: intensity },
        uInteractive:    { value: interactive },
        uGlowAmount:     { value: glowAmount },
        uPillarWidth:    { value: pillarWidth },
        uPillarHeight:   { value: pillarHeight },
        uNoiseIntensity: { value: noiseIntensity },
        uRotCos:         { value: 1.0 },
        uRotSin:         { value: 0.0 },
        uPillarRotCos:   { value: Math.cos(pillarRotRad) },
        uPillarRotSin:   { value: Math.sin(pillarRotRad) },
        uWaveSin:        { value: WAVE_SIN_ARR },
        uWaveCos:        { value: WAVE_COS_ARR },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    const geometry = new PlaneGeometry(2, 2);
    scene.add(new Mesh(geometry, material));

    const gl: GLState = { renderer, material, scene, camera, geometry, raf: 0, time: 0, disposed: false };
    glRef.current = gl;

    // ── Animation loop with visibility pause ────────────────────────────────
    let lastTime = performance.now();
    const frameTime = 1000 / settings.targetFPS;
    let tabVisible = !document.hidden;

    const onVisibility = () => { tabVisible = !document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    const animate = (now: number) => {
      if (gl.disposed) return;
      gl.raf = requestAnimationFrame(animate);

      // Skip rendering when tab is hidden
      if (!tabVisible) return;

      const dt = now - lastTime;
      if (dt < frameTime) return;

      gl.time += 0.016 * rotationSpeedRef.current;
      material.uniforms.uTime.value = gl.time;

      const rotAngle = gl.time * 0.3;
      material.uniforms.uRotCos.value = Math.cos(rotAngle);
      material.uniforms.uRotSin.value = Math.sin(rotAngle);

      renderer.render(scene, camera);
      lastTime = now - (dt % frameTime);
    };
    gl.raf = requestAnimationFrame(animate);

    // ── Resize (debounced) ──────────────────────────────────────────────────
    let resizeTimer = 0;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (gl.disposed || !containerRef.current) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        renderer.setSize(w, h);
        material.uniforms.uResolution.value.set(w, h);
      }, 150);
    };
    window.addEventListener('resize', onResize, { passive: true });

    // ── Mouse (only when interactive) ───────────────────────────────────────
    let mouseThrottle = 0;
    const onMouse = (e: MouseEvent) => {
      if (mouseThrottle) return;
      mouseThrottle = window.setTimeout(() => { mouseThrottle = 0; }, 16);
      const rect = container.getBoundingClientRect();
      mouseRef.current.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      );
    };
    if (interactive) container.addEventListener('mousemove', onMouse, { passive: true });

    // ── Cleanup ─────────────────────────────────────────────────────────────
    return () => {
      gl.disposed = true;
      cancelAnimationFrame(gl.raf);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      if (interactive) container.removeEventListener('mousemove', onMouse);
      clearTimeout(resizeTimer);

      renderer.dispose();
      renderer.forceContextLoss();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      material.dispose();
      geometry.dispose();
      glRef.current = null;
    };
    // Only rebuild GPU context when shader-affecting props change.
    // Other props update uniforms in the lighter effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality, pillarRotation]);

  // ── Update uniforms reactively (NO GPU teardown) ──────────────────────────
  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;
    const u = gl.material.uniforms;
    u.uTopColor.value.copy(parseColor(topColor));
    u.uBottomColor.value.copy(parseColor(bottomColor));
    u.uIntensity.value = intensity;
    u.uGlowAmount.value = glowAmount;
    u.uPillarWidth.value = pillarWidth;
    u.uPillarHeight.value = pillarHeight;
    u.uNoiseIntensity.value = noiseIntensity;
    u.uInteractive.value = interactive;
  }, [topColor, bottomColor, intensity, glowAmount, pillarWidth, pillarHeight, noiseIntensity, interactive]);

  if (!isWebGLSupported()) {
    return (
      <div
        className={`w-full h-full absolute top-0 left-0 flex items-center justify-center bg-black/10 text-gray-500 text-sm ${className}`}
        style={{ mixBlendMode }}
      >
        WebGL not supported
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`w-full h-full absolute top-0 left-0 ${className}`} style={{ mixBlendMode }} />
  );
}
