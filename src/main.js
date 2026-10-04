import * as THREE from 'three';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createStage, CAMERA_DISTANCE } from './scene/stage.js';
import { buildStudio } from './scene/studio.js';
import { buildGlasses } from './scene/glasses.js';
import { bindScroll, rotationAt, smoothstep } from './motion/scroll.js';
import { playIntro } from './motion/intro.js';

const canvas = document.getElementById('stage');
const preloader = document.getElementById('preloader');
const preloaderBar = document.getElementById('preloader-bar');
const heroCopy = document.getElementById('hero-copy');
const reveal = document.getElementById('reveal');
const hero = document.getElementById('hero');

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lite = window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;

const state = {
  p: 0, // scroll progress through the hero, 0 → 1
  intro: { alpha: 0, scale: 0.92, z: -8, tilt: 0, copy: 0 },
};

// A reload (or a first visit) always starts at the top, with the glasses. They are
// skipped only when arriving from another page of the site: a link to a section
// ("/#catalog") or the browser's back button.
const RETURN_KEY = 'avnt:return';
const navigation = performance.getEntriesByType('navigation')[0]?.type ?? 'navigate';
const savedScroll = sessionStorage.getItem(RETURN_KEY);
const anchor = location.hash.length > 1 ? document.getElementById(location.hash.slice(1)) : null;
const direct =
  navigation === 'back_forward' ? savedScroll !== null : navigation === 'navigate' && !!anchor;

let done = false; // the glasses have played (or were skipped)

history.scrollRestoration = 'manual';
window.addEventListener('pagehide', () => {
  if (done) sessionStorage.setItem(RETURN_KEY, String(window.scrollY));
  else sessionStorage.removeItem(RETURN_KEY);
});

// the state the hero is left in once the glasses are gone
function showRevealed() {
  done = true;
  hero.classList.add('is-done');
  canvas.style.display = 'none';
  heroCopy.style.display = 'none';
  reveal.style.opacity = 1;
  reveal.style.visibility = 'visible';
  reveal.style.transform = 'none';
}

function enterDirect() {
  showRevealed();
  document.documentElement.classList.remove('is-locked');
  preloader.classList.add('is-done');
  const place = () =>
    window.scrollTo(0, navigation === 'back_forward' ? Number(savedScroll) : anchor.offsetTop);
  place();
  // layout still settles while fonts and photos arrive
  window.addEventListener('load', () => {
    place();
    ScrollTrigger.refresh();
  });
}

const progress = (v) => (preloaderBar.style.transform = `scaleX(${v})`);
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

async function init() {
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  window.scrollTo(0, 0);
  progress(0.15);

  const stage = createStage(canvas, { lite });
  const { renderer, scene, camera, view } = stage;

  // the lettering is drawn with the page font, so wait for it (but not forever)
  await Promise.race([
    document.fonts.load('500 96px Onest').then(() => document.fonts.ready),
    new Promise((r) => setTimeout(r, 2500)),
  ]);
  progress(0.4);
  await nextFrame();

  buildStudio(renderer, scene);
  progress(0.65);
  await nextFrame();

  const glasses = buildGlasses({
    anisotropy: renderer.capabilities.getMaxAnisotropy(),
  });
  scene.add(glasses.pivot);
  await renderer.compileAsync(scene, camera);
  progress(1);

  const D2R = THREE.MathUtils.DEG2RAD;
  let scrollTween = null;

  // The glasses play once per page load. When they have left, the scroll track
  // they used is removed, so the block they revealed becomes the top of the page
  // and scrolling back up does not bring them back.
  function finish() {
    const before = hero.offsetHeight;
    scrollTween.scrollTrigger.kill();
    scrollTween.kill();
    showRevealed();

    // keep what is on screen where it is while the page gets shorter
    window.scrollTo(0, Math.max(0, window.scrollY - (before - hero.offsetHeight)));
    ScrollTrigger.refresh();
    renderer.dispose();
  }
  const point = new THREE.Vector3();

  // horizontal extent of the silhouette on screen, in NDC (-1..1)
  function screenSpan() {
    glasses.pivot.updateMatrixWorld(true);
    camera.updateMatrixWorld();
    let min = Infinity;
    let max = -Infinity;
    for (const p of glasses.extents) {
      point.copy(p);
      glasses.model.localToWorld(point).project(camera);
      min = Math.min(min, point.x);
      max = Math.max(max, point.x);
    }
    return { centre: (min + max) / 2, width: max - min };
  }
  let lastCopy = -1;
  let lastReveal = -1;
  let lastAlpha = -1;

  function frame(time) {
    const t = time / 1000;
    const { p, intro } = state;
    const exit = smoothstep(0.8, 1, p);

    const idle = reduced ? 0 : 1 - smoothstep(0, 0.12, p);
    const wave = Math.sin(t * 0.7);
    glasses.pivot.rotation.y = rotationAt(p) * D2R;
    glasses.idle.rotation.y = idle * wave * D2R;
    glasses.idle.rotation.x = idle * -0.25 * (1 + Math.cos(t * 0.7)) * D2R + intro.tilt;

    const scale = view.fit * intro.scale * (1 - 0.15 * exit);
    glasses.pivot.scale.setScalar(scale);
    camera.position.z = CAMERA_DISTANCE * (1 - 0.05 * smoothstep(0, 0.6, p));
    // the object turns around its middle, which would push the front off to one
    // side; re-centre the silhouette, then add the exit drift
    glasses.pivot.position.set(0, 0, intro.z);
    let span = screenSpan();
    // three-quarter views are wider than the front; on narrow screens shrink
    // just enough to keep the whole object inside the viewport
    const limit = 2 * Math.min(0.92, view.share + 0.14);
    if (span.width > limit) {
      glasses.pivot.scale.setScalar((scale * limit) / span.width);
      span = screenSpan();
    }
    const recentre = -span.centre * 0.5 * view.width * (camera.position.z / CAMERA_DISTANCE);
    glasses.pivot.position.x = recentre + exit * 0.22 * view.width;

    const alpha = intro.alpha * (1 - smoothstep(0.88, 1, p));
    if (alpha !== lastAlpha) {
      canvas.style.opacity = alpha;
      lastAlpha = alpha;
    }

    const copy = intro.copy * (1 - smoothstep(0.03, 0.2, p));
    if (copy !== lastCopy) {
      heroCopy.style.opacity = copy;
      lastCopy = copy;
    }

    const shown = smoothstep(0.8, 0.97, p);
    if (shown !== lastReveal) {
      reveal.style.opacity = shown;
      reveal.style.visibility = shown > 0 ? 'visible' : 'hidden';
      reveal.style.transform = `translate3d(0, ${(1 - shown) * 40}px, 0)`;
      lastReveal = shown;
    }

    if (alpha > 0.001) renderer.render(scene, camera);

    const heroEnd = hero.offsetTop + hero.offsetHeight - window.innerHeight;
    if (scrollTween && p > 0.995 && window.scrollY >= heroEnd - 1) {
      finish();
      return;
    }
    requestAnimationFrame(frame);
  }

  // first frame is drawn behind the preloader so nothing pops in afterwards
  renderer.render(scene, camera);
  await nextFrame();
  requestAnimationFrame(frame);

  scrollTween = bindScroll(state, '#hero');
  window.scrollTo(0, 0); // the browser may have jumped while things were loading
  preloader.classList.add('is-done');
  playIntro(state, {
    reduced,
    onComplete: () => {
      document.documentElement.classList.remove('is-locked');
      ScrollTrigger.refresh();
    },
  });
}

if (direct) enterDirect();
else init();
