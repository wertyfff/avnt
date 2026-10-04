import {
  DEFAULT_VIEWS,
  DELIVERY,
  PRODUCTS,
  formatPrice,
  productImage,
  productUrl,
} from './products.js';
import { addItem } from './cart.js';

// Fills the product template from ?id=…; must run before sections.js so the
// rendered elements get the same scroll reveals as the rest of the site.

const id = new URLSearchParams(location.search).get('id');
const product = PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
const $ = (selector) => document.querySelector(selector);

document.title = `${product.name} — AVNT`;
$('#pdp-code').textContent = `AVNT 01 / ${product.code}`;
$('#pdp-name').textContent = product.name;
$('#pdp-edition').textContent = `${product.edition} pcs / numbered`;
$('#pdp-material').textContent = product.material;
$('#pdp-fit').textContent = product.fit;
$('#pdp-price').textContent = formatPrice(product.price);
$('#pdp-about').textContent = product.details;
$('#pdp-care').textContent = product.care;
$('#pdp-delivery').textContent = DELIVERY;

// ---- size chart ----
const guide = $('#pdp-guide');
const guideToggle = $('#pdp-guide-toggle');
guide.innerHTML =
  `<tr><th>Size</th>${product.guide.cols.map((c) => `<th>${c}, cm</th>`).join('')}</tr>` +
  Object.entries(product.guide.rows)
    .map(([size, values]) => `<tr data-size="${size}"><td>${size}</td>${values.map((v) => `<td>${v}</td>`).join('')}</tr>`)
    .join('');
guideToggle.addEventListener('click', () => {
  guide.hidden = !guide.hidden;
  guideToggle.textContent = guide.hidden ? 'Size guide +' : 'Size guide –';
});
$('#pdp-index').textContent = `${product.index} / 0${PRODUCTS.length}`;

// ---- gallery ----
// Each tile is a view: one of the piece's photos, optionally zoomed into a part of
// it. Clicking the main photo zooms into the point that was clicked.
const main = $('.pdp__main');
const mainImage = $('#pdp-image');
const view = $('#pdp-view');
const details = $('#pdp-details');
const views = product.views ?? DEFAULT_VIEWS;

const crop = (img, { zoom, origin }) => {
  img.style.transformOrigin = origin;
  img.style.transform = `scale(${zoom})`;
};

details.style.setProperty('--tiles', views.length);
details.innerHTML = views
  .map(
    (v, i) => `
      <button class="pdp__detail ph" type="button" aria-label="${v.label}" title="${v.label}">
        <img src="${productImage(product, v.image)}" alt="" />
      </button>`
  )
  .join('');
const tiles = [...details.children];

mainImage.alt = product.name;
if (product.focus) mainImage.style.objectPosition = product.focus;
tiles.forEach((tile, i) => {
  const img = tile.querySelector('img');
  if (product.focus) img.style.objectPosition = product.focus;
  crop(img, views[i]);
});

let current = -1;
let free = false; // zoomed by clicking the photo rather than a tile

function show(index, { wipe = true } = {}) {
  if (index === current && !free) return;
  current = index;
  free = false;
  main.classList.remove('is-zoomed');
  tiles.forEach((t, i) => t.classList.toggle('is-active', i === index));
  view.textContent = views[index].label;
  const src = productImage(product, views[index].image);
  if (mainImage.getAttribute('src') !== src) mainImage.src = src;
  crop(mainImage, views[index]);
  if (!wipe) return;
  main.classList.remove('is-switching');
  void main.offsetWidth; // restart the wipe
  main.classList.add('is-switching');
}

show(0, { wipe: false });

tiles.forEach((tile, i) => {
  tile.addEventListener('click', () => show(i));
  tile.addEventListener('mouseenter', () => show(i));
});

main.addEventListener('click', (e) => {
  if (free) {
    show(current, { wipe: false });
    return;
  }
  const box = main.getBoundingClientRect();
  const x = ((e.clientX - box.left) / box.width) * 100;
  const y = ((e.clientY - box.top) / box.height) * 100;
  free = true;
  main.classList.add('is-zoomed');
  tiles.forEach((t) => t.classList.remove('is-active'));
  view.textContent = 'Zoom';
  crop(mainImage, { zoom: 2.8, origin: `${x.toFixed(1)}% ${y.toFixed(1)}%` });
});

// ---- size + bag ----
const sizes = [...document.querySelectorAll('.pdp__size')];
const add = $('.pdp__add');
const hint = $('#pdp-hint');
let size = null;

sizes.forEach((button) =>
  button.addEventListener('click', () => {
    size = button.textContent;
    sizes.forEach((b) => b.classList.toggle('is-active', b === button));
    hint.textContent = `Size / ${size}`;
    guide.querySelectorAll('tr').forEach((r) => r.classList.toggle('is-active', r.dataset.size === size));
    hint.classList.remove('is-warn');
  })
);

add.addEventListener('click', () => {
  if (!size) {
    hint.textContent = 'Select size';
    hint.classList.remove('is-warn');
    void hint.offsetWidth;
    hint.classList.add('is-warn');
    return;
  }
  addItem(product.id, size);
  add.querySelector('span').textContent = `Added / ${size}`;
});

// ---- the rest of the drop ----
$('#pdp-more').innerHTML = PRODUCTS.filter((p) => p !== product)
  .map(
    (p) => `
      <a class="piece" href="${productUrl(p)}" data-reveal>
        <div class="piece__media ph has-photo">
          <div class="piece__media-inner">
            <img src="${productImage(p)}" alt="${p.name}" loading="lazy" style="${p.focus ? `object-position: ${p.focus}` : ''}" />
          </div>
          <div class="piece__tag mono"><span>AVNT 01 / ${p.code}</span><span>${p.index}</span></div>
          <div class="piece__enter mono"><span>Enter product</span><i>→</i></div>
        </div>
        <div class="piece__info">
          <h3>${p.name}</h3>
          <p class="piece__price">${formatPrice(p.price)}</p>
          <p class="mono">Edition of <span data-count="${p.edition}">${p.edition}</span></p>
        </div>
      </a>`
  )
  .join('');
