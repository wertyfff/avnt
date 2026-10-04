import gsap from 'gsap';

// Entrance: glasses arrive from a little depth, then one slow "breath".
export function playIntro(state, { reduced = false, onComplete } = {}) {
  const { intro } = state;

  if (reduced) {
    Object.assign(intro, { alpha: 1, scale: 1, z: 0, tilt: 0, copy: 1 });
    onComplete?.();
    return null;
  }

  return gsap
    .timeline({ onComplete })
    .to(intro, { alpha: 1, duration: 0.7, ease: 'power2.out' }, 0.3)
    .to(intro, { scale: 1, z: 0, duration: 0.9, ease: 'power3.out' }, 0.3)
    .to(intro, { z: 1.4, tilt: -0.035, duration: 0.4, ease: 'sine.inOut' }, 1.2)
    .to(intro, { z: 0, tilt: 0, duration: 0.5, ease: 'sine.inOut' }, 1.6)
    .to(intro, { copy: 1, duration: 0.9, ease: 'power1.out' }, 1.1);
}
