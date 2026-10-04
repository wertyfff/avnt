import * as THREE from 'three';
import { FRAME_WIDTH, CENTER_DEPTH } from './glasses.js';

export const CAMERA_DISTANCE = 46;
const FOV = 35;

const clamp01 = (v) => Math.min(1, Math.max(0, v));

export function createStage(canvas, { lite = false } = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 1, 200);
  camera.position.set(0, 0, CAMERA_DISTANCE);

  const view = { width: 1, fit: 1, share: 0.62 };

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, lite ? 1.5 : 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    // share of the viewport width the front should take: 62% desktop → 84% phone,
    // blended continuously so resizing never jumps
    view.share = 0.62 + 0.22 * (1 - clamp01((w - 600) / 500));
    const k = 2 * view.share * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * camera.aspect;
    view.fit = (k * CAMERA_DISTANCE) / (FRAME_WIDTH + k * CENTER_DEPTH);
    view.width = 2 * CAMERA_DISTANCE * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * camera.aspect;
  }

  resize();
  window.addEventListener('resize', resize);

  return { renderer, scene, camera, view, resize };
}
