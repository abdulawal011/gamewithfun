/* =========================
   HERO SLIDER
   Auto slide: 3 seconds
========================= */

let currentHero = 0;
let heroTimer;

function getHeroSlides() {
  return document.querySelectorAll("#heroSlider .hero");
}

function getHeroDots() {
  return document.querySelectorAll(".hero-dots button");
}

function showHero(index) {

  const slides = getHeroSlides();
  const dots = getHeroDots();

  if (!slides.length) return;

  if (index >= slides.length) {
    index = 0;
  }

  if (index < 0) {
    index = slides.length - 1;
  }

  currentHero = index;

  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === currentHero);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentHero);
  });
}

function changeHero(direction) {
  showHero(currentHero + direction);

  restartHeroTimer();
}

function startHeroTimer() {
  heroTimer = setInterval(() => {
    showHero(currentHero + 1);
  }, 5000);
}

function restartHeroTimer() {
  clearInterval(heroTimer);
  startHeroTimer();
}

/* Start slider */
document.addEventListener("DOMContentLoaded", function () {

  showHero(0);

  startHeroTimer();

  const slider = document.getElementById("heroSlider");

  if (slider) {

    /* Pause while touching/hovering */
    slider.addEventListener("mouseenter", function () {
      clearInterval(heroTimer);
    });

    slider.addEventListener("mouseleave", function () {
      startHeroTimer();
    });

    /* Mobile touch support */
    let touchStartX = 0;

    slider.addEventListener("touchstart", function (e) {
      touchStartX = e.touches[0].clientX;
      clearInterval(heroTimer);
    }, { passive: true });

    slider.addEventListener("touchend", function (e) {

      const touchEndX = e.changedTouches[0].clientX;
      const difference = touchStartX - touchEndX;

      if (Math.abs(difference) > 50) {

        if (difference > 0) {
          changeHero(1);
        } else {
          changeHero(-1);
        }

      } else {
        startHeroTimer();
      }

    }, { passive: true });
  }
});
