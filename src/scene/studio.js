import * as THREE from 'three';

function softbox(w, h, position, intensity) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(intensity, intensity, intensity),
      side: THREE.DoubleSide,
      toneMapped: false,
    })
  );
  mesh.position.set(...position);
  mesh.lookAt(0, 0, 0);
  return mesh;
}

// Product-shoot lighting without an HDRI file: a dark room with a few softboxes,
// baked into an environment map.
export function buildStudio(renderer, scene) {
  const room = new THREE.Scene();
  room.background = new THREE.Color(0x1a1a1c);

  room.add(softbox(14, 6, [0, 10, 7], 9)); // key: large, top-front
  room.add(softbox(3, 11, [-13, 2, 3], 3.2)); // left strip
  room.add(softbox(8, 8, [13, 0, 1], 1.5)); // right fill
  room.add(softbox(11, 3, [0, 6, -13], 5)); // rim
  room.add(softbox(16, 9, [0, -1, 15], 0.38)); // front wash
  room.add(softbox(22, 22, [0, -11, 0], 0.5)); // floor bounce

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(room, 0.03).texture;
  pmrem.dispose();
  room.traverse((o) => {
    if (o.isMesh) {
      o.geometry.dispose();
      o.material.dispose();
    }
  });

  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(5, 9, 12);
  scene.add(key);
}
