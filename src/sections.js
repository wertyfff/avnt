import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Motion for everything below the hero. The hero has its own code in main.js.

gsap.registerPlugin(ScrollTrigger);

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover)').matches;
const EASE = 'power3.out';

// ---- ticker: drifts on its own, speeds up and changes direction with the scroll ----
function initTicker() {
  const track = document.querySelector('.ticker__track');
  if (!track) return;
  const group = track.firstElementChild;
  for (let i = 0; i < 3; i++) track.appendChild(group.cloneNode(true));
  if (reduced) return;

  let x = 0;
  let dir = -1;
  let lastY = window.scrollY;
  let boost = 0;

  gsap.ticker.add((_, dt) => {
    const y = window.scrollY;
    const dy = y - lastY;
    lastY = y;
    if (dy !== 0) dir = dy > 0 ? -1 : 1;
    boost += (Math.min(Math.abs(dy), 80) * 0.22 - boost) * 0.12;

    const w = group.offsetWidth;
    x += dir * (0.55 + boost) * (dt / 16.7);
    if (x <= -w) x += w;
    if (x > 0) x -= w;
    track.style.transform = `translate3d(${x}px, 0, 0)`;
  });
}

// ---- masked headline lines ----
function initLines() {
  gsap.utils.toArray('[data-lines]').forEach((el) => {
    gsap.from(el.querySelectorAll('.line > span'), {
      yPercent: 108,
      duration: 1.15,
      ease: 'power4.out',
      stagger: 0.09,
      scrollTrigger: { trigger: el, start: 'top 86%' },
    });
  });
}

// ---- generic fade-up, staggered per group ----
function initReveals() {
  gsap.set('[data-reveal]', { opacity: 0, y: 28 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%',
    once: true,
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: EASE, stagger: 0.08, overwrite: true }),
  });
}

// ---- placeholders drift inside their frames ----
function initParallax() {
  gsap.utils.toArray('[data-parallax]').forEach((frame) => {
    gsap.fromTo(
      frame.firstElementChild,
      { yPercent: -9 },
      {
        yPercent: 9,
        ease: 'none',
        scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );
  });

  // media frames open like a shutter
  gsap.utils.toArray('[data-unveil]').forEach((frame) => {
    gsap.from(frame, {
      clipPath: 'inset(100% 0% 0% 0%)',
      duration: 1.4,
      ease: 'power4.inOut',
      scrollTrigger: { trigger: frame, start: 'top 88%' },
    });
  });
}

// ---- campaign photo: no hover on touch screens, so the two frames swap every 3 s ----
function initCampaign() {
  const media = document.querySelector('.early__media');
  if (!media || canHover) return;
  setInterval(() => media.classList.toggle('is-alt'), 3000);
}

// ---- manifesto: each line fills with light as it passes through the viewport ----
function initManifesto() {
  gsap.utils.toArray('.manifesto__line').forEach((line) => {
    gsap.fromTo(
      line,
      { '--fill': '0%' },
      {
        '--fill': '100%',
        ease: 'none',
        scrollTrigger: { trigger: line, start: 'top 82%', end: 'top 38%', scrub: 0.4 },
      }
    );
  });
}

// ---- edition numbers count up ----
function initCounters() {
  gsap.utils.toArray('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    const value = { n: 0 };
    gsap.to(value, {
      n: target,
      duration: 1.6,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 92%' },
      onUpdate: () => (el.textContent = Math.round(value.n)),
    });
  });
}

// ---- found: each city has a photo ----
// With a mouse it rides along with the cursor over the list; on touch screens a
// tap on a city opens the photo under it.
function initFound() {
  const list = document.querySelector('.found__list');
  const preview = document.querySelector('.found__preview');
  if (!list || !preview) return;
  const rows = [...list.querySelectorAll('.found__row')];

  if (!canHover) {
    rows.forEach((row) => {
      row.addEventListener('click', () => {
        if (!row.querySelector('.found__shot')) {
          const shot = document.createElement('img');
          shot.className = 'found__shot';
          shot.src = row.dataset.img;
          shot.alt = `AVNT — ${row.dataset.city}`;
          shot.style.objectPosition = row.dataset.pos;
          row.appendChild(shot);
        }
        const open = !row.classList.contains('is-open');
        rows.forEach((r) => r.classList.toggle('is-open', r === row && open));
      });
    });
    return;
  }

  const image = preview.querySelector('img');
  const label = preview.querySelector('span');
  rows.forEach((row) => (new Image().src = row.dataset.img)); // no blank frame on first hover

  const moveX = gsap.quickTo(preview, 'x', { duration: 0.6, ease: EASE });
  const moveY = gsap.quickTo(preview, 'y', { duration: 0.6, ease: EASE });

  list.addEventListener('mousemove', (e) => {
    moveX(e.clientX);
    moveY(e.clientY);
  });
  list.addEventListener('mouseenter', (e) => {
    gsap.set(preview, { x: e.clientX, y: e.clientY });
    gsap.to(preview, { opacity: 1, scale: 1, duration: 0.5, ease: EASE });
  });
  list.addEventListener('mouseleave', () =>
    gsap.to(preview, { opacity: 0, scale: 0.9, duration: 0.4, ease: 'power2.out' })
  );
  rows.forEach((row) =>
    row.addEventListener('mouseenter', () => {
      image.src = row.dataset.img;
      image.style.objectPosition = row.dataset.pos;
      label.textContent = `Found — ${row.dataset.city}`;
    })
  );
}

// ---- footer: the mark rises as the page ends, local time keeps ticking ----
function initFooter() {
  const mark = document.querySelector('.foot__mark');
  if (mark && !reduced) {
    gsap.from(mark, {
      yPercent: 38,
      ease: 'none',
      scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
    });
  }

  const clock = document.getElementById('clock');
  if (!clock) return;
  const format = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const tick = () => (clock.textContent = format.format(new Date()));
  tick();
  setInterval(tick, 1000);
}

initTicker();
initCampaign();
initFound();
initFooter();
if (!reduced) {
  initLines();
  initReveals();
  initParallax();
  initManifesto();
  initCounters();
}
