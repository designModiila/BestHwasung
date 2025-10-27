(function () {
  'use strict';

  document.documentElement.classList.add('js');

  document.addEventListener('DOMContentLoaded', function () {

    /* =========================
     * 0) 공통 유틸: 안전한 refresh (점프 방지)
     *    - 현재 스크롤 y 저장 → ST.refresh() → y 복원
     *    - rAF 디바운스 포함
     * ========================= */
    const safeRefresh = (() => {
      let rafId = null;
      return function () {
        if (!window.ScrollTrigger) return;
        if (rafId) cancelAnimationFrame(rafId);

        const lenis = window.appLenis || window.lgLenis || window.lenisInstance;
        const getY = () =>
          (lenis && typeof lenis.scroll === 'number')
            ? lenis.scroll
            : (window.pageYOffset || document.documentElement.scrollTop || 0);
        const setY = (y) => {
          if (lenis && typeof lenis.scrollTo === 'function') {
            lenis.scrollTo(y, { immediate: true });
          } else {
            window.scrollTo(0, y);
          }
        };

        const y = getY();
        rafId = requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          setY(y);
          rafId = null;
        });
      };
    })();

    /* =========================
     * 1) Swiper (있는 경우 먼저)
     * ========================= */
    if (window.Swiper) {
      const swiper = new Swiper('.products-swiper', {
        slidesPerView: 2,
        spaceBetween: 0,
        loop: true,
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        breakpoints: { 0:{slidesPerView:1,spaceBetween:0}, 767:{slidesPerView:2,spaceBetween:0} },
      });
      // Swiper 내부에서 레이아웃 변동 → 안전 갱신
      // swiper.on('resize', safeRefresh);
      // swiper.on('slideChangeTransitionEnd', safeRefresh);

      // 스와이퍼 네비가 <a href="#"> 라면 점프 차단
      // $(document).on('click', '.swiper-button-next[href="#"], .swiper-button-prev[href="#"]', function(e){ e.preventDefault(); });
    }

    

    /* =========================
     * 2) GSAP + Lenis + ScrollTrigger 연결
     * ========================= */
    gsap.registerPlugin(ScrollTrigger);

    // ★ 자동 리사이즈 refresh 비활성(우리가 수동 safeRefresh로 제어)
    ScrollTrigger.config({
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load" // resize 제외
    });

    let lenis = null;
    if (window.Lenis) {
      lenis = new Lenis({ duration: 0.9, smoothWheel: true, smoothTouch: false });

      // GSAP ticker로 Lenis 구동
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);

      // Lenis 스크롤 시 ST 업데이트
      lenis.on('scroll', ScrollTrigger.update);
    }

    // ★ 모든 ST가 참조할 스크롤러를 통일 (문서 루트)
    const SCROLLER = document.documentElement;
    if (lenis) {
      ScrollTrigger.scrollerProxy(SCROLLER, {
        scrollTop(value) {
          if (arguments.length) {
            lenis.scrollTo(value, { immediate: true }); // ST가 설정해도 점프 없이 즉시 복원 가능
          } else {
            return lenis.scroll;
          }
        },
        getBoundingClientRect() {
          return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        },
        pinType: 'fixed'
      });
      ScrollTrigger.defaults({ scroller: SCROLLER });
    }

    // 전역: 해시/빈 링크 클릭 시 기본 동작 차단 (맨 위로 점프 방지)
    $(document).on('click', 'a[href="#"], a[href=""]', function (e) { e.preventDefault(); });
    $(document).on('click', 'a[href^="#"]', function (e) {
      const id = this.getAttribute('href');
      if (id === '#' || !document.querySelector(id)) e.preventDefault();
    });

    // 전역: 폼 버튼/커스텀 버튼이 submit으로 설정되어 점프하는 경우 방지 (선택)
    $(document).on('click', 'button[type="submit"][data-nojump]', function (e) { e.preventDefault(); });

    // 창 리사이즈/회전 시: 안전 갱신 (점프 없이)
    window.addEventListener('resize', safeRefresh);
    window.addEventListener('orientationchange', safeRefresh);

    /* =========================
     * 3) 헤더/GNB (height 애니메이션은 레이아웃 영향 → transform 권장)
     *    지금 구조 유지하되 refresh 제거/안전화
     * ========================= */
    (function gnb() {
      function gnbshow(){
        $("#header").addClass("on");
        $(".gnb_bg").stop().animate({height:"313px"},300);
        $(".gnb_bg").addClass("on");
        $(".depth2").stop().animate({height:"213px"},300);
        safeRefresh();
      }
      function gnbhide(){
        $(".gnb_bg").stop().animate({height:"0px"},300);
        $(".depth2").stop().animate({height:"0px"},300) 
        setTimeout(function(){
          $("#header").removeClass("on");
        }, 300);
        $(".gnb_bg").removeClass("on");
        safeRefresh();
      }

      $("#gnb").on("mouseenter", gnbshow);   
      $("#header").on("mouseleave", gnbhide);      

      $("#gnb .depth1>li")
        .on("mouseenter", function(){
          $("#gnb .depth1>li").removeClass("on");
          $(this).addClass("on");
        })
        .on("mouseleave", function(){
          $("#gnb .depth1>li").removeClass("on");
        });

      $(".btn_gnb").on("click", function(e){
        e.preventDefault();
        if($(this).hasClass("on")){
          $(this).removeClass("on");
          gnbhide();
          $("#gnb, .logo").off("mouseenter").on("mouseenter", gnbshow);
          $("#header").off("mouseleave").on("mouseleave", gnbhide);
        } else {
          $(this).addClass("on");
          gnbshow();
          $("#gnb").off(); // 열린 동안 hover 최소화
        }
        safeRefresh();
      });
    })();



    
    // 모바일 메뉴

 

  const menu = document.querySelector('.mo-menu-container');
  const openBtn = document.querySelector('.mobile-top .mo-nav');
  const closeBtn = document.querySelector('.mo-menu-container .mo-close');
  const backgroundBlack = document.querySelector('.background-b');

  if (!menu || !openBtn || !closeBtn) return;

  const openMenu = () => {
    menu.classList.add('active');
    backgroundBlack.classList.add('active');
    document.body.classList.add('no-scroll'); // ✅ 스크롤 막기
  };

  const closeMenu = () => {
    menu.classList.remove('active');
    backgroundBlack.classList.remove('active');
    document.body.classList.remove('no-scroll'); // ✅ 스크롤 해제
  };

  openBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);


// 모바일 메뉴 아코디언

$(function () {
  if (window.__mobileAccordionInit) return;
  window.__mobileAccordionInit = true;

  const $menu = $('#mobileMenu');

  $menu.off('click.moAccordion');
  $(document).off('click.moAccordion');

  $menu.on('click.moAccordion', '.menu-depth1', function (e) {
    e.preventDefault();
    e.stopPropagation(); 

    const $li  = $(this).closest('li');
    const $sub = $li.children('.submenu');

    if ($sub.is(':animated')) return;

    const willOpen = !$li.hasClass('open');

    $li.siblings('li')
      .removeClass('open')
      .children('.submenu')
      .stop(true, true).slideUp(200)
      .prev('.menu-depth1').attr('aria-expanded', false);

    // 현재 항목 토글(열기/닫기)
    if (willOpen) {
      $li.addClass('open');
      $sub.stop(true, true).slideDown(200);
    } else {
      $li.removeClass('open');
      $sub.stop(true, true).slideUp(200);
    }
    $(this).attr('aria-expanded', willOpen);
  });

  // ✅ (선택) 메뉴 바깥 클릭 시 모두 닫기 — 내부 클릭은 무시
  $(document).on('click.moAccordion', function (e) {
    if ($(e.target).closest('.mo-menu-container').length) return; // 내부 클릭이면 패스
    $menu.find('li.open')
      .removeClass('open')
      .children('.submenu')
      .stop(true, true).slideUp(200)
      .prev('.menu-depth1').attr('aria-expanded', false);
  });
});



// 헤더 토글: 스크롤 내리면 숨기고, 살짝 올리면 보여주기
(function () {
  const SHOW_ON_SMALL_UP = 12;
  const HIDE_ON_SMALL_DOWN = 4;
  const MIN_SCROLL_TO_ENABLE = 40;

  function setup() {
    const header = document.querySelector(".mo-menu-wrapper .mobile-top");
    const button = header?.querySelector("button");
    if (!header || !button) return false;

    let lastY = window.pageYOffset || 0;
    let hidden = false;
    let ticking = false;

    const onScroll = () => {
      try {
        const y = Math.max(0, window.pageYOffset || 0); // iOS 바운스 보호
        const delta = y - lastY;

        // 최상단 부근: 항상 보이기(여기서도 반드시 ticking 해제 필요)
        if (y <= MIN_SCROLL_TO_ENABLE) {
          header.classList.remove("hide", "active");
          button.classList.remove("active");
          hidden = false;
          lastY = y;
          return;
        }

        // 아래로 내리면 숨김
        if (delta > HIDE_ON_SMALL_DOWN && !hidden) {
          header.classList.add("hide");
          header.classList.remove("active");
          button.classList.remove("active");
          hidden = true;
        }
        // 위로 살짝 올리면 보이기
        else if (delta < -SHOW_ON_SMALL_UP && hidden) {
          header.classList.remove("hide");
          header.classList.add("active");
          button.classList.add("active");
          hidden = false;
        }

        lastY = y;
      } finally {
        // ✅ 어떤 경로로 끝나든 반드시 해제
        ticking = false;
      }
    };

    const handle = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    };

    window.addEventListener("scroll", handle, { passive: true });

    // 초기 상태 즉시 반영(중간 지점에서 시작해도 정상)
    requestAnimationFrame(onScroll);
    return true;
  }

  // DOM 준비 후 실행(못 잡히면 짧게 재시도)
  const start = () => {
    if (setup()) return;
    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      if (setup() || tries > 20) clearInterval(id);
    }, 100);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();








    /* =========================
     * 4) 메인 Value 타임라인들
     * ========================= */

    // ---------- value01 ----------
    (function(){
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        if (window.__value01Init) return;
        window.__value01Init = true;

        gsap.set("#value01 .keyword01 .keyword-text", { autoAlpha: 0 });
        gsap.set("#value01 .keyword01", { columnGap: 0 });
        gsap.set("#value01 .section-title", { y: 50, autoAlpha: 0 });
        gsap.set("#value01 .keyword01 .line", { y: 100, autoAlpha: 0, scaleX: 0.1, transformOrigin: 'center center' });
        gsap.set("#value01 .video-wrap01", { y: "0vh" });
        gsap.set("#value01 .video-wrap01 .video-title", { y: 50, autoAlpha: 0 });
        gsap.set("#value01 .video-wrap01 .video-desc",  { y: 50, autoAlpha: 0 });

        /* 1) 핀 + 스크럽 타임라인 */
        const tl1 = gsap.timeline({
          scrollTrigger: {
            trigger: "#value01",
            start: "top top",
            end: () => "+=" + window.innerHeight * 2,
            scrub: 1,
            pin: true,
            pinReparent: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          }
        });

        tl1
          .to("#value01 .video-wrap01", { y: "-100vh", ease: "none", delay: 1, duration: 2 })
          .to("#value01 .keyword01", { color:"#fff", duration: 2 }, "<+1")
          .to("#value01 .keyword01 .line", { backgroundColor:"#fff", duration: 2 }, "<")
          .to("#value01 .keyword01", { opacity: 0, delay: 1 }, "<+1")
          .to("#value01 .video-wrap01 .video-title", { y: 0, autoAlpha: 1, ease: "sine.inOut" })
          .to("#value01 .video-wrap01 .video-desc",  { y: 0, autoAlpha: 1, ease: "sine.inOut" });

        /* 2) 자동재생 타임라인 */
        const autoTl = gsap.timeline({ paused: true })
          .to("#value01 .section-title", { y: 0, autoAlpha: 1, ease: "power2.out", duration: 0.8, immediateRender: false })
          .to("#value01 .keyword01 .line", { y: 0, autoAlpha: 1, ease: "sine.inOut", duration: 0.8 }, "<")
          .to("#value01 .keyword01 .line", { scaleX: 1, ease: "expo.out", duration: 0.9 }, ">0.1")
          .to("#value01 .keyword01 .keyword-text", { autoAlpha: 1, ease: "power3.out", duration: 0.8 }, "<")
          .to("#value01 .keyword01", { columnGap: "3vw", ease: "expo.out", duration: 0.8 }, "<");

        /* 3) 자동재생/역재생 트리거 */
        ScrollTrigger.create({
          trigger: "#value01",
          start: "top top",
          end: () => "+=" + window.innerHeight * 2,
          onEnter:      () => autoTl.play(0),
          onEnterBack:  () => autoTl.play(0),
          onLeaveBack:  () => autoTl.reverse(),
          invalidateOnRefresh: true
        });

        // matchMedia 해제 시 정리
        return () => {
          window.__value01Init = false;
          ScrollTrigger.getAll().forEach(st => st.kill());
          gsap.globalTimeline.clear();
        };
      });

      // 768px 이하일 때

      mm.add("(max-width: 767px)", () => {
        const section = document.querySelector("#value01");
        if (!section) return;

        const wrap  = section.querySelector(".video-wrap01");
        const title = wrap?.querySelector(".video-title");
        const desc  = wrap?.querySelector(".video-desc");
        if (!wrap || !title || !desc) return;

        // 초기 상태 (모바일에서만)
        gsap.killTweensOf([title, desc]);
        gsap.set([title, desc], { y: 20, autoAlpha: 0 });

        // 1) 핀 고정: top이 뷰포트 top에 닿는 순간부터,
        //    요소의 bottom이 뷰포트 bottom에 닿을 때까지 고정
        const pinST = ScrollTrigger.create({
          trigger: wrap,
          start: "top top",
          end: "bottom bottom",
          invalidateOnRefresh: true
        });

        // 2) 하단(bottom)이 뷰포트 하단(bottom)에 닿으면 0.3s 후 재생
        const tl = gsap.timeline({
          paused: true,
          defaults: { duration: 1.3, ease: "power2.out" }
        });
        tl.to(title, { y: 0, autoAlpha: 1 }, 0)
          .to(desc,  { y: 0, autoAlpha: 1 }, 0.5);

        const revealST = ScrollTrigger.create({
          trigger: wrap,
          start: "70% bottom",
          once: true, // 한 번만 실행
          onEnter: () => gsap.delayedCall(0.3, () => tl.play())
        });

        // 🔧 반응형 전환(cleanup)
        return () => {
          pinST.kill();
          revealST.kill();
          tl.kill();
        };
      });


    })();



    
    // ---------- value02 ----------
    (function(){
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        if (window.__value02Init) return;
        window.__value02Init = true;

        gsap.set("#value02 .keyword02 .keyword-text", { autoAlpha: 0 });
        gsap.set("#value02 .keyword02", { columnGap: 0 });
        gsap.set("#value02 .section-title", { y: 50, autoAlpha: 0 });
        gsap.set("#value02 .keyword02 .line", { y: 100, autoAlpha: 0, scaleX: 0.1, transformOrigin: 'center center' });
        gsap.set("#value02 .video-wrap02", { y: "0vh" });
        gsap.set("#value02 .video-wrap02 .video-title", { y: 50, autoAlpha: 0 });
        gsap.set("#value02 .video-wrap02 .video-desc",  { y: 50, autoAlpha: 0 });

        /* 1) 핀 + 스크럽 타임라인 */
        const tl1 = gsap.timeline({
          scrollTrigger: {
            trigger: "#value02",
            start: "top top",
            end: () => "+=" + window.innerHeight * 2,
            scrub: 1,
            pin: true,
            pinReparent: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          }
        });

        tl1
          .to("#value02 .video-wrap02", { y: "-100vh", ease: "none", delay: 1, duration: 2 })
          .to("#value02 .keyword02", { color:"#fff", duration: 2 }, "<+1")
          .to("#value02 .keyword02 .line", { backgroundColor:"#fff", duration: 2 }, "<")
          .to("#value02 .keyword02", { opacity: 0, delay: 1 }, "<+1")
          .to("#value02 .video-wrap02 .video-title", { y: 0, autoAlpha: 1, ease: "sine.inOut" })
          .to("#value02 .video-wrap02 .video-desc",  { y: 0, autoAlpha: 1, ease: "sine.inOut" });

        /* 2) 자동재생 타임라인 */
        const autoTl = gsap.timeline({ paused: true })
          .to("#value02 .section-title", { y: 0, autoAlpha: 1, ease: "power2.out", duration: 0.8, immediateRender: false })
          .to("#value02 .keyword02 .line", { y: 0, autoAlpha: 1, ease: "sine.inOut", duration: 0.8 }, "<")
          .to("#value02 .keyword02 .line", { scaleX: 1, ease: "expo.out", duration: 0.9 }, ">0.1")
          .to("#value02 .keyword02 .keyword-text", { autoAlpha: 1, ease: "power3.out", duration: 0.8 }, "<")
          .to("#value02 .keyword02", { columnGap: "3vw", ease: "expo.out", duration: 0.8 }, "<");

        /* 3) 자동재생/역재생 트리거 */
        ScrollTrigger.create({
          trigger: "#value02",
          start: "top top",
          end: () => "+=" + window.innerHeight * 2,
          onEnter:      () => autoTl.play(0),
          onEnterBack:  () => autoTl.play(0),
          onLeaveBack:  () => autoTl.reverse(),
          invalidateOnRefresh: true
        });

        // matchMedia 해제 시 정리
        return () => {
          window.__value01Init = false;
          ScrollTrigger.getAll().forEach(st => st.kill());
          gsap.globalTimeline.clear();
        };
      });

      // 768px 이하일 때

      mm.add("(max-width: 767px)", () => {
        const section = document.querySelector("#value02");
        if (!section) return;

        const wrap  = section.querySelector(".video-wrap02");
        const title = wrap?.querySelector(".video-title");
        const desc  = wrap?.querySelector(".video-desc");
        if (!wrap || !title || !desc) return;

        // 초기 상태 (모바일에서만)
        gsap.killTweensOf([title, desc]);
        gsap.set([title, desc], { y: 20, autoAlpha: 0 });

        // 1) 핀 고정: top이 뷰포트 top에 닿는 순간부터,
        const pinST = ScrollTrigger.create({
          trigger: wrap,
          start: "top top",
          end: "bottom bottom",
          invalidateOnRefresh: true
        });

        // 2) 하단(bottom)이 뷰포트 하단(bottom)에 닿으면 0.3s 후 재생
        const tl = gsap.timeline({
          paused: true,
          defaults: { duration: 1.3, ease: "power2.out" }
        });
        tl.to(title, { y: 0, autoAlpha: 1 }, 0)
          .to(desc,  { y: 0, autoAlpha: 1 }, 0.5);

        const revealST = ScrollTrigger.create({
          trigger: wrap,
          start: "70% bottom",
          once: true, // 한 번만 실행
          onEnter: () => gsap.delayedCall(0.3, () => tl.play())
        });

        // 🔧 반응형 전환(cleanup)
        return () => {
          pinST.kill();
          revealST.kill();
          tl.kill();
        };
      });

    })();

    // ---------- value03 ----------
    (function(){
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        if (window.__value03Init) return;
        window.__value03Init = true;

        gsap.set("#value03 .keyword03 .keyword-text", { autoAlpha: 0 });
        gsap.set("#value03 .keyword03", { columnGap: 0 });
        gsap.set("#value03 .section-title", { y: 50, autoAlpha: 0 });
        gsap.set("#value03 .keyword03 .line", { y: 100, autoAlpha: 0, scaleX: 0.1, transformOrigin: 'center center' });
        gsap.set("#value03 .video-wrap03", { y: "0vh" });
        gsap.set("#value03 .video-wrap03 .video-title", { y: 50, autoAlpha: 0 });
        gsap.set("#value03 .video-wrap03 .video-desc",  { y: 50, autoAlpha: 0 });

        /* 1) 핀 + 스크럽 타임라인 */
        const tl1 = gsap.timeline({
          scrollTrigger: {
            trigger: "#value03",
            start: "top top",
            end: () => "+=" + window.innerHeight * 2,
            scrub: 1,
            pin: true,
            pinReparent: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          }
        });

        tl1
          .to("#value03 .video-wrap03", { y: "-100vh", ease: "none", delay: 1, duration: 2 })
          .to("#value03 .keyword03", { color:"#fff", duration: 2 }, "<+1")
          .to("#value03 .keyword03 .line", { backgroundColor:"#fff", duration: 2 }, "<")
          .to("#value03 .keyword03", { opacity: 0 , delay: 1}, "<+1")
          .to("#value03 .video-wrap03 .video-title", { y: 0, autoAlpha: 1, ease: "sine.inOut" })
          .to("#value03 .video-wrap03 .video-desc",  { y: 0, autoAlpha: 1, ease: "sine.inOut" });

        /* 2) 자동재생 타임라인 */
        const autoTl = gsap.timeline({ paused: true })
          .to("#value03 .section-title", { y: 0, autoAlpha: 1, ease: "power2.out", duration: 0.8, immediateRender: false })
          .to("#value03 .keyword03 .line", { y: 0, autoAlpha: 1, ease: "sine.inOut", duration: 0.8 }, "<")
          .to("#value03 .keyword03 .line", { scaleX: 1, ease: "expo.out", duration: 0.9 }, ">0.1")
          .to("#value03 .keyword03 .keyword-text", { autoAlpha: 1, ease: "power3.out", duration: 0.8 }, "<")
          .to("#value03 .keyword03", { columnGap: "3vw", ease: "expo.out", duration: 0.8 }, "<");

        /* 3) 자동재생/역재생 트리거 */
        ScrollTrigger.create({
          trigger: "#value03",
          start: "top top",
          end: () => "+=" + window.innerHeight * 2,
          onEnter:      () => autoTl.play(0),
          onEnterBack:  () => autoTl.play(0),
          onLeaveBack:  () => autoTl.reverse(),
          invalidateOnRefresh: true
        });

        // matchMedia 해제 시 정리
        return () => {
          window.__value01Init = false;
          ScrollTrigger.getAll().forEach(st => st.kill());
          gsap.globalTimeline.clear();
        };
      });

      // 768px 이하일 때

      mm.add("(max-width: 767px)", () => {
        const section = document.querySelector("#value03");
        if (!section) return;

        const wrap  = section.querySelector(".video-wrap03");
        const title = wrap?.querySelector(".video-title");
        const desc  = wrap?.querySelector(".video-desc");
        if (!wrap || !title || !desc) return;

        // 초기 상태 (모바일에서만)
        gsap.killTweensOf([title, desc]);
        gsap.set([title, desc], { y: 20, autoAlpha: 0 });

        // 1) 핀 고정: top이 뷰포트 top에 닿는 순간부터,
        const pinST = ScrollTrigger.create({
          trigger: wrap,
          start: "top top",
          end: "bottom bottom",
          invalidateOnRefresh: true
        });

        // 2) 하단(bottom)이 뷰포트 하단(bottom)에 닿으면 0.3s 후 재생
        const tl = gsap.timeline({
          paused: true,
          defaults: { duration: 1.3, ease: "power2.out" }
        });
        tl.to(title, { y: 0, autoAlpha: 1 }, 0)
          .to(desc,  { y: 0, autoAlpha: 1 }, 0.5);

        const revealST = ScrollTrigger.create({
          trigger: wrap,
          start: "70% bottom",
          once: true, // 한 번만 실행
          onEnter: () => gsap.delayedCall(0.3, () => tl.play())
        });

        // 🔧 반응형 전환(cleanup)
        return () => {
          pinST.kill();
          revealST.kill();
          tl.kill();
        };
      });
    })();


    /* =========================
     * 5) 미디어 로딩/리사이즈 후 갱신
     * ========================= */
    function refreshOnMediaLoad(scope = document) {
      const media = scope.querySelectorAll('img, video, source');
      let remain = media.length;
      if (remain === 0) { safeRefresh(); return; }
      const done = () => { if (--remain === 0) safeRefresh(); };
      media.forEach(el => {
        if (el.tagName === 'VIDEO') {
          if (el.readyState >= 2) done(); else el.addEventListener('loadeddata', done, { once: true });
        } else if ('complete' in el && el.complete) {
          done();
        } else {
          el.addEventListener('load', done, { once: true });
        }
      });
    }
    refreshOnMediaLoad();

    // 디버깅 헬퍼 (선택)
    window.dumpST = function(){
      const st = ScrollTrigger.getAll();
      console.log("ST count:", st.length);
      st.forEach((t, i) => {
        console.group(`ST[#${i}]`);
        console.log("trigger:", t.trigger);
        console.log("start/end:", t.start, t.end, "scrub:", !!t.vars.scrub, "pin:", !!t.vars.pin);
        console.log("pinType:", t.pinType);
        console.groupEnd();
      });
      document.querySelectorAll(".pin-spacer").forEach((sp, i) => {
        const s = getComputedStyle(sp);
        console.log(`#pin-spacer[${i}]`, { h: s.height, mt: s.marginTop, mb: s.marginBottom, pos: s.position, bg: s.backgroundColor });
      });
    };
  });

  // === 서브Visual 공통 ===
  const visualConfig = {
    nav: "header.sub-header .logo > a, .sub-header .depth1 > li > a, .sub-header .menu-mall > p",             
    selector: ".visual",             
    video: ".visual .sub-video",       
    breadcrumb: ".visual .breadcrumb-list a",
    homeIcon: ".visual .breadcrumb-list.home",
    text: ".visual .visual-text",   
    textWrap: ".visual .visual-text-wrap",             

    // 애니메이션 옵션
    easeIn: "power3.out",
    easeOut: "power4.out",
    duration: 1.2,
    delay: 0.2,
  };

  (function visualInteraction() {
    const v = visualConfig;

    // 초기 상태
    gsap.set([v.nav], { color: "#000" });
    gsap.set([v.breadcrumb], { color: "#000", "--arrow-color": "#000" });
    gsap.set([v.homeIcon], {"--arrow-color": "#000" });
    gsap.set([v.text], {color: "#000" });
    gsap.set([v.textWrap], {width: "65vw"});
    gsap.set([v.video], {width: "65vw", y:"570px" });

    // 애니메이션 타임라인
    const tl = gsap.timeline({
      defaults: { duration: v.duration, ease: v.easeOut },
      scrollTrigger: {
        trigger: v.selector,
        start: "top top",
        end: () => "+=" + window.innerHeight * 2,
        scrub: true,
        pin: true,
        toggleAction: "play none none none",
        pinSpacing: true,
        // once: true,
        // markers: true
      },
    });

    tl.to(v.video, { width: "100%", y:"0", duration:3 })
      .to(v.text, { color: "#fff",  duration:3}, "<")
      .to(v.textWrap, {width: "81vw"}, "<")
      .to(v.breadcrumb, { color: "#fff", "--arrow-color": "#fff"},"<+0.2")
      .to(v.homeIcon, { "--arrow-color": "#fff"},"<")
      .to(v.nav, { color: "#fff" },"<+0.4")
      // .to(v.breadcrumb, { autoAlpha: 1, y: 0, ease: v.easeOut }, "<+0.2")

  })();


    // 서브페이지 헤더 글자색 변경에 따른 색상 오류
    function startForceBlack() {
      const targets = document.querySelectorAll(
        "header.sub-header .logo > a, .sub-header .depth1 > li > a, .sub-header .menu-mall > p"
      );

      if (window._gnbTicker) return;

      window._gnbTicker = function forceBlackTick() {
        targets.forEach(el => el.style.setProperty("color", "#000", "important"));
        document.documentElement.style.setProperty("--arrow-color", "#000", "important");
      };

      gsap.ticker.add(window._gnbTicker);
    }

    function stopForceBlack() {
      const targets = document.querySelectorAll(
        "header.sub-header .logo > a, .sub-header .depth1 > li > a, .sub-header .menu-mall > p"
      );

      if (window._gnbTicker) {
        gsap.ticker.remove(window._gnbTicker);
        window._gnbTicker = null;
      }

      // 우리가 강제한 스타일만 해제 (GSAP 상태로 복귀)
      targets.forEach(el => el.style.removeProperty("color"));
      document.documentElement.style.removeProperty("--arrow-color");

      if (window.visualTL) {
        const p = window.visualTL.progress();
        window.visualTL.progress(p);
      }
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }

      // #gnb에 호버 연결
      $("#gnb").on("mouseenter", function () {
        startForceBlack(); 
      });

      $("#header").on("mouseleave", function () {
        stopForceBlack();    
      });


  /* =========================
  * 헤더 깜빡임 없앰
  * ========================= */

    const SELECTOR = "header.sub-header .logo > a, .sub-header .depth1 > li > a, .sub-header .menu-mall > p, .visual .breadcrumb-list a";

    function startForceBlack() {
      document.body.classList.add("gnb-no-transition");

      // 즉시 한 번만 검정으로 (ticker 시작 전, 깜빡임 방지)
      document.querySelectorAll(SELECTOR).forEach(el=>{
        el.classList.add("gnb-color-target");
        el.style.setProperty("color", "#000", "important");
      });
      document.documentElement.style.setProperty("--arrow-color", "#000", "important");

      if (window._gnbTicker) return;
      window._gnbTicker = function () {
        // 필요할 때만 찍기(값 같으면 다시 쓰지 않음)
        document.querySelectorAll(SELECTOR).forEach(el=>{
          if (getComputedStyle(el).color !== "rgb(0, 0, 0)") {
            el.style.setProperty("color", "#000", "important");
          }
        });
        if (getComputedStyle(document.documentElement).getPropertyValue("--arrow-color").trim() !== "#000") {
          document.documentElement.style.setProperty("--arrow-color", "#000", "important");
        }
      };
      gsap.ticker.add(window._gnbTicker);
    }

    function stopForceBlack() {
      if (window._gnbTicker) {
        gsap.ticker.remove(window._gnbTicker);
        window._gnbTicker = null;
      }
      // 우리가 건 것만 제거
      document.querySelectorAll(SELECTOR).forEach(el=>{
        el.style.removeProperty("color");
      });
      document.documentElement.style.removeProperty("--arrow-color");

      // 한 프레임 뒤에 전환 켜기(깜빡임 방지)
      requestAnimationFrame(()=>{
        document.body.classList.remove("gnb-no-transition");
      });

      // 현재 스크롤 상태 재렌더
      if (window.visualTL) {
        const p = window.visualTL.progress();
        window.visualTL.progress(p);
      }
    }



  /********************* 
     기본 페이드인 애니메이션
   ********************/

  const fadeIn = gsap.utils.toArray('.fade-in');
    gsap.set(fadeIn, {y: 50, opacity: 0});
    fadeIn.forEach(fadeInItem => {
        gsap.to(fadeInItem, {
            y: 0,
            autoAlpha: 1,
            duration: 1,
            stagger: 0.3,
            ease: "power2.out",
            scrollTrigger: {
                trigger: fadeInItem,
                start: 'top 75%',
                toggleActions: "play none none none",
            }
        });
    });

    
gsap.registerPlugin(ScrollTrigger);

document.querySelectorAll('.fade-scope').forEach(scope => {
  const items = Array.from(scope.querySelectorAll('*')).filter(el => {
    return el.closest('.fade-scope') === scope;
  });

  gsap.set(items, { y: 50, autoAlpha: 0 });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        gsap.to(entry.target, {
          y: 0,
          autoAlpha: 1,
          duration: 1,
          ease: "power2.out"
        });

        // 한 번만 실행 (되돌릴 필요 없으면 unobserve)
        io.unobserve(entry.target);
      }
    });
  }, {
    root: null,               
    threshold: 0.2,            // 요소가 20% 이상 보여야 실행
    rootMargin: '0px 0px -15% 0px'  // 아래쪽으로 15% 남았을 때 트리거
  });

  items.forEach(el => io.observe(el));
});



})();