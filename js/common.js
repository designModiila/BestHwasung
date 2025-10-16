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
        // breakpoints: { 0:{slidesPerView:1,spaceBetween:12}, 1024:{slidesPerView:2,spaceBetween:0} },
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
        $(".gnb_bg").stop().animate({height:"213px"},300);
        $(".gnb_bg").addClass("on");
        $(".depth2").stop().animate({height:"213px"},300);
        // 안전 갱신
        safeRefresh();
      }
      function gnbhide(){
        $(".gnb_bg").stop().animate({height:"0px"},300);
        $(".depth2").stop().animate({height:"0px"},300, function(){
          $("#header").removeClass("on");
          safeRefresh();
        });
        $(".gnb_bg").removeClass("on");
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

    /* =========================
     * 4) 메인 Value 타임라인들
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

    /* 1) 핀 + 스크럽 타임라인: 비디오 이동(이후)만 유지 */
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
        .to("#value01 .video-wrap01 .video-title", { y: 0, autoAlpha: 1, ease: "sine.inOut" })
        .to("#value01 .video-wrap01 .video-desc",  { y: 0, autoAlpha: 1, ease: "sine.inOut" });

      /* 2) 자동재생 타임라인: 초반 5개 액션 */
      const autoTl = gsap.timeline({ paused: true })
        .to("#value01 .section-title", { y: 0, autoAlpha: 1, ease: "power2.out", duration: 0.8, immediateRender: false })
        .to("#value01 .keyword01 .line", { y: 0, autoAlpha: 1, ease: "sine.inOut", duration: 0.8 }, "<")
        .to("#value01 .keyword01 .line", { scaleX: 1, ease: "expo.out", duration: 0.9 }, ">0.1")
        .to("#value01 .keyword01 .keyword-text", { autoAlpha: 1, ease: "power3.out", duration: 0.8 }, "<")
        .to("#value01 .keyword01", { columnGap: "3vw", ease: "expo.out", duration: 0.8 }, "<");

      /* 3) 핀 구간 안에서 자동재생/역재생 트리거 */
      ScrollTrigger.create({
        trigger: "#value01",
        start: "top top",                          
        end: () => "+=" + window.innerHeight * 2,  
        onEnter:      () => autoTl.play(0),
        onEnterBack:  () => autoTl.play(0),
        onLeaveBack:  () => autoTl.reverse(),      
        // onLeave:    () => autoTl.pause(),        // 필요시 아래쪽으로 나갈 때 멈추기
        invalidateOnRefresh: true
      });
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

      /* 1) 핀 + 스크럽 타임라인: 비디오 이동(이후)만 유지 */
      const tl2 = gsap.timeline({
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


      tl2
        .to("#value02 .video-wrap02", { y: "-100vh", ease: "none", delay: 1, duration: 2 })
        .to("#value02 .video-wrap02 .video-title", { y: 0, autoAlpha: 1, ease: "sine.inOut" })
        .to("#value02 .video-wrap02 .video-desc",  { y: 0, autoAlpha: 1, ease: "sine.inOut" });

      /* 2) 자동재생 타임라인: 초반 5개 액션 */
      const autoTl = gsap.timeline({ paused: true })
        .to("#value02 .keyword02 .line", { y: 0, autoAlpha: 1, ease: "sine.inOut", duration: 0.8 }, "<")
        .to("#value02 .keyword02 .line", { scaleX: 1, ease: "expo.out", duration: 0.9 }, ">0.1")
        .to("#value02 .keyword02 .keyword-text", { autoAlpha: 1, ease: "power3.out", duration: 0.8 }, "<")
        .to("#value02 .keyword02", { columnGap: "3vw", ease: "expo.out", duration: 0.8 }, "<");

      /* 3) 핀 구간 안에서 자동재생/역재생 트리거 */
      ScrollTrigger.create({
        trigger: "#value02",
        start: "top top",                          
        end: () => "+=" + window.innerHeight * 2,  
        onEnter:      () => autoTl.play(0),
        onEnterBack:  () => autoTl.play(0),
        onLeaveBack:  () => autoTl.reverse(),      
        // onLeave:    () => autoTl.pause(),        // 필요시 아래쪽으로 나갈 때 멈추기
        invalidateOnRefresh: true
      });
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

      /* 1) 핀 + 스크럽 타임라인: 비디오 이동(이후)만 유지 */
      const tl3 = gsap.timeline({
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


      tl3
        .to("#value03 .video-wrap03", { y: "-100vh", ease: "none", delay: 1, duration: 2 })
        .to("#value03 .video-wrap03 .video-title", { y: 0, autoAlpha: 1, ease: "sine.inOut" })
        .to("#value03 .video-wrap03 .video-desc",  { y: 0, autoAlpha: 1, ease: "sine.inOut" });

      /* 2) 자동재생 타임라인: 초반 5개 액션 */
      const autoTl = gsap.timeline({ paused: true })
        .to("#value03 .keyword03 .line", { y: 0, autoAlpha: 1, ease: "sine.inOut", duration: 0.8 }, "<")
        .to("#value03 .keyword03 .line", { scaleX: 1, ease: "expo.out", duration: 0.9 }, ">0.1")
        .to("#value03 .keyword03 .keyword-text", { autoAlpha: 1, ease: "power3.out", duration: 0.8 }, "<")
        .to("#value03 .keyword03", { columnGap: "3vw", ease: "expo.out", duration: 0.8 }, "<");

      /* 3) 핀 구간 안에서 자동재생/역재생 트리거 */
      ScrollTrigger.create({
        trigger: "#value03",
        start: "top top",                          
        end: () => "+=" + window.innerHeight * 2,  
        onEnter:      () => autoTl.play(0),
        onEnterBack:  () => autoTl.play(0),
        onLeaveBack:  () => autoTl.reverse(),      
        // onLeave:    () => autoTl.pause(),        // 필요시 아래쪽으로 나갈 때 멈추기
        invalidateOnRefresh: true
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
    textWrap: ".visual .visual-inner",             
    video: ".visual .sub-video",       
    breadcrumb: ".visual .breadcrumb-list a",
    homeIcon: ".visual .breadcrumb-list.home",
    text: ".visual .visual-text",   

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
    gsap.set([v.text], {x: "10%", color: "#000" });
    gsap.set([v.video], {scale: 0.62, y:"600px", transformOrigin: "center top" });

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
        markers: true
      },
    });

    tl.to(v.video, { scale: 1, y:"0", transformOrigin: "center top", duration:3 })
      .to(v.text, { x: "0", color: "#fff",  duration:3}, "<")
      .to(v.breadcrumb, { color: "#fff", "--arrow-color": "#fff"},"<+0.2")
      .to(v.homeIcon, { "--arrow-color": "#fff"},"<")
      .to(v.nav, { color: "#fff" },"<+0.4")
      // .to(v.breadcrumb, { autoAlpha: 1, y: 0, ease: v.easeOut }, "<+0.2")

  })();


  /********************* 
     기본 페이드인 애니메이션
   ********************/

  const fadeIn = gsap.utils.toArray('.fade-in');
    gsap.set(fadeIn, {y: '30%', opacity: 0});
    fadeIn.forEach(fadeInItem => {
        gsap.to(fadeInItem, {
            y: 0,
            autoAlpha: 1,
            duration: 0.5,
            stagger: 0.3,
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

  // 초기 상태 (보이지 않게)
  gsap.set(items, { y: 50, autoAlpha: 0 });

  // 각 요소별로 IntersectionObserver 연결
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 실제 뷰포트에 들어온 순간 GSAP 애니메이션 실행
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
    root: null,                // 뷰포트 기준
    threshold: 0.2,            // 요소가 20% 이상 보여야 실행
    rootMargin: '0px 0px -15% 0px'  // 아래쪽으로 15% 남았을 때 트리거
  });

  items.forEach(el => io.observe(el));
});



(function () {
  const track = document.getElementById('clientTrack');
  if (!track) return;

  // 이미 복제되어 있지 않다면 한 번 더 복제 (무한 루프용)
  if (!track.dataset.cloned) {
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true'); // 접근성
    // 복제된 노드의 자식들만 가져와 track 뒤에 붙임
    while (clone.firstElementChild) {
      track.appendChild(clone.firstElementChild);
    }
    track.dataset.cloned = 'true';
  }

  // 속도/시간 자동 계산 (너비에 비례)
  function setMarqueeDuration() {
    // 원본 그룹의 실제 너비 = 전체의 절반
    const totalWidth = track.scrollWidth;
    const groupWidth = totalWidth / 2;

    // px당 시간(초). 숫자(속도)는 취향에 맞게 조절: 값이 작을수록 빠름
    const secondsPerPx = 0.02; // 0.02s per px -> 1000px = 20s
    const duration = Math.max(12, groupWidth * secondsPerPx);

    track.style.animationDuration = `${duration}s`;
  }

  // 이미지 로드 완료 후 정확한 너비 재계산
  function whenImagesReady(cb) {
    const imgs = track.querySelectorAll('img');
    let remain = imgs.length;
    if (remain === 0) { cb(); return; }
    imgs.forEach(img => {
      if (img.complete) { if (--remain === 0) cb(); }
      else img.addEventListener('load', () => { if (--remain === 0) cb(); }, { once: true });
    });
  }

  whenImagesReady(setMarqueeDuration);
  window.addEventListener('load', setMarqueeDuration);
  window.addEventListener('resize', () => {
    // 리사이즈 시 애니메이션을 잠깐 끊고 재적용하면 끊김 적음
    track.style.animation = 'none';
    requestAnimationFrame(() => {
      track.style.animation = '';
      setMarqueeDuration();
    });
  });
})();

})();