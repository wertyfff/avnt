import * as THREE from 'three';

export function createMaterials() {
  // polished black acetate
  const frame = new THREE.MeshPhysicalMaterial({
    color: 0x0a0a0b,
    roughness: 0.24,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  });

  const metal = new THREE.MeshStandardMaterial({
    color: 0xe2e3e5,
    metalness: 1,
    roughness: 0.4,
  });

  // Smoke-tinted lens. Kept as a plain transparent surface (no transmission pass):
  // the canvas is see-through, so the page itself is what shows behind the glass.
  const lens = new THREE.MeshPhysicalMaterial({
    color: 0x14171b,
    roughness: 0.03,
    metalness: 0,
    ior: 1.45,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: 2.2,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  return { frame, metal, lens };
}
