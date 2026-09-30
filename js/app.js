"use strict";
const menu = document.querySelector('.menu-toggle');
const links = document.getElementById('navlinks');
if (menu && links) {
  const closeMenu = () => {
    menu.setAttribute('aria-expanded', 'false');
    links.classList.remove('open');
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    links.classList.toggle('open', open);
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      closeMenu();
      menu.focus();
    }
  });
}
