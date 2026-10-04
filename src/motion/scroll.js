import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// scroll progress → rotationY in degrees
const KEYS = [
  [0, 0],
  [0.2, 15],
  [0.5, 40],
  [0.7, 70],
  [0.88, 88],
  [1, 90],
];

const slope = (i) => (KEYS[i + 1][1] - KEYS[i][1]) / (KEYS[i + 1][0] - KEYS[i][0]);
const TANGENTS = KEYS.map((_, i) => {
  if (i === 0) return slope(0);
  if (i === KEYS.length - 1) return 0;
  return (slope(i - 1) + slope(i)) / 2;
});

// smooth curve through the keyframes, so the turn has no velocity kinks
export function rotationAt(p) {
  const x = Math.min(1, Math.max(0, p));
  let i = 0;
  while (i < KEYS.length - 2 && x > KEYS[i + 1][0]) i++;
  const [x0, y0] = KEYS[i];
  const [x1, y1] = KEYS[i + 1];
  const h = x1 - x0;
  const t = (x - x0) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * y0 +
    (t3 - 2 * t2 + t) * h * TANGENTS[i] +
    (-2 * t3 + 3 * t2) * y1 +
    (t3 - t2) * h * TANGENTS[i + 1]
  );
}

export const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Scroll position is the animation progress: state.p follows the page, both ways.
export function bindScroll(state, trigger) {
  return gsap.to(state, {
    p: 1,
    ease: 'none',
    scrollTrigger: {
      trigger,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.9,
      invalidateOnRefresh: false,
    },
  });
}
