const cases = [
  {
    id: 'terminal', index: '01 / 03', title: 'ПЛАТЁЖНЫЙ|ТЕРМИНАЛ', poster: 'PAY|FAST',
    subtitle: 'Интерфейс терминала самообслуживания с понятным и быстрым сценарием оплаты.',
    overview: 'Учебный продуктовый проект для курса ВТБ. Задача — спроектировать пользовательский сценарий оплаты, структуру экранов и интерфейс терминала с фокусом на понятность взаимодействия.',
    format: 'Курс ВТБ · учебный проект', year: '2025'
  },
  {
    id: 'cosmetics', index: '02 / 03', title: 'МАГАЗИН|КОСМЕТИКИ', poster: 'SKIN|CARE',
    subtitle: 'Многостраничный e-commerce интерфейс на основе единой компонентной системы.',
    overview: 'Учебный проект интернет-магазина косметики. В работе были спроектированы структура сайта и основные страницы, собраны переиспользуемые компоненты и выстроена визуальная консистентность экранов.',
    format: 'Учебный проект · e-commerce', year: '2025'
  },
  {
    id: 'estate', index: '03 / 03', title: 'АГЕНТСТВО|НЕДВИЖИМОСТИ', poster: 'PLACE|01',
    subtitle: 'Лендинг, который последовательно знакомит с предложением и ведёт к обращению.',
    overview: 'Фриланс-проект лендинга агентства недвижимости: от структуры и содержания блоков до макета в Figma, адаптации под разные устройства и реализации на Tilda.',
    format: 'Фриланс · лендинг', year: '2025'
  }
];

const params = new URLSearchParams(window.location.search);
const currentIndex = Math.max(0, cases.findIndex((item) => item.id === params.get('id')));
const current = cases[currentIndex];
const previous = cases[(currentIndex - 1 + cases.length) % cases.length];
const next = cases[(currentIndex + 1) % cases.length];
const lines = (value) => value.split('|').join('<br>');

document.title = `${current.title.replace('|', ' ')} — Владислава Задорожная`;
document.querySelector('[data-case-title]').innerHTML = lines(current.title);
document.querySelector('[data-case-title]').lastChild.parentElement.innerHTML = lines(current.title).replace(/<br>/, '<span>') + '</span>';
document.querySelector('[data-case-subtitle]').textContent = current.subtitle;
document.querySelector('[data-case-poster]').innerHTML = lines(current.poster);
document.querySelector('[data-case-index]').textContent = current.index;
document.querySelector('[data-case-overview]').textContent = current.overview;
document.querySelector('[data-case-format]').textContent = current.format;
document.querySelector('[data-case-year]').textContent = current.year;
const caseHref = (item) => {
  if (item.id === 'terminal') return 'case-vtb.html';
  if (item.id === 'cosmetics') return 'case-cosmetics.html';
  return `case.html?id=${item.id}`;
};
document.querySelector('[data-prev-link]').href = caseHref(previous);
document.querySelector('[data-prev-title]').textContent = previous.title.replace('|', ' ');
document.querySelector('[data-next-link]').href = caseHref(next);
document.querySelector('[data-next-title]').textContent = next.title.replace('|', ' ');
