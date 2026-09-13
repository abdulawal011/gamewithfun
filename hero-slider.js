/* =========================================================
   GAMEWITHFUN - HERO BANNER SLIDER
   3 BANNERS
   AUTO CHANGE EVERY 3 SECONDS
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  // Find the hero slider
  const slider = document.querySelector(".hero-slider");

  // If slider doesn't exist, stop
  if (!slider) {
    console.log("Hero slider not found.");
    return;
  }

  // Find all hero banners
  const slides = Array.from(
    slider.querySelectorAll(".hero")
  );

  // If there are no banners, stop
  if (slides.length === 0) {
    console.log("No hero banners found.");
    return;
  }

  let currentSlide = 0;

  // Show selected banner
  function showSlide(index) {

    slides.forEach(function (slide, i) {

      if (i === index) {
        slide.classList.add("active");
      } else {
        slide.classList.remove("active");
      }

    });

  }

  // Show first banner
  showSlide(currentSlide);


  // Change banner every 3 seconds
  if (slides.length > 1) {

    setInterval(function () {

      currentSlide++;

      // Go back to first banner
      if (currentSlide >= slides.length) {
        currentSlide = 0;
      }

      showSlide(currentSlide);

    }, 5000);

  }

});
