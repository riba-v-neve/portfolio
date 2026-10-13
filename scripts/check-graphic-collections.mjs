// Read-only browser checks for the local preview (Chrome CDP port 9234).
import { readFileSync } from 'node:fs';

// Reuse the existing browser helpers without its broad audit or PDF export.
const helpers = readFileSync(new URL('./check-graphic-layout.mjs', import.meta.url), 'utf8')
  .split("const pages = ['index.html'")[0];
const checks = `
function check(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS: ' + message);
}

try {
  await send('Emulation.setTouchEmulationEnabled',{enabled:false});
  await send('Emulation.setEmulatedMedia',{features:[]});
  for (const width of [390, 768, 1440]) {
    for (const page of ['index.html','case-social.html','case-presentations.html','case-lighthouse.html']) {
      await loadPage(page, width);
      const state = await evaluate(\`({width:innerWidth,rootWidth:document.documentElement.scrollWidth,
        missing:Array.from(document.images).filter(e=>e.getAttribute('src')&&!e.naturalWidth).map(e=>e.getAttribute('src')),
        headings:Array.from(document.querySelectorAll('h1,h2,h3')).filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.innerText),
        arrows:Array.from(document.querySelectorAll('.art-button')).filter(e=>getComputedStyle(e,'::after').content.includes('↗')).length,
        anchors:Array.from(document.querySelectorAll('.graphic-anchor-nav a')).every(e=>document.getElementById(e.hash.slice(1)))})\`);
      check(state.rootWidth === state.width && !state.missing.length && !state.headings.length && !state.arrows && state.anchors,
        page + ' at ' + width + 'px: layout, assets, headings, image overlays and anchor targets ' + JSON.stringify(state));
      if (page !== 'index.html') await screenshot('collections-' + page.replace('.html','') + '-' + width);
    }
  }

  await loadPage('case-social.html',1440);
  check(await evaluate(\`document.querySelectorAll('#racing [data-artwork]').length===6 && !document.body.innerText.includes('TEZIS') && !document.body.innerText.includes('Marvel') && !document.body.innerText.includes('Использую чёрный фон')\`), 'Autosport: six images, no other projects or removed description');
  check(await evaluate(\`(() => {
    const paragraph=document.querySelector('#overview .graphic-section-head > p');
    const text=paragraph.firstChild;
    const range=document.createRange();range.selectNodeContents(text);
    return range.getClientRects().length===1 && paragraph.querySelector('br')!==null;
  })()\`), 'Desktop introduction: first sentence on one line, explicit break before second');
  await evaluate(\`document.querySelector('#racing [data-artwork]').click()\`);
  check(await evaluate(\`document.querySelector('.art-viewer').open\`),'Autosport image enlargement still works');
  await evaluate(\`document.querySelector('.art-viewer-close').click()\`);

  await loadPage('case-presentations.html',1440);
  check(await evaluate(\`!document.querySelector('[data-artwork]') && !document.querySelector('.art-viewer') && !document.body.innerText.includes('увелич') && document.querySelectorAll('[data-deck]').length===4\`), 'Four presentation projects, no enlargement buttons, viewer or enlargement instructions');
  check(await evaluate(\`getComputedStyle(document.body).getPropertyValue('--case-accent').trim()==='#dc2872'\`),'Presentation page uses the portfolio pink accent');
  for (let index=0;index<4;index++) {
    await evaluate(\`document.querySelectorAll('[data-deck]')[\${index}].querySelector('[data-deck-direction="1"]').click()\`);
    await pause(750);
    check(await evaluate(\`(() => {const deck=document.querySelectorAll('[data-deck]')[\${index}];return deck.querySelector('.deck-track') ? deck.querySelector('.deck-track').scrollLeft>0 : deck.querySelector('[data-deck-status]').textContent.startsWith('2 /');})()\`),'Presentation ' + index + ' navigation works');
  }

  await loadPage('index.html',1440);
  const columns=await evaluate(\`(() => {
    const slides=Array.from(document.querySelectorAll('.deck-preview img')).map(e=>e.getAttribute('src').split('/').pop().split('-')[0]);
    return [0,1,2].map(column=>[slides[column],slides[column+3],slides[column+6]]);
  })()\`);
  check(columns.every(column=>column.length===3 && column.every(value=>value===column[0])),'Preview groups each presentation vertically: '+JSON.stringify(columns));
  await evaluate(\`document.querySelector('.work-card--presentations').scrollIntoView({block:'center'});\`);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:1});
  await pause(800);
  check(await evaluate(\`Array.from(document.querySelectorAll('.deck-preview .presentation-tile')).every(e=>getComputedStyle(e).transform!=='none')\`),'Preview tiles start scattered');
  await screenshot('presentation-preview-scattered',false);
  const point=await evaluate(\`(() => {const r=document.querySelector('.deck-preview').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()\`);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});
  await pause(800);
  check(await evaluate(\`Array.from(document.querySelectorAll('.deck-preview .presentation-tile')).every(e=>getComputedStyle(e).transform==='none')\`),'Hover aligns all nine tiles into the grid');
  await screenshot('presentation-preview-aligned',false);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:1});
  await evaluate(\`document.querySelector('.work-card--presentations').focus()\`);
  await pause(800);
  check(await evaluate(\`Array.from(document.querySelectorAll('.deck-preview .presentation-tile')).every(e=>getComputedStyle(e).transform==='none')\`),'Keyboard focus also aligns the preview');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  check(await evaluate(\`getComputedStyle(document.querySelector('.presentation-tile')).transitionDuration.split(',').every(value=>parseFloat(value)<=.00002)\`),'Reduced-motion preference disables tile transitions');
  await send('Emulation.setEmulatedMedia',{features:[]});

  await send('Emulation.setTouchEmulationEnabled',{enabled:true,configuration:'mobile'});
  await loadPage('index.html',390);
  await pause(750);
  check(await evaluate(\`!matchMedia('(hover: hover)').matches && Array.from(document.querySelectorAll('.deck-preview .presentation-tile')).every(e=>getComputedStyle(e).transform==='none')\`),'Touch preview starts as a stable grid');
  await evaluate(\`document.querySelector('.work-card--presentations').scrollIntoView({block:'center'})\`);
  await screenshot('presentation-preview-mobile',false);
  await send('Emulation.setTouchEmulationEnabled',{enabled:false});
  check(!runtimeErrors.length,'No browser runtime errors');
} finally {
  socket.close();
}
`;
try {
  await import('data:text/javascript;base64,' + Buffer.from(helpers + checks).toString('base64'));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
