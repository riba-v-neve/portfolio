import {readFileSync,existsSync} from 'node:fs';
const html=readFileSync('case-presentations.html','utf8');
for(const candidate of html.matchAll(/assets\/graphic\/[\w-]+\.webp/g)){
  if(!existsSync(candidate[0]))throw new Error('Missing slide asset '+candidate[0]);
}
const helpers=readFileSync(new URL('./check-graphic-layout.mjs',import.meta.url),'utf8')
  .split("const pages = ['index.html'")[0];
const checks=`
function check(value,message){if(!value)throw new Error(message);console.log('PASS: '+message)}
async function capture(selector,name){
 const clip=await evaluate(\`(() => {const r=document.querySelector('\${selector}').getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height,scale:1}})()\`);
 const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip});
 writeFileSync('/tmp/graphic-portfolio-qa/'+name+'.png',Buffer.from(shot.data,'base64'));
}
try{
 await send('Emulation.setTouchEmulationEnabled',{enabled:false});
 await send('Emulation.setEmulatedMedia',{features:[]});
 for(const width of [360,390,768,1440,2560]){
  await loadPage('case-presentations.html',width);
  const state=await evaluate(\`({width:innerWidth,root:document.documentElement.scrollWidth,
    stages:Array.from(document.querySelectorAll('[data-slideshow]')).map(stage=>({visible:stage.querySelectorAll('figure:not([hidden])').length,overflow:stage.scrollWidth>stage.clientWidth+1,background:getComputedStyle(stage).backgroundColor,border:getComputedStyle(stage).borderTopWidth})),
    portrait:{scrollable:document.querySelector('.deck-track--portrait').scrollWidth>document.querySelector('.deck-track--portrait').clientWidth,scrollbar:getComputedStyle(document.querySelector('.deck-track--portrait')).scrollbarWidth,webkit:getComputedStyle(document.querySelector('.deck-track--portrait'),'::-webkit-scrollbar').display},
    zoomButtons:document.querySelectorAll('[data-artwork]').length,broken:Array.from(document.images).filter(img=>img.getAttribute('src')&&!img.naturalWidth).map(img=>img.getAttribute('src'))})\`);
  check(state.width===state.root && state.stages.length===3 && state.stages.every(stage=>stage.visible===1&&!stage.overflow&&stage.border==='1px') && state.portrait.scrollable && state.portrait.scrollbar==='none' && state.portrait.webkit==='none' && !state.zoomButtons && !state.broken.length,
   'Slide layout at '+width+'px: '+JSON.stringify(state));
  for(const id of ['bambook','podvezi','alfa']){
   await evaluate(\`document.querySelector('#\${id} [data-deck-direction="1"]').click()\`);
   check(await evaluate(\`document.querySelector('#\${id} [data-deck-status]').textContent.startsWith('2 /') && document.querySelectorAll('#\${id} [data-slideshow] figure:not([hidden])').length===1\`), id+' next button at '+width);
   await evaluate(\`document.querySelector('#\${id} [data-deck-direction="-1"]').click()\`);
   check(await evaluate(\`document.querySelector('#\${id} [data-deck-status]').textContent.startsWith('1 /') && document.querySelector('#\${id} [data-deck-direction="-1"]').disabled\`), id+' previous button and first-slide boundary at '+width);
  }
  await evaluate(\`document.querySelector('#practicum [data-deck-direction="1"]').click()\`);
  await pause(750);
  check(await evaluate(\`document.querySelector('.deck-track--portrait').scrollLeft>0\`),'Coach booklet still scrolls at '+width);
  if(width===390||width===1440){await capture('#bambook','slide-bambook-'+width);await capture('#practicum','slide-practicum-'+width);}
 }
 await loadPage('case-presentations.html',1440);
 await evaluate(\`document.querySelector('#podvezi [data-slideshow]').focus()\`);
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
 check(await evaluate(\`document.querySelector('#podvezi [data-deck-status]').textContent==='2 / 9'\`),'Keyboard next slide works');
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'End',code:'End',windowsVirtualKeyCode:35});
 check(await evaluate(\`document.querySelector('#podvezi [data-deck-status]').textContent==='9 / 9' && document.querySelector('#podvezi [data-deck-direction="1"]').disabled\`),'End selects last slide, without wrapping');
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Home',code:'Home',windowsVirtualKeyCode:36});
 check(await evaluate(\`document.querySelector('#podvezi [data-deck-status]').textContent==='1 / 9'\`),'Home returns to first slide');

 await loadPage('case-presentations.html',1440,2);
 const density=await evaluate(\`(async () => {
  const images=Array.from(document.querySelectorAll('[data-slideshow] figure:not([hidden]) img'));
  await Promise.all(images.map(img=>img.decode()));
  return await Promise.all(images.map(async img=>{const bitmap=await createImageBitmap(img);const pixels=bitmap.width;bitmap.close();return {src:img.currentSrc,display:img.getBoundingClientRect().width,pixels:pixels,required:img.getBoundingClientRect().width*devicePixelRatio}}));
 })()\`);
 check(density.every(img=>img.src.includes('-hires.webp')&&img.pixels>=img.required),'Retina uses sufficiently large assets: '+JSON.stringify(density));
 await capture('#bambook','slide-bambook-retina');
 await evaluate(\`document.querySelector('#podvezi [data-deck-direction="1"]').click()\`);
 await evaluate(\`document.querySelector('#podvezi figure:not([hidden]) img').decode()\`);
 await capture('#podvezi','slide-podvezi-retina');

 await send('Emulation.setTouchEmulationEnabled',{enabled:true,configuration:'mobile'});
 await loadPage('case-presentations.html',390);
 await evaluate(\`document.querySelector('#bambook [data-slideshow]').scrollIntoView({block:'center'})\`);
 const point=await evaluate(\`(() => {const r=document.querySelector('#bambook [data-slideshow]').getBoundingClientRect();return {x:r.left+r.width*.8,y:r.top+r.height*.5}})()\`);
 await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});
 for(const offset of [30,60,90,120]){await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:point.x-offset,y:point.y}]});await pause(25);}
 await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 check(await evaluate(\`document.querySelector('#bambook [data-deck-status]').textContent==='2 / 4'\`),'Native mobile swipe changes exactly one slide');
 check(!runtimeErrors.length,'No browser runtime errors');
 await send('Emulation.setTouchEmulationEnabled',{enabled:false});
}finally{socket.close()}
`;
try{await import('data:text/javascript;base64,'+Buffer.from(helpers+checks).toString('base64'))}
catch(error){console.error(error.message);process.exitCode=1}
