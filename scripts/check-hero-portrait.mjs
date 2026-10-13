import { readFileSync } from 'node:fs';
const helpers = readFileSync(new URL('./check-graphic-layout.mjs', import.meta.url), 'utf8')
  .split("const pages = ['index.html'")[0];
const checks = `
try {
  await send('Emulation.setEmulatedMedia',{features:[]});
  for (const [width,height] of [[360,640],[390,844],[430,932],[760,900],[1440,950]]) {
    await loadPage('index.html',width);
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<=760});
    await pause(350);
    const state=await evaluate(\`(() => {
      const image=document.querySelector('.hero-portrait img');
      const circle=document.querySelector('.portrait-pink');
      const ir=image.getBoundingClientRect(),cr=circle.getBoundingClientRect();
      return {width:innerWidth,rootWidth:document.documentElement.scrollWidth,mask:getComputedStyle(image).maskImage,circleBottom:cr.bottom,imageBottom:ir.bottom,heroHeight:document.querySelector('.hero').getBoundingClientRect().height};
    })()\`);
    if (state.width!==state.rootWidth) throw new Error('Horizontal overflow at '+width);
    if (width<=760 && (state.mask==='none' || state.circleBottom>state.imageBottom+.5)) throw new Error('Portrait/circle clipping mismatch '+JSON.stringify(state));
    if (width>760 && state.mask!=='none') throw new Error('Desktop portrait should not be clipped');
    console.log('PASS: portrait '+width+'x'+height+' '+JSON.stringify(state));
    await screenshot('hero-circle-'+width+'x'+height,false);
  }
} finally { socket.close(); }
`;
try {
  await import('data:text/javascript;base64,'+Buffer.from(helpers+checks).toString('base64'));
} catch (error) {
  console.error(error.message);
  process.exitCode=1;
}
