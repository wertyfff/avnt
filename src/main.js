import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Decides how the home page opens: with the 3D glasses, or straight on the block
// they reveal. The scene itself is in hero.js and is only loaded when it plays.

const canvas = document.getElementById('stage');
const preloader = document.getElementById('preloader');
const preloaderBar = document.getElementById('preloader-bar');
const heroCopy = document.getElementById('hero-copy');
const reveal = document.getElementById('reveal');
const hero = document.getElementById('hero');

// Phones skip the glasses: the first screen is the revealed block.
const phone = window.matchMedia('(max-width: 760px)').matches;

// On larger screens a reload (or a first visit) always starts at the top, with the
// glasses. They are skipped only when arriving from another page of the site: a
// link to a section ("./#catalog") or the browser's back button.
const RETURN_KEY = 'avnt:return';
const navigation = performance.getEntriesByType('navigation')[0]?.type ?? 'navigate';
const savedScroll = sessionStorage.getItem(RETURN_KEY);
const anchor = location.hash.length > 1 ? document.getElementById(location.hash.slice(1)) : null;
const returning =
  navigation === 'back_forward' ? savedScroll !== null : navigation === 'navigate' && !!anchor;

let done = false; // the glasses have played (or were skipped)

history.scrollRestoration = 'manual';
window.addEventListener('pagehide', () => {
  if (done) sessionStorage.setItem(RETURN_KEY, String(window.scrollY));
  else sessionStorage.removeItem(RETURN_KEY);
});

const stripHash = () => {
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
};

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

// open without the glasses, at the place the visitor was heading for
function enterDirect() {
  showRevealed();
  document.documentElement.classList.remove('is-locked');
  preloader.classList.add('is-done');

  if (!returning) stripHash(); // a reload starts from the top
  const place = () => {
    if (!returning) return window.scrollTo(0, 0);
    window.scrollTo(0, navigation === 'back_forward' ? Number(savedScroll) : anchor.offsetTop);
  };
  place();
  // layout still settles while fonts and photos arrive
  window.addEventListener('load', () => {
    place();
    ScrollTrigger.refresh();
  });
}

async function enterWithGlasses() {
  stripHash();
  window.scrollTo(0, 0);
  const { startHero } = await import('./hero.js');
  startHero({ canvas, preloader, preloaderBar, heroCopy, reveal, hero, showRevealed });
}

if (returning || phone) enterDirect();
else enterWithGlasses();
