/* ==========================================================
   الوكر — السكربت المشترك
   ========================================================== */
(() => {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const easeIO = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const arDigits = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
    const pad = n => arDigits(String(n).padStart(2, '0'));
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const store = {
        get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
        set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* وضع التصفح الخاص */ } },
        del: k => { try { sessionStorage.removeItem(k); } catch (e) { /* وضع التصفح الخاص */ } },
    };

    document.documentElement.classList.add('js');

    /* ---------- القرص ---------- */
    let discId = 0;

    function buildDisc(el) {
        const d = el.dataset;
        const id = 'rim' + (++discId);
        el.classList.add('disc', 'disc--' + (d.type || 'print'));
        const art = d.art
            ? `<i class="disc__art" style="background-image:url('${esc(d.art)}');background-position:${esc(d.artPos || '50% 50%')};${d.artSize ? 'background-size:' + esc(d.artSize) : ''}"></i>`
            : '';
        const logo = d.logo ? `<img class="disc__logo" src="${esc(d.logo)}" alt="" draggable="false" style="${d.logoStyle ? esc(d.logoStyle) : ''}">` : '';
        const title = d.title ? `<span class="disc__title">${esc(d.title)}</span>` : '';
        const ink = d.ink ? `<span class="disc__ink">${esc(d.ink)}</span>` : '';
        const ink2 = d.ink2 ? `<span class="disc__ink disc__ink--2">${esc(d.ink2)}</span>` : '';
        const rim = d.rim
            ? `<svg class="disc__rim" viewBox="0 0 100 100" aria-hidden="true"><defs><path id="${id}" d="M50,50 m-45,0 a45,45 0 1,0 90,0 a45,45 0 1,0 -90,0"/></defs><text font-size="2.6" direction="rtl"><textPath href="#${id}" startOffset="${d.rimOffset || '25%'}">${esc(d.rim)}</textPath></text></svg>`
            : '';
        el.innerHTML =
            '<div class="disc__body">' +
            '<i class="disc__back"></i>' +
            '<i class="disc__edge" style="--z:3"></i><i class="disc__edge" style="--z:2"></i><i class="disc__edge" style="--z:1"></i>' +
            '<i class="disc__plate"></i>' +
            `<div class="disc__face">${art}${title}${logo}${ink2}${ink}${rim}</div>` +
            '<i class="disc__gloss"></i><i class="disc__hub"></i>' +
            '</div>';
        el.setAttribute('aria-hidden', 'true');
    }

    $$('[data-disc]').forEach(buildDisc);

    /* ---------- نافذة "من أنتم" ---------- */
    const about = $('#about');
    if (about && typeof about.showModal === 'function') {
        const openAbout = e => {
            if (e) e.preventDefault();
            if (!about.open) about.showModal();
        };
        $$('[data-about]').forEach(b => b.addEventListener('click', openAbout));
        $$('[data-close]', about).forEach(b => b.addEventListener('click', () => about.close()));
        about.addEventListener('click', e => { if (e.target === about) about.close(); });
        if (location.hash === '#about') requestAnimationFrame(() => openAbout());
        addEventListener('hashchange', () => {
            if (location.hash === '#about') openAbout();
            else if (about.open) about.close();
        });
        about.addEventListener('close', () => {
            if (location.hash === '#about') history.replaceState(null, '', location.pathname + location.search);
        });
    }

    /* ---------- ظهور العناصر ---------- */
    const reveals = $$('.reveal');
    if (reveals.length && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(en => {
                if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
            });
        }, { rootMargin: '0px 0px -8% 0px' });
        reveals.forEach(r => io.observe(r));
    } else {
        reveals.forEach(r => r.classList.add('is-in'));
    }

    /* ---------- مقدمة صفحة التفاصيل ---------- */
    const intro = $('#intro');
    const ready = () => document.body.classList.add('is-ready');
    if (intro) {
        const flag = store.get('wakr:intro');
        store.del('wakr:intro');
        if (flag && !reduce && document.documentElement.classList.contains('has-intro')) {
            setTimeout(() => {
                intro.classList.add('is-done');
                ready();
                setTimeout(() => intro.remove(), 1200);
            }, 1350);
        } else {
            intro.remove();
            requestAnimationFrame(ready);
        }
    } else if (document.body.classList.contains('page-detail') || document.body.classList.contains('page-blog')) {
        requestAnimationFrame(ready);
    }

    /* ---------- الصورة الممزقة ---------- */
    const tears = $$('.tear');
    if (tears.length) {
        const parts = tears.map(t => ({ t, words: $$('.tear__word', t), cta: $('.tear__cta', t) }));
        let ticking = false;
        const update = () => {
            ticking = false;
            const vh = innerHeight;
            parts.forEach(({ t, words, cta }) => {
                const r = t.getBoundingClientRect();
                if (r.bottom < -vh || r.top > vh * 1.5) return;
                const p = clamp(-r.top / (r.height - vh), 0, 1);
                const pre = clamp(1 - r.top / vh, 0, 1);
                t.style.setProperty('--p', p.toFixed(4));
                t.style.setProperty('--pre', pre.toFixed(4));
                const step = .62 / Math.max(1, words.length);
                words.forEach((w, i) => w.classList.toggle('is-on', reduce || p > .1 + i * step));
                if (cta) cta.classList.toggle('is-on', reduce || p > .1 + words.length * step);
            });
        };
        const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
        addEventListener('scroll', onScroll, { passive: true });
        addEventListener('resize', onScroll);
        update();
    }

    /* ---------- معاينة صور المدونة ---------- */
    const peek = $('.peek');
    if (peek && fine) {
        const img = $('img', peek);
        let x = 0, y = 0, tx = 0, ty = 0, on = false, raf = 0;
        const loop = () => {
            x += (tx - x) * .16;
            y += (ty - y) * .16;
            peek.style.transform = `translate(${x - 150}px, ${y - 110}px) rotate(${clamp((tx - x) * .04, -6, 6)}deg)`;
            raf = on || Math.abs(tx - x) > .5 ? requestAnimationFrame(loop) : 0;
        };
        $$('[data-peek]').forEach(row => {
            row.addEventListener('pointerenter', e => {
                img.src = row.dataset.peek;
                if (!on) { x = tx = e.clientX; y = ty = e.clientY; }
                on = true;
                peek.classList.add('is-on');
                if (!raf) raf = requestAnimationFrame(loop);
            });
            row.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; });
            row.addEventListener('pointerleave', () => { on = false; peek.classList.remove('is-on'); });
        });
    }

    /* ---------- الصفحة الرئيسية: معرض الأقراص ---------- */
    const scene = $('#scene');
    if (!scene) return;

    const body = document.body;
    const records = $$('.records > .record');
    const n = records.length;
    if (!n) return;

    // ميل القرص الثابت (درجات)؛ اجعله 0 ليواجه الشاشة تمامًا
    const TILT = 18;

    const items = records.map((li, i) => {
        const href = li.dataset.href || '';
        const disc = $('.disc', li);
        const slot = document.createElement(href ? 'a' : 'button');
        slot.className = 'slot';
        slot.draggable = false;
        if (href) slot.href = href; else slot.type = 'button';
        slot.setAttribute('aria-label', $('.record__title', li).textContent.trim());
        slot.dataset.index = i;
        slot.appendChild(disc);
        scene.appendChild(slot);
        return {
            id: li.id,
            href,
            slot,
            disc,
            face: $('.disc__face', disc),
            angle: Math.random() * 360,
            ry: 0, vry: 0, rxd: 0, vrx: 0, held: false,
            title: $('.record__title', li).innerHTML,
            sub: $('.record__sub', li),
            meta: $('.record__meta', li).innerHTML,
            cta: $('.record__link', li),
            group: li.dataset.group || '',
            state: $('.record__meta .state', li),
        };
    });

    const info = $('#info');
    const infoTitle = $('#infoTitle');
    const infoSub = $('#infoSub');
    const infoRows = $('#infoRows');
    const infoCta = $('#infoCta');
    const infoCount = $('#infoCount');
    const discName = $('#discName');
    const counter = $('#counter');
    const hint = $('.hint');
    const swaps = $$('.swap');

    const fromHash = items.findIndex(it => '#' + it.id === location.hash);
    const first = Math.max(0, fromHash);
    let cur = first;
    let target = cur;
    let vel = 0;
    let active = -1;
    let lastInput = 0;
    let introP = 0;
    let leaveP = 0;
    let leaving = false;
    let interacted = false;
    let S = { x: 0, size: 0, mobile: false };

    $$('.count-total').forEach(e => { e.textContent = pad(n); });

    function layout() {
        const W = innerWidth, H = innerHeight;
        const mobile = W < 860;
        const size = mobile ? Math.min(W * .6, H * .34) : clamp(Math.min(H * .44, W * .26), 200, 460);
        scene.style.setProperty('--size', size + 'px');
        document.documentElement.style.setProperty('--size', size + 'px');
        S = { x: size * (mobile ? 1.08 : 1.24), size, mobile };
    }

    function render(dt) {
        const k = easeOut(introP);
        const lk = easeIO(leaveP);
        const half = innerWidth / 2;
        for (let i = 0; i < n; i++) {
            const it = items[i];
            const d = i - cur;

            // صف أفقي واحد بأحجام متساوية؛ التالي إلى اليسار
            let x = -d * S.x;
            let s = 1;
            let o = clamp((half + S.size * .55 - Math.abs(x)) / (S.size * .5), 0, 1) * (1 - .45 * clamp(Math.abs(d), 0, 1));

            // الدخول: القرص الأول يكبر، والبقية تنزلق إلى أماكنها
            if (k < 1) {
                const away = 1 - k;
                if (i === first) s *= .72 + .28 * k;
                else {
                    x -= Math.sign(d) * away * S.x * 1.4;
                    o *= k;
                }
            }

            // المغادرة: القرص النشط يقترب، والبقية تبتعد
            if (lk > 0) {
                if (i === active) s *= 1 + lk * .14;
                else {
                    x -= Math.sign(d) * lk * S.x * .7;
                    o *= 1 - lk;
                }
            }

            it.slot.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0) scale(${s.toFixed(4)})`;
            it.slot.style.visibility = o <= .001 ? 'hidden' : '';
            it.slot.style.pointerEvents = o < .2 ? 'none' : '';
            it.slot.style.opacity = o >= .999 ? '' : o.toFixed(3);

            // القلب: نابض يعيد القرص إلى وجهه بعد الإفلات
            if (!it.held) {
                const rest = Math.round(it.ry / 360) * 360;
                it.vry += (-(it.ry - rest) * 42 - it.vry * 7.2) * dt;
                it.ry += it.vry * dt;
                it.vrx += (-it.rxd * 60 - it.vrx * 10) * dt;
                it.rxd += it.vrx * dt;
                if (Math.abs(it.ry - rest) < .05 && Math.abs(it.vry) < .5) { it.ry = 0; it.vry = 0; }
            }

            const ds = it.disc.style;
            ds.setProperty('--rx', (TILT + it.rxd).toFixed(2) + 'deg');
            ds.setProperty('--ry', it.ry.toFixed(2) + 'deg');
            ds.setProperty('--sheen', (196 + d * 30 + it.ry * .6).toFixed(1) + 'deg');
            ds.setProperty('--light', (128 + it.ry * .3).toFixed(1) + 'deg');

            const speed = reduce ? 0 : 9 + Math.min(Math.abs(vel) * 220, 520) + (k < 1 ? (1 - k) * 260 : 0) + lk * 300;
            it.angle = (it.angle + speed * dt) % 360;
            it.face.style.transform = `translateZ(.2px) rotate(${it.angle.toFixed(2)}deg)`;
        }
    }

    function setInfo(it, i) {
        infoTitle.innerHTML = it.title;
        infoSub.innerHTML = it.sub ? it.sub.innerHTML : '';
        infoSub.lang = it.sub ? (it.sub.lang || '') : '';
        infoSub.dir = infoSub.lang ? 'ltr' : 'rtl';
        infoRows.innerHTML = it.meta;
        infoCount.innerHTML =
            `<span>${esc(it.group)}</span>` +
            `<span class="info__steps"><button class="step-btn" type="button" data-step="-1" aria-label="السابق"${i === 0 ? ' disabled' : ''}><i class="ico i--right" aria-hidden="true"></i></button>${pad(i + 1)} / ${pad(n)}<button class="step-btn" type="button" data-step="1" aria-label="التالي"${i === n - 1 ? ' disabled' : ''}><i class="ico i--left" aria-hidden="true"></i></button></span>`;
        infoCta.innerHTML = it.href
            ? `<a class="btn btn--sm" href="${esc(it.href)}">${it.cta ? esc(it.cta.textContent.trim()) : 'افتح'}<i class="ico i--left" aria-hidden="true"></i></a><span class="info__tip">اسحب القرص لتقلبه</span>`
            : `<span>${it.cta ? esc(it.cta.textContent.trim()) : 'بعيدًا...'}</span><span class="info__tip">اسحب القرص لتقلبه</span>`;
        discName.innerHTML = it.title;
        if (counter) counter.textContent = pad(i + 1);
        $$('.controls [data-step]').forEach(b => { b.disabled = +b.dataset.step < 0 ? i === 0 : i === n - 1; });
    }

    let swapTimer = 0;
    function setActive(i) {
        active = i;
        items.forEach((it, j) => {
            it.slot.classList.toggle('is-active', j === i);
            it.slot.tabIndex = j === i ? 0 : -1;
        });
        if (interacted) history.replaceState(null, '', '#' + items[i].id);
        if (reduce || !info.dataset.ready) {
            info.dataset.ready = '1';
            setInfo(items[i], i);
            return;
        }
        swaps.forEach(s => s.classList.add('is-out'));
        clearTimeout(swapTimer);
        swapTimer = setTimeout(() => {
            setInfo(items[active], active);
            swaps.forEach(s => s.classList.remove('is-out'));
        }, 190);
    }

    function go(i) {
        target = clamp(i, 0, n - 1);
        lastInput = performance.now();
        poke();
    }

    function poke() { interacted = true; }

    function open(i) {
        const it = items[i];
        if (leaving) return;
        if (i !== active) { go(i); return; }
        if (!it.href) {
            it.disc.classList.remove('is-nope');
            void it.disc.offsetWidth;
            it.disc.classList.add('is-nope');
            return;
        }
        if (reduce) { location.href = it.href; return; }
        store.set('wakr:intro', it.id);
        leaving = true;
        body.classList.add('is-leaving');
        setTimeout(() => { location.href = it.href; }, 720);
    }

    /* العجلة */
    addEventListener('wheel', e => {
        if (leaving || (about && about.open)) return;
        e.preventDefault();
        let dy = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : -e.deltaX;
        if (e.deltaMode === 1) dy *= 32;
        else if (e.deltaMode === 2) dy *= innerHeight;
        target = clamp(target + clamp(dy, -160, 160) * .0042, -.3, n - .7);
        lastInput = performance.now();
        poke();
    }, { passive: false });

    /* السحب: على القرص يقلبه، وخارجه يتنقّل */
    let drag = null;
    let dragged = false;
    scene.addEventListener('dragstart', e => e.preventDefault());
    scene.addEventListener('pointerdown', e => {
        if (leaving || e.button !== 0) return;
        const s = e.target.closest('.slot');
        drag = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, lt: performance.now(), t: target, id: e.pointerId, i: s ? +s.dataset.index : -1, mode: '' };
        dragged = false;
    });
    addEventListener('pointermove', e => {
        if (!drag || e.pointerId !== drag.id) return;
        const dx = e.clientX - drag.x;
        const dy = e.clientY - drag.y;
        if (!drag.mode) {
            if (Math.hypot(dx, dy) < 6) return;
            drag.mode = drag.i > -1 && Math.abs(dx) >= Math.abs(dy) * .8 ? 'flip' : 'nav';
            dragged = true;
            scene.classList.add('is-dragging');
            if (drag.mode === 'flip') {
                const it = items[drag.i];
                it.held = true;
                drag.ry = it.ry;
                drag.rx = it.rxd;
                if (hint) hint.classList.add('is-gone');
            }
            try { scene.setPointerCapture(e.pointerId); } catch (err) { /* لا شيء */ }
        }
        const now = performance.now();
        const step = Math.max(1, now - drag.lt) / 1000;
        if (drag.mode === 'flip') {
            const it = items[drag.i];
            it.ry = drag.ry + dx * .6;
            it.rxd = clamp(drag.rx - dy * .25, -40, 40);
            it.vry = it.vry * .5 + ((e.clientX - drag.lx) * .6 / step) * .5;
            it.vrx = it.vrx * .5 + ((drag.ly - e.clientY) * .25 / step) * .5;
        } else {
            target = clamp(drag.t + (dx - dy) / (S.x * .9), -.3, n - .7);
            lastInput = now;
            poke();
        }
        drag.lx = e.clientX;
        drag.ly = e.clientY;
        drag.lt = now;
    });
    const endDrag = () => {
        if (!drag) return;
        if (drag.mode === 'flip') {
            const it = items[drag.i];
            it.held = false;
            if (performance.now() - drag.lt > 90) { it.vry *= .2; it.vrx *= .2; }
            it.vry = clamp(it.vry, -2400, 2400);
        } else {
            lastInput = performance.now() - 120;
        }
        drag = null;
        scene.classList.remove('is-dragging');
    };
    addEventListener('pointerup', endDrag);
    addEventListener('pointercancel', endDrag);

    items.forEach((it, i) => {
        it.slot.addEventListener('click', e => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
            e.preventDefault();
            if (dragged) { dragged = false; return; }
            poke();
            open(i);
        });
        it.slot.addEventListener('focus', () => { if (i !== active) go(i); });
    });

    infoCta.addEventListener('click', e => {
        if (!e.target.closest('a') || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
        e.preventDefault();
        open(active);
    });

    /* أزرار السابق والتالي */
    document.addEventListener('click', e => {
        const b = e.target.closest('[data-step]');
        if (!b || leaving) return;
        go(Math.round(target) + +b.dataset.step);
    });

    /* لوحة المفاتيح */
    addEventListener('keydown', e => {
        if (leaving || (about && about.open)) return;
        if (e.target.closest && e.target.closest('input, textarea, .dropdown')) return;
        const k = e.key;
        if (k === 'ArrowLeft' || k === 'ArrowDown' || k === 'PageDown') { e.preventDefault(); go(Math.round(target) + 1); }
        else if (k === 'ArrowRight' || k === 'ArrowUp' || k === 'PageUp') { e.preventDefault(); go(Math.round(target) - 1); }
        else if (k === 'Home') { e.preventDefault(); go(0); }
        else if (k === 'End') { e.preventDefault(); go(n - 1); }
        else if (k === 'Enter' && e.target === body) { open(active); }
        else if (k === ' ' && e.target === body) { e.preventDefault(); items[active].vry += 900; }
    });

    /* قائمة الفهرس */
    const menuBtn = $('#indexBtn');
    const menu = $('#indexMenu');
    if (menuBtn && menu) {
        const groups = [];
        items.forEach((it, i) => {
            let g = groups.find(x => x.name === it.group);
            if (!g) { g = { name: it.group, list: [] }; groups.push(g); }
            g.list.push({ it, i });
        });
        menu.innerHTML = groups.map(g =>
            `<div class="dropdown__group">${esc(g.name)}</div>` +
            g.list.map(({ it, i }) =>
                `<button class="dropdown__item" type="button" data-go="${i}"><span class="dropdown__num">${pad(i + 1)}</span><span class="dropdown__title">${it.title}</span><span class="dropdown__state">${it.state ? esc(it.state.textContent.trim()) : ''}</span></button>`
            ).join('')
        ).join('');
        const setMenu = open => {
            menu.classList.toggle('is-open', open);
            menuBtn.setAttribute('aria-expanded', open);
        };
        menuBtn.addEventListener('click', e => {
            e.stopPropagation();
            setMenu(!menu.classList.contains('is-open'));
        });
        menu.addEventListener('click', e => {
            const b = e.target.closest('[data-go]');
            if (!b) return;
            go(+b.dataset.go);
            setMenu(false);
        });
        document.addEventListener('click', e => { if (!menu.contains(e.target)) setMenu(false); });
        addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    }

    /* الحلقة الرئيسية */
    let last = performance.now();
    let introStart = 0;
    let introDur = 1400;
    let leaveStart = 0;

    function frame(now) {
        const dt = Math.min(.05, (now - last) / 1000);
        last = now;

        if (!(drag && drag.mode === 'nav') && now - lastInput > 160) target = Math.round(clamp(target, 0, n - 1));
        const prev = cur;
        cur += (target - cur) * (1 - Math.exp(-dt * 7.5));
        if (Math.abs(target - cur) < .0004) cur = target;
        vel = dt > 0 ? (cur - prev) / dt : 0;

        if (introStart) introP = clamp((now - introStart) / introDur, 0, 1);
        if (leaving) {
            if (!leaveStart) leaveStart = now;
            leaveP = clamp((now - leaveStart) / 700, 0, 1);
        }

        const a = clamp(Math.round(cur), 0, n - 1);
        if (a !== active) setActive(a);

        render(dt);
        requestAnimationFrame(frame);
    }

    function start(delay) {
        introDur = reduce ? 1 : 1500;
        setTimeout(() => {
            body.classList.remove('is-loading');
            introStart = performance.now();
        }, delay);
    }

    /* شاشة التحميل: عدّاد يتبع تحميل الصور فعلًا */
    function runLoader() {
        const loader = $('.loader');
        const num = $('.loader__num', loader);
        const urls = [...new Set($$('[data-art], [data-logo]', scene).flatMap(el => [el.dataset.art, el.dataset.logo]).filter(Boolean))];
        let loaded = 0;
        urls.forEach(u => {
            const im = new Image();
            im.onload = im.onerror = () => { loaded++; };
            im.src = u;
        });
        const t0 = performance.now();
        const tick = now => {
            const timeP = clamp((now - t0) / 1600, 0, 1);
            const loadP = urls.length ? loaded / urls.length : 1;
            const p = Math.min(timeP, now - t0 > 5000 ? 1 : loadP);
            num.textContent = arDigits(Math.round(easeOut(p) * 100));
            if (p < 1) { requestAnimationFrame(tick); return; }
            loader.classList.add('is-done');
            store.set('wakr:seen', '1');
            start(250);
            setTimeout(() => loader.remove(), 1400);
        };
        requestAnimationFrame(tick);
    }

    addEventListener('resize', layout);
    addEventListener('hashchange', () => {
        const i = items.findIndex(it => '#' + it.id === location.hash);
        if (i > -1) go(i);
    });
    addEventListener('pageshow', e => {
        if (e.persisted) {
            leaving = false;
            leaveP = 0;
            leaveStart = 0;
            body.classList.remove('is-leaving');
        }
    });

    layout();
    body.classList.add('is-loading');
    if (document.documentElement.classList.contains('first-visit') && !reduce) {
        runLoader();
    } else {
        const l = $('.loader');
        if (l) l.remove();
        start(60);
    }
    requestAnimationFrame(frame);
})();
