import { useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Triangle } from 'ogl';
import './Lightfall.css';

const MAX_COLORS = 8;

const hexToRGB = (hex) => {
  const value = hex.replace('#', '').padEnd(6, '0');
  return [
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
  ];
};

const prepColors = (input) => {
  const base = (input && input.length ? input : ['#A6C8FF', '#5227FF', '#FF9FFC']).slice(0, MAX_COLORS);
  const arr = [];

  for (let index = 0; index < MAX_COLORS; index += 1) {
    arr.push(hexToRGB(base[Math.min(index, base.length - 1)]));
  }

  const avg = [0, 0, 0];
  for (let index = 0; index < base.length; index += 1) {
    avg[0] += arr[index][0];
    avg[1] += arr[index][1];
    avg[2] += arr[index][2];
  }

  avg[0] /= base.length;
  avg[1] /= base.length;
  avg[2] /= base.length;

  return { arr, count: base.length, avg };
};

const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `
precision highp float;

uniform vec3 iResolution;
uniform vec2 iMouse;
uniform float iTime;

uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec3 uColor5;
uniform vec3 uColor6;
uniform vec3 uColor7;
uniform int uColorCount;

uniform vec3 uBgColor;
uniform vec3 uMouseColor;
uniform float uSpeed;
uniform int uStreakCount;
uniform float uStreakWidth;
uniform float uStreakLength;
uniform float uGlow;
uniform float uDensity;
uniform float uTwinkle;
uniform float uZoom;
uniform float uBgGlow;
uniform float uOpacity;
uniform float uMouseEnabled;
uniform float uMouseStrength;
uniform float uMouseRadius;

varying vec2 vUv;

vec3 palette(float h) {
  int count = uColorCount;
  if (count < 1) count = 1;
  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
  if (idx <= 0) return uColor0;
  if (idx == 1) return uColor1;
  if (idx == 2) return uColor2;
  if (idx == 3) return uColor3;
  if (idx == 4) return uColor4;
  if (idx == 5) return uColor5;
  if (idx == 6) return uColor6;
  return uColor7;
}

vec3 tanhv(vec3 x) {
  vec3 e = exp(-2.0 * x);
  return (1.0 - e) / (1.0 + e);
}

vec2 sceneC(vec2 frag, vec2 r) {
  vec2 p = (frag + frag - r) / r.x;
  float z = 0.0;
  float d = 1e3;
  vec4 o = vec4(0.0);
  for (int k = 0; k < 39; k++) {
    if (d <= 1e-4) break;
    o = z * normalize(vec4(p, uZoom, 0.0)) - vec4(0.0, 4.0, 1.0, 0.0) / 4.5;
    d = 1.0 - sqrt(length(o * o));
    z += d;
  }
  return vec2(o.x, atan(o.z, o.y));
}

void mainImage(out vec4 o, vec2 c) {
  vec2 r = iResolution.xy;
  vec2 uv0 = (c + c - r) / r.x;
  float t = 0.1 * iTime * uSpeed + 9.0;
  float angRings = max(1.0, floor(6.28318530718 * max(uDensity, 0.05) + 0.5));
  vec2 y = vec2(5e-3, 6.28318530718 / angRings);

  vec2 c0 = sceneC(c, r);
  vec2 cdx = sceneC(c + vec2(1.0, 0.0), r);
  vec2 cdy = sceneC(c + vec2(0.0, 1.0), r);
  vec2 dCx = cdx - c0;
  vec2 dCy = cdy - c0;
  dCx.y -= 6.28318530718 * floor(dCx.y / 6.28318530718 + 0.5);
  dCy.y -= 6.28318530718 * floor(dCy.y / 6.28318530718 + 0.5);
  vec2 fw = abs(dCx) + abs(dCy);
  c = c0;

  vec2 p = vec2(2.0, 1.0) * uv0 - (r / r.x) * vec2(0.0, 1.0);
  vec4 color = vec4(uBgColor * 90.0 * uBgGlow / (1e3 * dot(p, p) + 6.0), 0.0);

  float mGlow = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mN = (iMouse + iMouse - r) / r.x;
    float md = length(uv0 - mN);
    mGlow = exp(-md * md / max(uMouseRadius * uMouseRadius, 1e-4)) * uMouseStrength;
    color.rgb += uMouseColor * mGlow * 0.25;
  }

  float zr = 5e-4 * uStreakWidth;
  vec2 rr = vec2(max(length(fw), 1e-5));
  float tail = 19.0 / max(uStreakLength, 0.05);

  for (int m = 0; m < 16; m++) {
    if (m >= uStreakCount) break;
    float jf = float(m) + 1.0;
    float ic = fract(sin(dot(vec2(jf, floor(c.x / y.x + 0.5)), vec2(7.0, 11.0)) * 73.0));
    vec2 pp = c - (t + t * ic) * vec2(0.0, 1.0);
    pp -= floor(pp / y + 0.5) * y;
    float h = fract(8663.0 * ic);
    vec3 pal = palette(h);
    float weight = mix(1.5, 1.0 + sin(t + 7.0 * h + 4.0), uTwinkle);
    weight *= (1.0 + mGlow * 2.0);
    vec2 inner = vec2(length(max(pp, vec2(-1.0, 0.0))), length(pp) - zr) - zr;
    vec2 sm = vec2(1.0) - smoothstep(-rr, rr, inner);
    color.rgb += dot(sm, vec2(exp(tail * pp.y), 3.0)) * pal * weight;
    c.x += y.x / 8.0;
  }

  vec3 finalColor = sqrt(tanhv(max(color.rgb * uGlow - vec3(0.04, 0.08, 0.02), 0.0)));
  o = vec4(finalColor, uOpacity);
}

void main() {
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`;

export default function Lightfall({
  className,
  dpr,
  paused = false,
  colors = ['#A6C8FF', '#5227FF', '#FF9FFC'],
  backgroundColor = '#0A29FF',
  speed = 0.5,
  streakCount = 2,
  streakWidth = 1,
  streakLength = 1,
  glow = 1,
  density = 0.6,
  twinkle = 1,
  zoom = 3,
  backgroundGlow = 0.5,
  opacity = 1,
  mouseInteraction = true,
  mouseStrength = 0.5,
  mouseRadius = 1,
  mouseDampening = 0.15,
  mixBlendMode,
}) {
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const programRef = useRef(null);
  const meshRef = useRef(null);
  const geometryRef = useRef(null);
  const rendererRef = useRef(null);
  const mouseTargetRef = useRef([0, 0]);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const renderer = new Renderer({
      dpr: dpr ?? (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1),
      alpha: true,
      antialias: true,
    });
    rendererRef.current = renderer;

    const gl = renderer.gl;
    const canvas = gl.canvas;

    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    const { arr, count, avg } = prepColors(colors);

    const uniforms = {
      iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] },
      iMouse: { value: [0, 0] },
      iTime: { value: 0 },
      uColor0: { value: arr[0] },
      uColor1: { value: arr[1] },
      uColor2: { value: arr[2] },
      uColor3: { value: arr[3] },
      uColor4: { value: arr[4] },
      uColor5: { value: arr[5] },
      uColor6: { value: arr[6] },
      uColor7: { value: arr[7] },
      uColorCount: { value: count },
      uBgColor: { value: hexToRGB(backgroundColor) },
      uMouseColor: { value: avg },
      uSpeed: { value: speed },
      uStreakCount: { value: Math.max(1, Math.min(16, Math.round(streakCount))) },
      uStreakWidth: { value: streakWidth },
      uStreakLength: { value: streakLength },
      uGlow: { value: glow },
      uDensity: { value: density },
      uTwinkle: { value: twinkle },
      uZoom: { value: zoom },
      uBgGlow: { value: backgroundGlow },
      uOpacity: { value: opacity },
      uMouseEnabled: { value: mouseInteraction ? 1 : 0 },
      uMouseStrength: { value: mouseStrength },
      uMouseRadius: { value: mouseRadius },
    };

    const program = new Program(gl, { vertex, fragment, uniforms });
    programRef.current = program;

    const geometry = new Triangle(gl);
    geometryRef.current = geometry;

    const mesh = new Mesh(gl, { geometry, program });
    meshRef.current = mesh;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1];
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    const onPointerMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const scale = renderer.dpr || 1;
      const x = (event.clientX - rect.left) * scale;
      const y = (rect.height - (event.clientY - rect.top)) * scale;
      mouseTargetRef.current = [x, y];
      if (mouseDampening <= 0) {
        uniforms.iMouse.value = [x, y];
      }
    };

    if (mouseInteraction) {
      canvas.addEventListener('pointermove', onPointerMove);
    }

    const loop = (time) => {
      rafRef.current = requestAnimationFrame(loop);
      uniforms.iTime.value = time * 0.001;

      if (mouseDampening > 0) {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        const dt = (time - lastTimeRef.current) / 1000;
        lastTimeRef.current = time;
        const tau = Math.max(1e-4, mouseDampening);
        let factor = 1 - Math.exp(-dt / tau);
        if (factor > 1) factor = 1;
        const target = mouseTargetRef.current;
        const current = uniforms.iMouse.value;
        current[0] += (target[0] - current[0]) * factor;
        current[1] += (target[1] - current[1]) * factor;
      } else {
        lastTimeRef.current = time;
      }

      if (!paused && programRef.current && meshRef.current) {
        renderer.render({ scene: meshRef.current });
      }
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (mouseInteraction) canvas.removeEventListener('pointermove', onPointerMove);
      observer.disconnect();
      if (canvas.parentElement === container) {
        container.removeChild(canvas);
      }

      const callIfFn = (obj, key) => {
        if (obj && typeof obj[key] === 'function') {
          obj[key].call(obj);
        }
      };

      callIfFn(programRef.current, 'remove');
      callIfFn(geometryRef.current, 'remove');
      callIfFn(meshRef.current, 'remove');
      callIfFn(rendererRef.current, 'destroy');

      programRef.current = null;
      geometryRef.current = null;
      meshRef.current = null;
      rendererRef.current = null;
    };
  }, [
    dpr,
    paused,
    colors,
    backgroundColor,
    speed,
    streakCount,
    streakWidth,
    streakLength,
    glow,
    density,
    twinkle,
    zoom,
    backgroundGlow,
    opacity,
    mouseInteraction,
    mouseStrength,
    mouseRadius,
    mouseDampening,
  ]);

  return <div ref={containerRef} className={`lightfall-container ${className ?? ''}`.trim()} style={mixBlendMode ? { mixBlendMode } : undefined} />;
}