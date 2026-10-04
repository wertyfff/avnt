// Mobile menu. On narrow screens the header collapses to "Меню"; this builds the
// full-screen panel it opens. One script for every page, so the markup lives here.

const TELEGRAM = 'https://t.me/kiwnt1';

const LINKS = [
  ['Каталог', './#catalog'],
  ['О бренде', './#about'],
  ['Found', './#store'],
  ['Корзина', 'cart.html'],
  ['Доставка', 'info.html'],
];

const button = document.querySelector('.header__menu');

if (button) {
  const menu = document.createElement('div');
  menu.className = 'menu';
  menu.setAttribute('aria-hidden', 'true');
  menu.innerHTML = `
    <div class="menu__top">
      <a class="menu__brand" href="./">AVNT</a>
      <button class="menu__close" type="button">Закрыть</button>
    </div>
    <nav class="menu__links">
      ${LINKS.map(([label, href]) => `<a href="${href}">${label}</a>`).join('')}
    </nav>
    <div class="menu__foot">
      <a href="${TELEGRAM}" target="_blank" rel="noopener">Telegram / @kiwnt1</a>
      <span>Before everyone.</span>
    </div>`;
  document.body.appendChild(menu);

  const bag = menu.querySelector('a[href="cart.html"]');

  const set = (open) => {
    // the bag count is kept on the header link by cart.js
    const count = document.querySelector('.header__cart')?.textContent.match(/\d+/)?.[0] ?? '0';
    bag.textContent = `Корзина (${count})`;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.documentElement.classList.toggle('menu-open', open);
  };

  button.addEventListener('click', () => set(true));
  menu.querySelector('.menu__close').addEventListener('click', () => set(false));
  // links to a section of the page that is already open only need the panel gone
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
  window.addEventListener('keydown', (e) => e.key === 'Escape' && set(false));
}
