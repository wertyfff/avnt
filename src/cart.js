import { PRODUCTS } from './products.js';

// The bag lives in localStorage so it survives page changes and reloads.
// Shape: [{ id, size, qty }]

const KEY = 'avnt:bag';

export function getCart() {
  try {
    const items = JSON.parse(localStorage.getItem(KEY)) ?? [];
    // drop anything that no longer matches a product
    return items.filter((item) => PRODUCTS.some((p) => p.id === item.id) && item.qty > 0);
  } catch {
    return [];
  }
}

function save(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
  syncBadge();
}

const find = (items, id, size) => items.find((item) => item.id === id && item.size === size);
// a piece can't be ordered beyond its edition
const limit = (id) => PRODUCTS.find((p) => p.id === id).edition;

export function addItem(id, size) {
  const items = getCart();
  const line = find(items, id, size);
  if (line) line.qty = Math.min(line.qty + 1, limit(id));
  else items.push({ id, size, qty: 1 });
  save(items);
}

export function setQty(id, size, qty) {
  const items = getCart();
  const line = find(items, id, size);
  if (!line) return;
  line.qty = Math.min(Math.max(qty, 0), limit(id));
  save(items.filter((item) => item.qty > 0));
}

export const removeItem = (id, size) => setQty(id, size, 0);

export const cartCount = () => getCart().reduce((sum, item) => sum + item.qty, 0);

// header link: "Корзина (n)" on every page
export function syncBadge() {
  document.querySelectorAll('.header__cart').forEach((link) => {
    link.textContent = `Корзина (${cartCount()})`;
    link.setAttribute('href', 'cart.html');
  });
}

syncBadge();
// keep other open tabs in step
window.addEventListener('storage', (e) => {
  if (e.key === KEY) syncBadge();
});
