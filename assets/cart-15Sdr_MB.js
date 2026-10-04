import{r as f,g as p,s as g,c as _,P as i,f as a,p as l,a as b}from"./menu-B9g9KdXQ.js";/* empty css             */const m=document.getElementById("cart-list"),E=document.getElementById("cart-empty"),h=document.getElementById("cart-layout"),I=document.getElementById("cart-count"),v=document.getElementById("cart-pieces"),B=document.getElementById("cart-checkout"),C=document.getElementById("cart-subtotal"),q=document.getElementById("cart-total"),d=t=>String(t).padStart(2,"0"),z="kiwnt1";function w(t,e){const o=["Здравствуйте! Хочу оформить заказ AVNT:",...t.map((c,s)=>{const r=i.find($=>$.id===c.id),y=a(r.price*c.qty);return`${s+1}. ${r.name} (${r.code}) — размер ${c.size}, ${c.qty} шт. — ${y}`}),`Итого: ${a(e)}`].join(`
`);return`https://t.me/${z}?text=${encodeURIComponent(o)}`}function x(t){const e=i.find(o=>o.id===t.id),n=e.focus?` style="object-position: ${e.focus}"`:"";return`
    <li class="cart__row" data-id="${t.id}" data-size="${t.size}">
      <a class="cart__thumb ph" href="${l(e)}">
        <img src="${b(e)}" alt="${e.name}"${n} />
      </a>
      <div class="cart__info">
        <a class="cart__name" href="${l(e)}">${e.name}</a>
        <p class="mono">AVNT 01 / ${e.code}</p>
        <p class="mono">Size / ${t.size}</p>
        <p class="mono">Edition of ${e.edition}</p>
      </div>
      <div class="cart__qty mono">
        <button type="button" data-step="-1" aria-label="Меньше">−</button>
        <span>${d(t.qty)}</span>
        <button type="button" data-step="1" aria-label="Больше">+</button>
      </div>
      <p class="cart__price">${a(e.price*t.qty)}</p>
      <button class="cart__remove mono" type="button">Remove</button>
    </li>`}function u(){const t=p(),e=_();h.hidden=t.length===0,E.hidden=t.length>0,I.textContent=d(e),v.textContent=d(e);const n=t.reduce((o,c)=>o+i.find(s=>s.id===c.id).price*c.qty,0);C.textContent=a(n),q.textContent=a(n),m.innerHTML=t.map(x).join(""),B.href=w(t,n)}m.addEventListener("click",t=>{const e=t.target.closest(".cart__row");if(!e)return;const{id:n,size:o}=e.dataset;if(t.target.closest(".cart__remove"))f(n,o);else if(t.target.dataset.step){const c=p().find(s=>s.id===n&&s.size===o);g(n,o,c.qty+Number(t.target.dataset.step))}else return;u()});window.addEventListener("storage",u);u();
