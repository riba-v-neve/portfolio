import { readFileSync } from 'node:fs';
const helpers=readFileSync(new URL('./check-graphic-layout.mjs',import.meta.url),'utf8').split("const pages = ['index.html'")[0];
const baseline=process.argv.includes('--before');
const checks=`
function check(value,message){if(!value)throw new Error(message);console.log('PASS: '+message)}
async function captureCards(width){
  const clip=await evaluate(\`(() => {const r=document.querySelector('.work-list').getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,width:r.width,height:r.height,scale:1}})()\`);
  const result=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip});
  writeFileSync('/tmp/graphic-portfolio-qa/mobile-cards-${baseline?'before':'after'}-'+width+'.png',Buffer.from(result.data,'base64'));
}
try{
  await send('Emulation.setEmulatedMedia',{media:'',features:[]});
  await send('Emulation.setTouchEmulationEnabled',{enabled:true,configuration:'mobile'});
  for(const width of ${baseline?'[390]':'[320,360,390,430,600,760]'}){
    await loadPage('index.html',width);
    const state=await evaluate(\`(() => {
      const cards=Array.from(document.querySelectorAll('.work-card'));
      return {width:innerWidth,rootWidth:document.documentElement.scrollWidth,hover:matchMedia('(hover:hover)').matches,
        cards:cards.map(card=>{const art=card.querySelector('.work-art'),text=card.querySelector('.work-copy > p:last-child');return {name:card.className,height:Math.round(card.getBoundingClientRect().height),copyHeight:Math.round(card.querySelector('.work-copy').getBoundingClientRect().height),gap:Math.round(art.getBoundingClientRect().top-text.getBoundingClientRect().bottom),artHeight:Math.round(art.getBoundingClientRect().height),overflow:getComputedStyle(art).overflow,broken:Array.from(card.querySelectorAll('img')).filter(i=>!i.naturalWidth).length}}),
        headings:Array.from(document.querySelectorAll('.work-copy h3')).filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.innerText),
        scattered:Array.from(document.querySelectorAll('.presentation-tile')).every(e=>getComputedStyle(e).transform!=='none'),
        contained:Array.from(document.querySelectorAll('.social-preview img,.presentation-tile,.web-preview--collection .web-mini-browser')).every(e=>{const r=e.getBoundingClientRect(),card=e.closest('.work-card').getBoundingClientRect();return r.left>=card.left+5&&r.right<=card.right-5&&r.top>=card.top&&r.bottom<=card.bottom-8}),
        clipped:Array.from(document.querySelectorAll('.social-preview img,.presentation-tile,.web-preview--collection .web-mini-browser')).flatMap(e=>{const r=e.getBoundingClientRect(),card=e.closest('.work-card').getBoundingClientRect();return r.left>=card.left+5&&r.right<=card.right-5&&r.top>=card.top&&r.bottom<=card.bottom-8?[]:[{name:e.className||e.getAttribute('src'),left:r.left-card.left,right:card.right-r.right,bottom:card.bottom-r.bottom}]}),
        socialImages:Array.from(document.querySelectorAll('.social-preview img')).map(e=>({position:getComputedStyle(e).position,width:getComputedStyle(e).width,left:getComputedStyle(e).left,transform:getComputedStyle(e).transform})),
        columns:Array.from(document.querySelectorAll('.deck-preview img')).map(e=>e.getAttribute('src').split('/').pop().split('-')[0])};
    })()\`);
    console.log(JSON.stringify(state));
    if(!${baseline})check(state.width===state.rootWidth&&!state.headings.length&&state.cards.every(c=>c.gap<=18&&!c.broken)&&state.scattered&&state.contained,'Compact, scattered, unclipped previews at '+width+'px');
    if(width===390||width===760)await captureCards(width);
  }
  if(!${baseline}){
    await send('Emulation.setTouchEmulationEnabled',{enabled:false});
    await loadPage('index.html',1440);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1,y:1});
    await pause(700);
    check(await evaluate(\`Array.from(document.querySelectorAll('.presentation-tile')).every(e=>getComputedStyle(e).transform!=='none')\`),'Desktop preview remains scattered');
    await evaluate(\`document.querySelector('.work-card--presentations').scrollIntoView({block:'center'})\`);
    const point=await evaluate(\`(() => {const r=document.querySelector('.deck-preview').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()\`);
    await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point});
    await pause(800);
    check(await evaluate(\`Array.from(document.querySelectorAll('.presentation-tile')).every(e=>getComputedStyle(e).transform==='none')\`),'Desktop hover still aligns the slides');
    check(!runtimeErrors.length,'No JavaScript exceptions');
  }
}finally{socket.close()}
`;
try{await import('data:text/javascript;base64,'+Buffer.from(helpers+checks).toString('base64'))}
catch(error){console.error(error.message);process.exitCode=1}
