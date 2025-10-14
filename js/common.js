
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  document.addEventListener('DOMContentLoaded', function () {
    /* =========================
     * 1) Swiper (있는 경우 먼저)
     * ========================= */
    if (window.Swiper) {
      const swiper = new Swiper('.products-swiper', {
        slidesPerView: 2,
        spaceBetween: 0,
        loop: true,
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        breakpoints: { 0:{slidesPerView:1,spaceBetween:12}, 1024:{slidesPerView:2,spaceBetween:0} }
      });
      swiper.on('resize', () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
      swiper.on('slideChangeTransitionEnd', () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
    }

    /* =========================
     * 2) GSAP + Lenis + ScrollTrigger 연결
     * ========================= */
    gsap.registerPlugin(ScrollTrigger);

    let lenis = null;
    if (window.Lenis) {
      lenis = new Lenis({ duration: 0.9, smoothWheel: true, smoothTouch: false });

      // GSAP ticker로 Lenis 구동 (타이밍 정확)
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);

      // Lenis 스크롤 이벤트로 ST 업데이트
      lenis.on('scroll', ScrollTrigger.update);
    }

    // ★ 모든 ST가 참조할 스크롤러를 통일 (문서 루트)
    const SCROLLER = document.documentElement;
    if (lenis) {
      ScrollTrigger.scrollerProxy(SCROLLER, {
        scrollTop(value) {
          if (arguments.length) {
            lenis.scrollTo(value, { immediate: true });
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


    
    /* =========================
     * 3) 헤더/GNB (열고닫기 후 ST 갱신)
     * ========================= */
    (function gnb() {
      function gnbshow(){
        $("#header").addClass("on");
        $(".gnb_bg").stop().animate({height:"213px"},300);
        $(".gnb_bg").addClass("on");
        $(".depth2").stop().animate({height:"213px"},300);
      }
      function gnbhide(){
        $(".gnb_bg").stop().animate({height:"0px"},300);
        $(".depth2").stop().animate({height:"0px"},300, function(){
          $("#header").removeClass("on");
          
        });
        $(".gnb_bg").removeClass("on");
      }

      $("#gnb, .logo").on("mouseover", gnbshow);
      $("#gnb").on("mouseleave", gnbhide);
      

      $("#gnb .depth1>li")
        .on("mouseover", function(){
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
          $("#gnb, .logo").on("mouseover", gnbshow);
          $("#gnb").on("mouseleave", gnbhide);
        } else {
          $(this).addClass("on");
          gnbshow();
          $("#gnb").off();
        }
       
      });

      // $(window).on("scroll", function(){
      //   const wintop = $(window).scrollTop();
      //   $("#header").toggleClass("scroll", wintop > 100);
      // });
    })();

    

    /* =========================
     * 4) Value 타임라인 생성
     *    - 모든 ST는 scroller 기본값을 이미 공유
     *    - pinReparent 켜서 레이어 충돌 방지
     * ========================= */

    // ---------- value01 ----------
    (function(){
      if (window.__value01Init) return; window.__value01Init = true;

      gsap.set("#value01 .keyword01 .keyword-text", { autoAlpha: 0 });
      gsap.set("#value01 .keyword01", { columnGap: 0 });
      gsap.set("#value01 .section-title", { y: 50, autoAlpha: 0 });
      gsap.set("#value01 .keyword01 .line", { y: 100, autoAlpha: 0, scaleX: 0.1, transformOrigin: 'center center' });
      gsap.set("#value01 .video-wrap01", { y: "0vh" });
      gsap.set("#value01 .video-wrap01 .video-title", { y: 50, autoAlpha: 0 });
      gsap.set("#value01 .video-wrap01 .video-desc",  { y: 50, autoAlpha: 0 });

      const tl1 = gsap.timeline({
        scrollTrigger: {
          trigger: "#value01",
          start: "top top",
          end: () => "+=" + window.innerHeight * 2,
          scrub: true,
          pin: true,
          pinReparent: true,
          pinSpacing: true,
          anticipatePin: 1
        }
      });

      tl1.to("#value01 .section-title", { y: 0, autoAlpha: 1, ease: "power2.out"})
         .to("#value01 .keyword01 .line", { y: 0, autoAlpha: 1, ease: "sine.inOut"}, "<")
         .to("#value01 .keyword01 .line", { scaleX: 1, ease: "sine.inOut", delay: 1})
         .to("#value01 .keyword01 .keyword-text", { autoAlpha: 1, ease: "power3.out"}, "<")
         .to("#value01 .keyword01", { columnGap: "3vw", ease: "sine.inOut"}, "<")
         .to("#value01 .video-wrap01", { y: "-100vh", ease: "none", delay: 1, scrub: true, duration:2 })
         .to("#value01 .video-wrap01 .video-title", { y: 0, autoAlpha: 1, ease: "sine.inOut"})
         .to("#value01 .video-wrap01 .video-desc",  { y: 0, autoAlpha: 1, ease: "sine.inOut"});
    })();

    // ---------- value02 ----------
    (function(){
      if (window.__value02Init) return; window.__value02Init = true;

      gsap.set("#value02 .keyword02 .keyword-text", { autoAlpha: 0 });
      gsap.set("#value02 .keyword02", { columnGap: 0 });
      gsap.set("#value02 .keyword02 .line", { y: 100, autoAlpha: 0, scaleX: 0.1, transformOrigin: 'center center' });
      gsap.set("#value02 .video-wrap02", { y: "0vh" });
      gsap.set("#value02 .video-wrap02 .video-title", { y: 50, autoAlpha: 0 });
      gsap.set("#value02 .video-wrap02 .video-desc",  { y: 50, autoAlpha: 0 });

      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: "#value02",
          start: "top top",
          end: () => "+=" + window.innerHeight * 2,
          scrub: true,
          pin: true,
          pinReparent: true,
          pinSpacing: true,
          anticipatePin: 1
        }
      });

      tl2.to("#value02 .keyword02 .line", { y: 0, autoAlpha: 1, ease: "sine.inOut"}, "<")
         .to("#value02 .keyword02 .line", { scaleX: 1, ease: "sine.inOut", delay: 1})
         .to("#value02 .keyword02 .keyword-text", { autoAlpha: 1, ease: "power3.out"}, "<")
         .to("#value02 .keyword02", { columnGap: "3vw", ease: "sine.inOut"}, "<")
         .to("#value02 .video-wrap02", { y: "-100vh", ease: "none", delay: 1, scrub: true, duration:2 })
         .to("#value02 .video-wrap02 .video-title", { y: 0, autoAlpha: 1, ease: "sine.inOut"})
         .to("#value02 .video-wrap02 .video-desc",  { y: 0, autoAlpha: 1, ease: "sine.inOut"});
    })();

    // ---------- value03 ----------
    (function(){
      if (window.__value03Init) return; window.__value03Init = true;

      gsap.set("#value03 .keyword03 .keyword-text", { autoAlpha: 0 });
      gsap.set("#value03 .keyword03", { columnGap: 0 });
      gsap.set("#value03 .keyword03 .line", { y: 100, autoAlpha: 0, scaleX: 0.1, transformOrigin: 'center center' });
      gsap.set("#value03 .video-wrap03", { y: "0vh" });
      gsap.set("#value03 .video-wrap03 .video-title", { y: 50, autoAlpha: 0 });
      gsap.set("#value03 .video-wrap03 .video-desc",  { y: 50, autoAlpha: 0 });

      const tl3 = gsap.timeline({
        scrollTrigger: {
          trigger: "#value03",
          start: "top top",
          end: () => "+=" + window.innerHeight * 2,
          scrub: true,
          pin: true,
          pinReparent: true,
          pinSpacing: true,
          anticipatePin: 1
        }
      });

      tl3.to("#value03 .keyword03 .line", { y: 0, autoAlpha: 1, ease: "sine.inOut"}, "<")
         .to("#value03 .keyword03 .line", { scaleX: 1, ease: "sine.inOut", delay: 1})
         .to("#value03 .keyword03 .keyword-text", { autoAlpha: 1, ease: "power3.out"}, "<")
         .to("#value03 .keyword03", { columnGap: "3vw", ease: "sine.inOut"}, "<")
         .to("#value03 .video-wrap03", { y: "-100vh", ease: "none", delay: 1, scrub: true, duration:2 })
         .to("#value03 .video-wrap03 .video-title", { y: 0, autoAlpha: 1, ease: "sine.inOut"})
         .to("#value03 .video-wrap03 .video-desc",  { y: 0, autoAlpha: 1, ease: "sine.inOut"});
    })();

    /* =========================
     * 5) 미디어 로딩/리사이즈 후 갱신
     * ========================= */
    function refreshOnMediaLoad(scope = document) {
      const media = scope.querySelectorAll('img, video, source');
      let remain = media.length;
      if (remain === 0) { ScrollTrigger.refresh(); return; }
      const done = () => { if (--remain === 0) ScrollTrigger.refresh(); };
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
    window.addEventListener('load', () => ScrollTrigger.refresh());
    window.addEventListener('resize', () => ScrollTrigger.refresh());

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
})();

