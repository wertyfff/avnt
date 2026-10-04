// Drop 01 / Form.
//
// Prices, materials, measurements and the texts below are working copy written to
// fill the pages — replace them with the real ones before launch.
//
// `focus`  part of the photo to keep when a frame crops it (default: upper body).
// `views`  close-ups for the product page. There is one photo per piece for now, so
//          the gallery is a set of zooms into it: zoom factor and the point zoomed
//          into, as a position inside the main frame.
// `images` when a piece has several photos; a view picks one with `image` (default 0).
//          The first is the one used on cards and in the bag.
// `guide`  size chart, in cm: column names, then one row per size.

const CARE_COTTON =
  'Стирка при 30°, вывернув наизнанку. Не отбеливать, не сушить в барабане. Гладить с изнанки, не по принту.';

export const DELIVERY =
  'Отправка в течение 1–3 рабочих дней. По России — 2–7 дней, курьером или в пункт выдачи. Возврат в течение 14 дней, если вещь не была в носке.';

export const PRODUCTS = [
  {
    id: 'tee-001',
    code: 'TEE-001',
    name: 'Form Tee',
    edition: 100,
    index: '01',
    price: 6900,
    material: '100% cotton / 280 GSM',
    fit: 'Oversized / boxy',
    details:
      'Футболка оверсайз из плотного хлопка молочного цвета. Высокая горловина, широкий рукав до локтя, спущенное плечо. Принт на груди нанесён шелкографией. Номер экземпляра — на внутренней бирке.',
    care: CARE_COTTON,
    guide: {
      cols: ['Chest', 'Length'],
      rows: { S: [60, 70], M: [62, 72], L: [64, 74], XL: [66, 76] },
    },
    focus: '50% 40%',
    views: [
      { label: 'Front', zoom: 1, origin: '50% 50%' },
      { label: 'Face', zoom: 2.6, origin: '50% 5%' },
      { label: 'Collar', zoom: 3, origin: '50% 38%' },
      { label: 'Print', zoom: 2.6, origin: '50% 72%' },
      { label: 'Print / Close', zoom: 3.6, origin: '50% 68%' },
      { label: 'Sleeve', zoom: 2.8, origin: '0% 73%' },
    ],
  },
  {
    id: 'hood-002',
    code: 'HOOD-002',
    name: 'Form Hoodie',
    edition: 50,
    index: '02',
    price: 12900,
    material: '100% cotton fleece / 480 GSM',
    fit: 'Oversized / dropped shoulder',
    details:
      'Худи оверсайз из плотного футера с начёсом. Объёмный двухслойный капюшон без шнурков, карман-кенгуру, спущенное плечо, плотные манжеты и пояс. Номер экземпляра — на внутренней бирке.',
    care: CARE_COTTON,
    guide: {
      cols: ['Chest', 'Length'],
      rows: { S: [64, 68], M: [66, 70], L: [68, 72], XL: [70, 74] },
    },
    focus: '50% 20%',
    views: [
      { label: 'Front', zoom: 1, origin: '50% 50%' },
      { label: 'Face', zoom: 2.8, origin: '45% 0%' },
      { label: 'Hood', zoom: 3, origin: '50% 18%' },
      { label: 'Fabric / Shoulder', zoom: 3.2, origin: '74% 36%' },
      { label: 'Pocket', zoom: 2.6, origin: '50% 76%' },
      { label: 'Cuff / Hem', zoom: 3.2, origin: '66% 90%' },
    ],
  },
  {
    id: 'jkt-003',
    code: 'JKT-003',
    name: 'Form Jacket',
    edition: 30,
    index: '03',
    price: 24900,
    material: 'Heavy cotton twill / lined',
    fit: 'Oversized / cropped',
    details:
      'Укороченная куртка объёмного кроя из плотного хлопкового твила на подкладке. Высокий воротник-стойка на двух пуговицах, асимметричный запах, рукав «летучая мышь», манжеты на пуговицах и эластичный пояс. Номер экземпляра — на внутренней бирке.',
    care: 'Только сухая чистка. Хранить на широких плечиках, вдали от источников тепла и прямого солнца.',
    guide: {
      cols: ['Chest', 'Length'],
      rows: { S: [66, 58], M: [68, 60], L: [70, 62], XL: [72, 64] },
    },
    images: ['jkt-003.jpg', 'jkt-003-2.jpg', 'jkt-003-3.jpg'],
    views: [
      { label: 'Front', zoom: 1, origin: '50% 50%' },
      { label: 'Collar', zoom: 2.4, origin: '50% 4%' },
      { label: 'Fabric', zoom: 3.2, origin: '36% 45%' },
      { label: 'Buttons / Hem', zoom: 3, origin: '47% 100%' },
      { label: 'Side', image: 1, zoom: 1, origin: '50% 50%' },
      { label: 'Black', image: 2, zoom: 1, origin: '50% 50%' },
      { label: 'Black / Cuff', image: 2, zoom: 2.6, origin: '39% 97%' },
    ],
  },
  {
    id: 'trs-004',
    code: 'TRS-004',
    name: 'Form Trousers',
    edition: 20,
    index: '04',
    price: 11900,
    material: 'Wool blend suiting',
    fit: 'Wide leg / high rise',
    details:
      'Широкие брюки из костюмной ткани. Высокая посадка, глубокие складки от пояса, потайная застёжка, два боковых кармана. Длина — в пол, с изломом на обуви. Жакет с фото в комплект не входит. Номер экземпляра — на внутренней бирке.',
    care: 'Только сухая чистка. Отпаривать с изнанки, хранить на зажимах за низ.',
    guide: {
      cols: ['Waist', 'Length'],
      rows: { S: [76, 108], M: [80, 110], L: [84, 112], XL: [88, 114] },
    },
    focus: '50% 70%',
    // the photo is small, so the zooms stay moderate
    views: [
      { label: 'Front', zoom: 1, origin: '50% 50%' },
      { label: 'Waist / Pleats', zoom: 2.4, origin: '54% 35%' },
      { label: 'Leg', zoom: 2.2, origin: '54% 82%' },
      { label: 'Hem', zoom: 2.4, origin: '55% 100%' },
    ],
  },
];

// close-ups used when a product has no `views` of its own
export const DEFAULT_VIEWS = [
  { label: 'Front', zoom: 1, origin: '50% 50%' },
  { label: 'Fabric', zoom: 2.6, origin: '50% 46%' },
  { label: 'Stitching', zoom: 3.2, origin: '30% 52%' },
  { label: 'Label', zoom: 3.2, origin: '50% 27%' },
];

const rub = new Intl.NumberFormat('ru-RU');
export const formatPrice = (value) => `${rub.format(value)} ₽`;

// paths are relative so the site also works from a sub-folder (GitHub Pages)
export const productImage = (product, index = 0) =>
  `img/products/${product.images ? product.images[index] : `${product.id}.jpg`}`;
export const productUrl = (product) => `product.html?id=${product.id}`;
