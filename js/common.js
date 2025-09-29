/* =========================
 * common.js (intro + value 심플 애니메이션 · 복붙용)
 * - Swiper
 * - Lenis
 * - GSAP / ScrollTrigger
 * - 섹션 트리거로: .reveal-up(여러 개) → .keyword.reveal-block 순서로 페이드업
 * ========================= */
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
     * 3) GSAP / ScrollTrigger
     * ========================= */
    if (!window.gsap || !window.ScrollTrigger) {
      console.warn('[common.js] GSAP/ScrollTrigger가 로드되지 않았습니다.');
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    if (lenis) lenis.on('scroll', ScrollTrigger.update);

    /* =========================
     * 4) intro + value 섹션 심플 애니메이션
     *    - 섹션을 트리거로 사용(absolute 제목도 안전)
     *    - 섹션 내 .reveal-up들 → 순차 페이드업
     *    - 이어서 .keyword.reveal-block(있으면) 페이드업
     * ========================= */

    gsap.set('.reveal-up, .keyword.reveal-block', { autoAlpha: 0, y: 50 });

    const SECTION_SELECTORS = '.intro, .value';
    gsap.utils.toArray(SECTION_SELECTORS).forEach((sec) => {
      const ups   = sec.querySelectorAll('.reveal-up');                 // 여러 개 가능 (intro의 h1, p 등)
      const block = sec.querySelector('.keyword.reveal-block');         // value 섹션에서만 존재

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: sec,
          delay: 0.5,
          start: 'top 60%',                 // 섹션 top이 뷰포트 80%일 때 시작
          toggleActions: 'play none none none' // 1회 재생, 되돌리지 않음
          // markers: true,
        }
      });

      if (ups.length) {
        tl.to(ups, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1, delay: 0.3 }, 0);
      }

      if (block) {
        tl.to(block, { autoAlpha: 1, y: 0, duration: 1, delay: 2 }, ups.length ? 0.2 : 0);
      }
    });










    /* =========================
     * (옵션) intro → container 덮는 모션
     * ========================= */
    /*
    const sectionContainer = document.querySelector('.container');
    if (sectionContainer) {
      gsap.fromTo(sectionContainer,
        { y: '0vh' },
        {
          y: '-100vh',
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: '.intro',
            start: 'bottom bottom',
            end: 'bottom top',
            scrub: true,
            markers: false
            // Lenis 사용 시에도 scroller 옵션 생략 (window 스크롤)
          }
        }
      );
    }
    */


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
