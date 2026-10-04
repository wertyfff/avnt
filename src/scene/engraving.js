import * as THREE from 'three';

const TEX_W = 2048;
const TEX_H = 128;

// Foil-stamped lettering for the temple: text is drawn to a canvas and used as
// the alpha of a thin metallic plane lying on the temple surface.
export function createEngraving(text, { width = 8, anisotropy = 1 } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  ctx.fillStyle = '#fff';
  ctx.font = '500 96px Onest, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '44px';
  ctx.fillText(text.toUpperCase(), TEX_W / 2 + 22, TEX_H / 2 + 5);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = anisotropy;

  const material = new THREE.MeshStandardMaterial({
    color: 0xdcdcde,
    metalness: 1,
    roughness: 0.32,
    alphaMap: texture,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  });

  const height = width * (TEX_H / TEX_W);
  return new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
}
