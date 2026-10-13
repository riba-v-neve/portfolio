import { readFileSync } from 'node:fs';
const helpers = readFileSync(new URL('./check-graphic-layout.mjs',import.meta.url),'utf8').split("const pages = ['index.html'")[0];
const checks = `
function check(value,message){if(!value)throw new Error(message);console.log('PASS: '+message)}
async function captureElement(selector,name){
  const clip=await evaluate(\`(() => {const r=document.querySelector('\${selector}').getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height,scale:1}})()\`);
  const result=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip});
  writeFileSync('/tmp/graphic-portfolio-qa/'+name+'.png',Buffer.from(result.data,'base64'));
}
try {
  await send('Emulation.setTouchEmulationEnabled',{enabled:false});
  await send('Emulation.setEmulatedMedia',{features:[],media:''});
  for(const width of [360,390,768,1440,2560]){
    await loadPage('case-web.html',width);
    const state=await evaluate(\`({width:innerWidth,rootWidth:document.documentElement.scrollWidth,broken:Array.from(document.images).filter(i=>i.getAttribute('src')&&!i.naturalWidth).map(i=>i.getAttribute('src')),clipped:Array.from(document.querySelectorAll('h1,h2,h3')).filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.innerText),sites:Array.from(document.querySelectorAll('a.web-site-preview')).map(e=>e.href),draft:document.querySelector('#meetche .project-type').innerText,captions:document.querySelectorAll('figcaption').length})\`);
    check(state.width===state.rootWidth&&!state.broken.length&&!state.clipped.length&&!state.captions&&state.sites.join(',')==='https://bestoffer-estate.ru/,https://marvelprint.ru/school/'&&state.draft.toLowerCase().includes('макет'),'WEB collection at '+width+'px: '+JSON.stringify(state));
    if(width===390||width===1440)await screenshot('web-final-'+width);
  }
  await evaluate(\`document.querySelector('#meetche [data-artwork]').click()\`);
  check(await evaluate(\`document.querySelector('.art-viewer').open\`),'Unbuilt shop opens as a design mockup');
  await evaluate(\`document.querySelector('.art-viewer-close').click()\`);
  await loadPage('case-presentations.html',1440);
  check(await evaluate(\`Array.from(document.querySelectorAll('.deck-block')).map(e=>e.id).join(',')==='practicum,podvezi,alfa,bambook'\`),'Presentation order: coach, Podvezi, Alfa, Bambook');
  for(const width of [390,1440]){
    await loadPage('index.html',width);
    check(await evaluate(\`document.querySelector('.work-card--web').getAttribute('href')==='case-web.html' && getComputedStyle(document.querySelector('.work-card--presentations')).backgroundColor==='rgb(234, 233, 230)'\`),'Homepage WEB link and neutral presentation preview at '+width);
    await captureElement('.brand-preview','brand-centered-'+width);
  }
  await evaluate(\`document.querySelector('.work-card--brand').scrollIntoView({block:'center'})\`);
  const position=await evaluate(\`(() => {const r=document.querySelector('.work-card--brand').getBoundingClientRect();return {x:r.left+50,y:r.top+50}})()\`);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',...position});
  check(await evaluate(\`getComputedStyle(document.querySelector('.work-card--brand .card-arrow > span')).animationName==='work-arrow'\`),'Case arrow animates on hover');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  check(await evaluate(\`getComputedStyle(document.querySelector('.work-card--brand .card-arrow > span')).animationName==='none'\`),'Reduced motion disables the arrow animation');
  await send('Emulation.setEmulatedMedia',{features:[]});
  await loadPage('resume.html',794);
  check(await evaluate(\`(() => {const items=Array.from(document.querySelectorAll('.competency-grid article'));return items.find(e=>e.innerText.includes('Разработка айдентики')).innerText.includes('печати')&&!items.find(e=>e.innerText.includes('Дизайн сайтов')).innerText.includes('печать')})()\`),'Print belongs with identity, not websites');
  await send('Emulation.setEmulatedMedia',{media:'print'});
  const pdf=await send('Page.printToPDF',{printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false});
  writeFileSync('assets/docs/vladislava-zadorozhnaya-graphic-resume.pdf',Buffer.from(pdf.data,'base64'));
  await screenshot('resume-publish-print');
  check(!runtimeErrors.length,'No JavaScript exceptions');
}finally{socket.close()}
`;
try { await import('data:text/javascript;base64,'+Buffer.from(helpers+checks).toString('base64')); }
catch(error){ console.error(error.message); process.exitCode=1; }
