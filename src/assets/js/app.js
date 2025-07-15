import Splide from "@splidejs/splide";

document.addEventListener("DOMContentLoaded", () => {
  ///Слайдер
  if (document.querySelector(".splide")) {
    new Splide(".splide", {
      perPage: 3,
      gap: "50px",
      type: "slide",
      breakpoints: {
        1024: {
          perPage: 2,
          gap: "20px",
        },
        768: {
          perPage: 1,
          gap: "10px",
        },
      },
      arrows: true,
      pagination: false,
      prevEl: ".splide__arrow--prev",
      nextEl: ".splide__arrow--next",
    }).mount();
  }
  ///

  ///Стилизация активных ссылок
  const links = document.querySelectorAll(".header__link");
  const currentPath = window.location.pathname.replace(".html", "").split("/")[1] || "home";

  links.forEach((link) => {
    const page = link.getAttribute("data-page");
    if (page === currentPath) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
  ///

  
});
