

(function () {
  'use strict';

  // (선택) FOUC 최소화 플래그
  document.documentElement.classList.add('js');

  document.addEventListener('DOMContentLoaded', function () {
    /* =========================
     * 1) Swiper
     * ========================= */
    if (window.Swiper) {
      const swiper = new Swiper('.products-swiper', {
        slidesPerView: 2,
        spaceBetween: 0,
        loop: true,
        pagination: false,
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        breakpoints: {
          0:    { slidesPerView: 1, spaceBetween: 12 },
          1024: { slidesPerView: 2, spaceBetween: 0 }
        }
      });
      // 레이아웃 변동 시 트리거 갱신
      swiper.on('resize', () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
      swiper.on('slideChangeTransitionEnd', () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
    }

    /* =========================
     * 2) Lenis (부드러운 스크롤)
     * ========================= */
    let lenis = null;
    if (window.Lenis) {
      lenis = new Lenis({
        duration: 0.9,
        smoothWheel: true,
        smoothTouch: false
      });
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);

      // 앵커 스크롤 Lenis로 (선택)
      document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
          const id = a.getAttribute('href');
          const target = id && document.querySelector(id);
          if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: 0 }); }
        });
      });
    }

    

    /* =========================
     * 스크롤 트리거 여기에서 테스트
     * ========================= */


 gsap.registerPlugin(ScrollTrigger);

if (!window.__value01Init) {
  window.__value01Init = true;

  gsap.set("#value01 .keyword01 .keyword-text", { autoAlpha: 0 });
  gsap.set("#value01 .keyword01", { columnGap: 0 });
  gsap.set("#value01 .section-title", { y: 50, autoAlpha: 0 });
  gsap.set("#value01 .keyword01 .line", { y: 100, autoAlpha: 0 }); 
  gsap.set("#value01 .keyword01 .line", { scaleX: 0.1, transformOrigin: 'center center' }); 
  gsap.set("#value01 .video-wrap01", { y: "0vh" });
  gsap.set("#value01 .video-wrap01 .video-title", { y: 50, autoAlpha: 0 });
  gsap.set("#value01 .video-wrap01 .video-desc", { y: 50, autoAlpha: 0 });

  const tl1 = gsap.timeline({
    scrollTrigger: {
      trigger: "#value01",
      start: "top top",
      end: () => "+=" + window.innerHeight * 10, 
      scrub: true,
      pin: true,
      anticipatePin: 1,
      pinReparent: true,
      pinSpacing: true
    }
  });

  tl1.to("#value01 .section-title", {
    y: 0,
    autoAlpha: 1,
    ease: "power2.out",
    duration: 1,
    immediateRender: false
  });

tl1.to("#value01 .keyword01 .line", { y: 0, autoAlpha: 1, ease: "sine.inOut", duration: 2 })
  .to("#value01 .keyword01 .line", { scaleX: 1, ease: "sine.inOut", delay:1, duration: 2 })
  .to("#value01 .keyword01 .keyword-text", { autoAlpha: 1, ease: "power3.out", duration: 2 }, "<")
  .to("#value01 .keyword01", { columnGap: '3vw', ease: "sine.inOut", duration: 2 }, "<");

    tl1.to("#value01 .video-wrap01", {
    y: "-100vh",
    ease: "none",
    delay: 2,
    scrub: 2,
    duration: 5,
    immediateRender: false
  });

  tl1.to("#value01 .video-wrap01 .video-title", {
    y: 0,
    autoAlpha: 1,
    ease: "sine.inOut",
    duration: 1,
    immediateRender: false
  });

  tl1.to("#value01 .video-wrap01 .video-desc", {
    y: 0,
    autoAlpha: 1,
    ease: "sine.inOut",
    duration: 2,
    immediateRender: false
  });

}



if (!window.__value02Init) {
  window.__value02Init = true;

  gsap.set("#value02 .keyword02 .keyword-text", { autoAlpha: 0 });
  gsap.set("#value02 .keyword02", { columnGap: 0 });
  gsap.set("#value02 .keyword02 .line", { y: 100, autoAlpha: 0 }); 
  gsap.set("#value02 .keyword02 .line", { scaleX: 0.1, transformOrigin: 'center center' }); 
  gsap.set("#value02 .video-wrap02", { y: "0vh" });
  gsap.set("#value02 .video-wrap02 .video-title", { y: 50, autoAlpha: 0 });
  gsap.set("#value02 .video-wrap02 .video-desc", { y: 50, autoAlpha: 0 });

  const tl2 = gsap.timeline({
    scrollTrigger: {
      trigger: "#value02",
      start: "top top",
      end: () => "+=" + window.innerHeight * 10, 
      scrub: true,
      pin: true,
      anticipatePin: 1,
      pinReparent: true,
      pinSpacing: true
    }
  });


tl2.to("#value02 .keyword02 .line", { y: 0, autoAlpha: 1, ease: "sine.inOut", duration: 2 })
  .to("#value02 .keyword02 .line", { scaleX: 1, ease: "sine.inOut", delay:1, duration: 2 })
  .to("#value02 .keyword02 .keyword-text", { autoAlpha: 1, ease: "power3.out", duration: 2 }, "<")
  .to("#value02 .keyword02", { columnGap: '3vw', ease: "sine.inOut", duration: 2 }, "<");

    tl2.to("#value02 .video-wrap02", {
    y: "-100vh",
    ease: "none",
    delay: 2,
    scrub: 2,
    duration: 5,
    immediateRender: false
  });

  tl2.to("#value02 .video-wrap02 .video-title", {
    y: 0,
    autoAlpha: 1,
    ease: "sine.inOut",
    duration: 1,
    immediateRender: false
  });

  tl2.to("#value02 .video-wrap02 .video-desc", {
    y: 0,
    autoAlpha: 1,
    ease: "sine.inOut",
    duration: 2,
    immediateRender: false
  });

}


if (!window.__value03Init) {
  window.__value03Init = true;

  gsap.set("#value03 .keyword03 .keyword-text", { autoAlpha: 0 });
  gsap.set("#value03 .keyword03", { columnGap: 0 });
  gsap.set("#value03 .keyword03 .line", { y: 100, autoAlpha: 0 }); 
  gsap.set("#value03 .keyword03 .line", { scaleX: 0.1, transformOrigin: 'center center' }); 
  gsap.set("#value03 .video-wrap03", { y: "0vh" });
  gsap.set("#value03 .video-wrap03 .video-title", { y: 50, autoAlpha: 0 });
  gsap.set("#value03 .video-wrap03 .video-desc", { y: 50, autoAlpha: 0 });

  const tl3 = gsap.timeline({
    scrollTrigger: {
      trigger: "#value03",
      start: "top top",
      end: () => "+=" + window.innerHeight * 10, 
      scrub: true,
      pin: true,
      pinReparent: true,
      anticipatePin: 1,
      pinSpacing: true
    }
  });


tl3.to("#value03 .keyword03 .line", { y: 0, autoAlpha: 1, ease: "sine.inOut", duration: 2 })
  .to("#value03 .keyword03 .line", { scaleX: 1, ease: "sine.inOut", delay:1, duration: 3 })
  .to("#value03 .keyword03 .keyword-text", { autoAlpha: 1, ease: "power3.out", duration: 3 }, "<")
  .to("#value03 .keyword03", { columnGap: '3vw', ease: "sine.inOut", duration: 3 }, "<");

    tl3.to("#value03 .video-wrap03", {
    y: "-100vh",
    ease: "none",
    delay: 2,
    scrub: 2,
    duration: 5,
    immediateRender: false
  });

  tl3.to("#value03 .video-wrap03 .video-title", {
    y: 0,
    autoAlpha: 1,
    ease: "sine.inOut",
    duration: 1,
    immediateRender: false
  });

  tl3.to("#value03 .video-wrap03 .video-desc", {
    y: 0,
    autoAlpha: 1,
    ease: "sine.inOut",
    duration: 2,
    immediateRender: false
  });

}





























(() => {
  const st = ScrollTrigger.getAll();
  console.log("ST count:", st.length);
  st.forEach((t, i) => {
    const trg = t.scroller || window;
    const pin = t.pin;
    console.group(`ST[#${i}]`);
    console.log("trigger:", t.trigger);
    console.log("pin:", pin);
    console.log("start/end:", t.start, t.end, "scrub:", !!t.vars.scrub, "pin:", !!t.vars.pin);
    console.log("scroller:", trg);
    console.log("pinType:", t.pinType);
    console.groupEnd();
  });

  // pin-spacer와 그 크기/마진을 덤프
  document.querySelectorAll(".pin-spacer").forEach((sp, i) => {
    const s = getComputedStyle(sp);
    console.log(`#pin-spacer[${i}]`, sp, {
      height: s.height, marginTop: s.marginTop, marginBottom: s.marginBottom, position: s.position
    });
  });
})();









    /* =========================
     * 5) 미디어 로딩 후 최종 갱신
     * ========================= */
    function refreshOnMediaLoad(scope = document) {
      const media = scope.querySelectorAll('img, video, source');
      let remain = media.length;
      if (remain === 0) { ScrollTrigger.refresh(); return; }
      const done = () => { if (--remain === 0) ScrollTrigger.refresh(); };
      media.forEach(el => {
        if (el.tagName === 'VIDEO') {
          if (el.readyState >= 2) done();
          else el.addEventListener('loadeddata', done, { once: true });
        } else if ('complete' in el && el.complete) {
          done();
        } else {
          el.addEventListener('load', done, { once: true });
        }
      });
    }
    refreshOnMediaLoad(document);
    window.addEventListener('load', () => ScrollTrigger.refresh());

    // 디버그 핸들
    window.appLenis = lenis;
  });
})();

