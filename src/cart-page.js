import { PRODUCTS, formatPrice, productImage, productUrl } from './products.js';
import { getCart, setQty, removeItem, cartCount } from './cart.js';

const list = document.getElementById('cart-list');
const empty = document.getElementById('cart-empty');
const layout = document.getElementById('cart-layout');
const total = document.getElementById('cart-count');
const pieces = document.getElementById('cart-pieces');
const checkout = document.getElementById('cart-checkout');
const subtotal = document.getElementById('cart-subtotal');
const grand = document.getElementById('cart-total');

const pad = (n) => String(n).padStart(2, '0');

// Orders are taken in Telegram: the button opens the chat with the bag already
// written out as a message, ready to send.
const TELEGRAM = 'kiwnt1';

function orderLink(items, sum) {
  const lines = items.map((item, i) => {
    const product = PRODUCTS.find((p) => p.id === item.id);
    const cost = formatPrice(product.price * item.qty);
    return `${i + 1}. ${product.name} (${product.code}) — размер ${item.size}, ${item.qty} шт. — ${cost}`;
  });
  const text = ['Здравствуйте! Хочу оформить заказ AVNT:', ...lines, `Итого: ${formatPrice(sum)}`].join('\n');
  return `https://t.me/${TELEGRAM}?text=${encodeURIComponent(text)}`;
}

function row(item) {
  const product = PRODUCTS.find((p) => p.id === item.id);
  const focus = product.focus ? ` style="object-position: ${product.focus}"` : '';
  return `
    <li class="cart__row" data-id="${item.id}" data-size="${item.size}">
      <a class="cart__thumb ph" href="${productUrl(product)}">
        <img src="${productImage(product)}" alt="${product.name}"${focus} />
      </a>
      <div class="cart__info">
        <a class="cart__name" href="${productUrl(product)}">${product.name}</a>
        <p class="mono">AVNT 01 / ${product.code}</p>
        <p class="mono">Size / ${item.size}</p>
        <p class="mono">Edition of ${product.edition}</p>
      </div>
      <div class="cart__qty mono">
        <button type="button" data-step="-1" aria-label="Меньше">−</button>
        <span>${pad(item.qty)}</span>
        <button type="button" data-step="1" aria-label="Больше">+</button>
      </div>
      <p class="cart__price">${formatPrice(product.price * item.qty)}</p>
      <button class="cart__remove mono" type="button">Remove</button>
    </li>`;
}

function render() {
  const items = getCart();
  const count = cartCount();
  layout.hidden = items.length === 0;
  empty.hidden = items.length > 0;
  total.textContent = pad(count);
  pieces.textContent = pad(count);
  const sum = items.reduce((s, item) => s + PRODUCTS.find((p) => p.id === item.id).price * item.qty, 0);
  subtotal.textContent = formatPrice(sum);
  grand.textContent = formatPrice(sum); // delivery is added at checkout
  list.innerHTML = items.map(row).join('');
  checkout.href = orderLink(items, sum);
}

list.addEventListener('click', (e) => {
  const line = e.target.closest('.cart__row');
  if (!line) return;
  const { id, size } = line.dataset;

  if (e.target.closest('.cart__remove')) {
    removeItem(id, size);
  } else if (e.target.dataset.step) {
    const current = getCart().find((item) => item.id === id && item.size === size);
    setQty(id, size, current.qty + Number(e.target.dataset.step));
  } else {
    return;
  }
  render();
});

window.addEventListener('storage', render);
render();
