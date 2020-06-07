'use strict';

var navBtn = document.querySelector('.nav-btn');
var nav = document.querySelector('.nav');
var navUserList = document.querySelector('.nav__user-list');
var body = document.body;

nav.style.transition = 'none';
body.classList.remove('no-js');
setTimeout(function () {
  nav.style.transition = '';
}, 300);

navBtn.addEventListener('click', function (e) {
  var curTarget = e.currentTarget;
  var pageBreakpoint = matchMedia('(min-width: 982px) and (max-width: 1309px');

  if (pageBreakpoint.matches) {
    navUserList.classList.toggle('nav__user-list--active');
    curTarget.classList.toggle('nav-btn--active');
  } else {
    if (body.classList.contains('menu-closed')) {
      body.style.top = (parseInt(window.scrollY, 10) * -1) + 'px';
      curTarget.classList.add('nav-btn--active');
      body.classList.remove('menu-closed');
    } else {
      var scrollY = body.style.top;
      curTarget.classList.remove('nav-btn--active');
      body.classList.add('menu-closed');

      body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0', 10) * -1);
    }
  }
});

// Слайдер

var programList = document.querySelector('.program__list');

var mySwiper;

var initSwiper = function () {
  mySwiper = new window.Swiper(programList, {
    loop: true,
    speed: 400,
    spaceBetween: 28,
    slidesPerView: 'auto',
    effect: 'coverflow',
    centeredSlides: true,
    coverflowEffect: {
      depth: 110,
      rotate: 0,
      slideShadows: false,
    }
  });
};

var breakpoint = window.matchMedia('(min-width: 982px)');

var checkBreakpoints = function () {
  if (breakpoint.matches === true) {
    if (mySwiper !== undefined) {
      mySwiper.destroy(true, true);
    }
    return;
  } else if (breakpoint.matches === false) {
    initSwiper();
  }
};

breakpoint.addListener(checkBreakpoints);

checkBreakpoints();
