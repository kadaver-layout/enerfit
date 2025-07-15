import Splide from '@splidejs/splide';

new Splide('.splide', {
  perPage: 3,
  gap: '50px',
  type: 'slide',
  breakpoints: {
    1024: {
      perPage: 2,
      gap: '20px',
    },
    768: {
      perPage: 1,
      gap: '10px',
    },
  },
  arrows: true,
  pagination: false,
  prevEl: '.splide__arrow--prev',
  nextEl: '.splide__arrow--next'

}).mount();