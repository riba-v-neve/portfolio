import { readFileSync } from 'node:fs';
const helpers=readFileSync(new URL('./check-graphic-layout.mjs',import.meta.url),'utf8')
  .split("const pages = ['index.html'")[0];
const checks=`
function check(value,message){if(!value)throw new Error(message);console.log('PASS: '+message)}
async function captureGroup(selector,name){
  const clip=await evaluate(\`(() => {const r=document.querySelector('\${selector}').getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height,scale:1}})()\`);
  const capture=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip});
  writeFileSync('/tmp/graphic-portfolio-qa/'+name+'.png',Buffer.from(capture.data,'base64'));
}
try {
  await send('Emulation.setTouchEmulationEnabled',{enabled:false});
  await send('Emulation.setEmulatedMedia',{features:[]});
  for(const width of [360,390,768,1440,2560]){
    await loadPage('index.html',width);
    const state=await evaluate(\`(() => {
      const galleries=Array.from(document.querySelectorAll('.visual-masonry'));
      return {width:innerWidth,rootWidth:document.documentElement.scrollWidth,
        galleries:galleries.map(group=>({kind:group.dataset.galleryKind,count:group.querySelectorAll('[data-artwork]').length,columns:getComputedStyle(group).columnCount,
          shapes:new Set(Array.from(group.querySelectorAll('img')).map(img=>Math.round(img.getBoundingClientRect().height))).size,
          broken:Array.from(group.querySelectorAll('img')).filter(img=>!img.naturalWidth).length,
          distorted:Array.from(group.querySelectorAll('img')).filter(img=>Math.abs(img.getBoundingClientRect().width/img.getBoundingClientRect().height-img.naturalWidth/img.naturalHeight)>.01).length})),
        arrows:Array.from(document.querySelectorAll('#visual .art-button')).filter(e=>getComputedStyle(e,'::after').content.includes('↗')).length,
        captions:document.querySelectorAll('#visual figcaption').length,
        oldClubName:document.body.innerText.includes('Автоспортивный клуб')};
    })()\`);
    check(state.width===state.rootWidth && state.galleries.length===2 && state.galleries[0].count===13 && state.galleries[1].count===8 && state.galleries.every(g=>!g.broken&&!g.distorted&&g.shapes>=2) && !state.arrows && !state.captions && !state.oldClubName,
      'Mosaic galleries at '+width+'px: '+JSON.stringify(state));
    if(width===390||width===1440){await captureGroup('[aria-labelledby="graphic-gallery-title"]','gallery-graphics-'+width);await captureGroup('[aria-labelledby="photo-gallery-title"]','gallery-photos-'+width);}
  }
  await loadPage('index.html',1440);
  await evaluate(\`document.querySelector('[data-gallery-kind="graphics"] [data-artwork]').click()\`);
  check(await evaluate(\`document.querySelector('.art-viewer').open\`),'Graphic viewer opens');
  await evaluate(\`document.querySelector('.art-viewer-prev').click()\`);
  check(await evaluate(\`document.querySelector('.art-viewer img').src.endsWith('/gallery-billie.webp')\`),'Graphic gallery cycles within its own thirteen works');
  await evaluate(\`document.querySelector('.art-viewer-close').click()\`);
  await evaluate(\`document.querySelector('[data-gallery-kind="photos"] [data-artwork]').click()\`);
  await evaluate(\`document.querySelector('.art-viewer-next').click()\`);
  check(await evaluate(\`document.querySelector('.art-viewer img').src.endsWith('/gallery-water-one.webp')\`),'Photo viewer stays within the photography gallery');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  check(await evaluate(\`!document.querySelector('.art-viewer').open\`),'Escape closes the image');
  await loadPage('resume.html',794);
  await send('Emulation.setEmulatedMedia',{media:'print'});
  await pause(300);
  const pdf=await send('Page.printToPDF',{printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false});
  writeFileSync('/tmp/graphic-portfolio-qa/resume-gallery-final.pdf',Buffer.from(pdf.data,'base64'));
  await send('Emulation.setEmulatedMedia',{media:''});
  check(!runtimeErrors.length,'No browser errors');
} finally {socket.close()}
`;
try {await import('data:text/javascript;base64,'+Buffer.from(helpers+checks).toString('base64'))}
catch(error){console.error(error.message);process.exitCode=1}
