import Splide from "@splidejs/splide";
import InputmaskModule from "inputmask";

document.addEventListener("DOMContentLoaded", () => {
  ///Слайдер
  const slider = document.querySelector(".splide");

  if (slider) {
    new Splide(slider, {
      type: 'slide',
      perPage: 3,
      gap: '50px',
      arrows: true,
      pagination: false,
      breakpoints: {
        1199: {
          perPage: 2,
          gap: '20px',
        },
        768: {
          perPage: 1,
          gap: '10px',
        },
      },
    }).mount();
  }

  ///Стилизация активных ссылок
  const links = document.querySelectorAll(".header__link");
  const currentPath =
    window.location.pathname.replace(".html", "").split("/")[1] || "home";

  links.forEach((link) => {
    const page = link.getAttribute("data-page");
    if (page === currentPath) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
  ///

  ///Маска///
  const Inputmask = InputmaskModule.default;
  const phoneInput = document.querySelectorAll("input[type=tel]");

  if (phoneInput) {

    phoneInput.forEach((input) => {

      const mask = new Inputmask({
        mask: "+7 (999) 999-99-99",
        showMaskOnHover: false,
        showMaskOnFocus: true,
        clearIncomplete: true,
        // Защита от вставки "8" или "+7" в начало
        onBeforePaste: (pastedValue) => {
          return pastedValue.replace(/^(\+7|8)/, "");
        },
      });

      mask.mask(input);
    }

    );
  }


  ///Бургер
  const burger = document.querySelector(".burger");
  const menu = document.querySelector(".header__nav");

  if (burger && menu) {
    burger.addEventListener("click", () => {
      burger.classList.toggle("active");
      menu.classList.toggle("active");
    });

    // клик вне контейнера
    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!menu.contains(target) && !burger.contains(target)) {
        menu.classList.remove("active");
        burger.classList.remove("active");
      }
    });
  }
  ///табы
  document.querySelectorAll('.schedule-wrapper').forEach(wrapper => {
    const tabButtons = wrapper.querySelectorAll('.schedule-page__tab-btn');
    const items = wrapper.querySelectorAll('.schedule-page__item');

    function switchTab(day) {
      tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.day === day));
      items.forEach(item => item.classList.toggle('active', item.dataset.day === day));
    }

    if (window.matchMedia('(max-width: 1199.9px)').matches && tabButtons.length) {
      wrapper.classList.add('tabs-enabled');
      switchTab(tabButtons[0].dataset.day);

      tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          switchTab(btn.dataset.day);
        });
      });
    }
  });

  ///

});
