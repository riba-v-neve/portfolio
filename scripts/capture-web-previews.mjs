import {readFileSync} from 'node:fs';
const helpers=readFileSync(new URL('./check-graphic-layout.mjs',import.meta.url),'utf8')
  .split("const pages = ['index.html'")[0];
const captures=`
try{
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:960,deviceScaleFactor:1,mobile:false});
 for(const [name,url] of [['bestoffer','https://bestoffer-estate.ru/'],['marvel-school','https://marvelprint.ru/school/']]){
  await send('Page.navigate',{url});
  await pause(6500);
  const state=await evaluate(\`({url:location.href,title:document.title,text:document.body?.innerText.slice(0,500),images:document.images.length})\`);
  console.log(JSON.stringify({name,...state}));
  if(!state.text||state.url.startsWith('chrome-error:'))continue;
  await evaluate(\`Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,3000))])\`);
  const shot=await send('Page.captureScreenshot',{format:'png'});
  writeFileSync('/tmp/graphic-portfolio-qa/web-'+name+'.png',Buffer.from(shot.data,'base64'));
 }
}finally{socket.close()}
`;
try{await import('data:text/javascript;base64,'+Buffer.from(helpers+captures).toString('base64'))}
catch(error){console.error(error.message);process.exitCode=1}
