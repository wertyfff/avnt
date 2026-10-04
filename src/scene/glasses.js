import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createMaterials } from './materials.js';
import { createEngraving } from './engraving.js';

// Units are roughly centimetres: the front is ~14 wide.
export const FRAME_WIDTH = 14.4;
// Distance from the front to the centre of the whole object (temples included);
// the model is shifted by this so it turns around its middle like on a turntable.
export const CENTER_DEPTH = 8;

const DEPTH = 0.42; // front thickness
const BEVEL = 0.1;
const WRAP = 0.0165; // face-form curvature: z -= WRAP * x²
const TEMPLE_T = 0.3;
const TEMPLE_BEVEL = 0.07;
const TEMPLE_X = 6.84;
const TEMPLE_Y = 2.03;
const TOE_IN = 0.055;

// Closed outline from [x, y, cornerRadius] corners. Straight runs are
// subdivided so the outline can be bent afterwards.
function roundedOutline(corners, step = 0.22, arcSteps = 12) {
  const n = corners.length;
  const arcs = corners.map(([px, py, r], i) => {
    const p = new THREE.Vector2(px, py);
    const a = new THREE.Vector2(corners[(i - 1 + n) % n][0], corners[(i - 1 + n) % n][1]).sub(p);
    const b = new THREE.Vector2(corners[(i + 1) % n][0], corners[(i + 1) % n][1]).sub(p);
    const d = Math.min(r, a.length() * 0.5, b.length() * 0.5);
    if (d < 1e-4) return [p];
    const start = p.clone().addScaledVector(a.normalize(), d);
    const end = p.clone().addScaledVector(b.normalize(), d);
    const pts = [];
    for (let k = 0; k <= arcSteps; k++) {
      const t = k / arcSteps;
      const u = 1 - t;
      pts.push(
        new THREE.Vector2(
          u * u * start.x + 2 * u * t * p.x + t * t * end.x,
          u * u * start.y + 2 * u * t * p.y + t * t * end.y
        )
      );
    }
    return pts;
  });

  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(...arcs[i]);
    const from = arcs[i][arcs[i].length - 1];
    const to = arcs[(i + 1) % n][0];
    const segs = Math.ceil(from.distanceTo(to) / step);
    for (let k = 1; k < segs; k++) out.push(from.clone().lerp(to, k / segs));
  }
  return out;
}

const mirrorX = (pts) => pts.map((p) => new THREE.Vector2(-p.x, p.y)).reverse();

// Smooth normals across the bevel, but keep the two flat faces (|z| = capZ)
// exactly flat: averaged normals there show up as streaks in the gloss.
function smooth(geometry, capZ) {
  geometry.deleteAttribute('uv');
  geometry.deleteAttribute('normal');
  const merged = mergeVertices(geometry, 1e-4);
  merged.computeVertexNormals();
  const pos = merged.attributes.position;
  const normal = merged.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    if (Math.abs(z) > capZ - 1e-3) normal.setXYZ(i, 0, 0, Math.sign(z));
  }
  return merged;
}

const _n = new THREE.Vector3();

// Bend around the face; normals follow the same deformation analytically.
function wrap(geometry) {
  const pos = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    pos.setZ(i, pos.getZ(i) - WRAP * x * x);
    _n.fromBufferAttribute(normal, i);
    _n.x += 2 * WRAP * x * _n.z;
    _n.normalize();
    normal.setXYZ(i, _n.x, _n.y, _n.z);
  }
  return geometry;
}

const wrapZ = (x) => -WRAP * x * x;
const wrapAngle = (x) => Math.atan(2 * WRAP * x);

// ---- front ----

const LENS_CORNERS = [
  [0.98, 1.84, 0.75],
  [6.14, 2.04, 0.85],
  [5.7, -2.0, 1.5],
  [1.46, -2.03, 1.35],
];

function buildFront(material) {
  const half = [
    [0.8, 2.36, 0.5],
    [7.12, 2.66, 0.3],
    [7.14, 1.5, 0.3],
    [6.62, 1.1, 0.5],
    [6.16, -2.46, 1.9],
    [1.2, -2.48, 1.6],
    [0.55, 0.45, 0.5],
  ];
  const corners = [
    [0, 1.8, 0.6],
    ...half,
    [0, 0.9, 0.5],
    ...half.map(([x, y, r]) => [-x, y, r]).reverse(),
  ];

  const lens = roundedOutline(LENS_CORNERS);
  const shape = new THREE.Shape(roundedOutline(corners));
  shape.holes.push(new THREE.Path(lens), new THREE.Path(mirrorX(lens)));

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: DEPTH,
    bevelEnabled: true,
    bevelThickness: BEVEL,
    bevelSize: 0.06,
    bevelSegments: 5,
    curveSegments: 1,
  });
  geometry.translate(0, 0, -DEPTH / 2);
  return new THREE.Mesh(wrap(smooth(geometry, DEPTH / 2 + BEVEL)), material);
}

// Slightly domed lens surface built as rings between the centre and the outline.
function buildLens(material, side) {
  const outline = roundedOutline(LENS_CORNERS, 0.3);
  const c = outline.reduce((s, p) => s.add(p), new THREE.Vector2()).divideScalar(outline.length);
  const m = outline.length;
  const rings = 10;
  const grow = 1.035; // tuck the edge inside the rim

  const positions = [0, 0, 0];
  for (let r = 1; r <= rings; r++) {
    const s = (r / rings) * grow;
    for (const p of outline) {
      const u = (p.x - c.x) * s;
      const v = (p.y - c.y) * s;
      positions.push(u * side, v, -WRAP * (u * u + v * v));
    }
  }

  const index = [];
  // mirroring flips the winding, so the left lens is indexed the other way round
  const tri = (a, b, c) => (side > 0 ? index.push(a, b, c) : index.push(a, c, b));
  for (let j = 0; j < m; j++) tri(0, 1 + j, 1 + ((j + 1) % m));
  for (let r = 1; r < rings; r++) {
    const a = 1 + (r - 1) * m;
    const b = 1 + r * m;
    for (let j = 0; j < m; j++) {
      const j2 = (j + 1) % m;
      tri(a + j, b + j, b + j2);
      tri(a + j, b + j2, a + j2);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(geometry, material);
  const x = c.x * side;
  // sits close to the front face, like a lens in its groove
  mesh.position.set(x, c.y, wrapZ(x) + 0.16);
  mesh.rotation.y = wrapAngle(x);
  mesh.renderOrder = 2;
  return mesh;
}

// ---- temples ----

function buildTempleGeometry() {
  // side profile: x runs back from the hinge, y is height
  const profile = roundedOutline([
    [0, 0.52, 0.12],
    [9.8, 0.3, 3],
    [14.2, -1.75, 0.25],
    [13.75, -2.1, 0.25],
    [9.6, -0.28, 3],
    [0, -0.52, 0.12],
  ]);
  const geometry = new THREE.ExtrudeGeometry(new THREE.Shape(profile), {
    depth: TEMPLE_T,
    bevelEnabled: true,
    bevelThickness: TEMPLE_BEVEL,
    bevelSize: TEMPLE_BEVEL,
    bevelSegments: 4,
    curveSegments: 1,
  });
  geometry.translate(0, 0, -TEMPLE_T / 2);
  const smoothed = smooth(geometry, TEMPLE_T / 2 + TEMPLE_BEVEL);
  smoothed.rotateY(Math.PI / 2); // length now runs along -z
  return smoothed;
}

function buildTemple(side, geometry, materials) {
  const group = new THREE.Group();
  const backOfFront = wrapZ(TEMPLE_X) - DEPTH / 2 - BEVEL;

  // acetate return of the end piece
  const endPiece = new THREE.Mesh(new RoundedBoxGeometry(0.5, 1.14, 0.8, 4, 0.1), materials.frame);
  endPiece.position.set(side * TEMPLE_X, TEMPLE_Y, backOfFront - 0.2);
  endPiece.rotation.y = wrapAngle(side * TEMPLE_X);

  group.position.set(side * TEMPLE_X, TEMPLE_Y, backOfFront - 0.62);
  group.rotation.y = side * TOE_IN;

  group.add(new THREE.Mesh(geometry, materials.frame));

  // plain metal sleeve at the hinge
  const sleeve = new THREE.Mesh(new RoundedBoxGeometry(0.58, 1.16, 1.25, 4, 0.07), materials.metal);
  sleeve.position.set(0, 0, -1.0);
  group.add(sleeve);

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.86, 20), materials.metal);
  barrel.position.set(-side * 0.2, 0, 0.02);
  group.add(barrel);

  return [endPiece, group];
}

function buildRivets(material) {
  const geometry = new THREE.CylinderGeometry(0.085, 0.085, 0.06, 24);
  geometry.rotateX(Math.PI / 2);
  const rivets = [];
  for (const side of [-1, 1]) {
    for (const rx of [6.46, 6.82]) {
      const x = side * rx;
      const rivet = new THREE.Mesh(geometry, material);
      rivet.position.set(x, 2.32, wrapZ(x) + DEPTH / 2 + BEVEL);
      rivet.rotation.y = wrapAngle(x);
      rivets.push(rivet);
    }
  }
  return rivets;
}

export function buildGlasses({ engravingText = 'AVNT', anisotropy = 1 } = {}) {
  const materials = createMaterials();
  const model = new THREE.Group();

  model.add(buildFront(materials.frame));
  model.add(buildLens(materials.lens, 1), buildLens(materials.lens, -1));
  model.add(...buildRivets(materials.metal));

  const templeGeometry = buildTempleGeometry();
  const [leftEnd, left] = buildTemple(-1, templeGeometry, materials);
  const [rightEnd, right] = buildTemple(1, templeGeometry, materials);
  model.add(leftEnd, left, rightEnd, right);

  // lettering on the outer face of the temple that faces the camera in profile
  const engraving = createEngraving(engravingText, { anisotropy });
  engraving.rotation.y = -Math.PI / 2;
  engraving.position.set(-(TEMPLE_T / 2 + TEMPLE_BEVEL + 0.004), 0, -6.2);
  left.add(engraving);

  model.position.z = CENTER_DEPTH;

  // pivot: scroll rotation / idle: breathing / model: geometry
  const idle = new THREE.Group();
  idle.add(model);
  const pivot = new THREE.Group();
  pivot.add(idle);

  // outermost points of the silhouette, used to keep it centred while it turns
  const extents = [
    new THREE.Vector3(-FRAME_WIDTH / 2, 0, 0),
    new THREE.Vector3(FRAME_WIDTH / 2, 0, 0),
    new THREE.Vector3(-6.1, 0, -16.4),
    new THREE.Vector3(6.1, 0, -16.4),
  ];

  return { pivot, idle, model, extents };
}
