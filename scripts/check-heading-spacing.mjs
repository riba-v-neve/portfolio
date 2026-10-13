// Audit heading tracking and wrapping; generate a print preview, not a publication.
import { readFileSync } from 'node:fs';
const helpers=readFileSync(new URL('./check-graphic-layout.mjs',import.meta.url),'utf8')
  .split("const pages = ['index.html'")[0];
const checks=`
try {
  await send('Emulation.setTouchEmulationEnabled',{enabled:false});
  await send('Emulation.setEmulatedMedia',{features:[]});
  const pages=['index.html','case-social.html','case-presentations.html','case-lighthouse.html','case.html','case-vtb.html','case-cosmetics.html','resume.html'];
  for (const width of [360,390,768,1440]) {
    for (const page of pages) {
      await loadPage(page,width);
      const state=await evaluate(\`(() => {
        const headings=Array.from(document.querySelectorAll('h1,h2,h3,.case-nav b,.statement-copy > p,.mobile-menu a'));
        const visible=headings.filter(e=>e.getBoundingClientRect().width>0);
        return {width:innerWidth,rootWidth:document.documentElement.scrollWidth,
          squeezed:visible.filter(e=>getComputedStyle(e).fontFamily.includes('Benzin') && parseFloat(getComputedStyle(e).letterSpacing)<=0).map(e=>e.innerText),
          overflow:visible.filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>({text:e.innerText,width:e.clientWidth,content:e.scrollWidth})),
          clipped:visible.filter(e=>{const range=document.createRange();range.selectNodeContents(e);return Array.from(range.getClientRects()).some(rect=>rect.width>0&&(rect.left<-.5||rect.right>innerWidth+.5));}).map(e=>e.innerText)};
      })()\`);
      console.log(JSON.stringify({page,...state}));
      if(state.squeezed.length || state.clipped.length || state.width!==state.rootWidth)process.exitCode=1;
      if(width===1440 || (width===390 && ['index.html','case-social.html','case-presentations.html','resume.html'].includes(page)))await screenshot('tracking-'+page.replace('.html','')+'-'+width);
    }
  }
  await loadPage('resume.html',794);
  await send('Emulation.setEmulatedMedia',{media:'print'});
  await pause(300);
  const pdf=await send('Page.printToPDF',{printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false});
  writeFileSync('/tmp/graphic-portfolio-qa/resume-tracking.pdf',Buffer.from(pdf.data,'base64'));
  await send('Emulation.setEmulatedMedia',{media:''});
  console.log('Runtime errors: '+JSON.stringify(runtimeErrors));
  if(runtimeErrors.length)process.exitCode=1;
} finally {socket.close();}
`;
try {await import('data:text/javascript;base64,'+Buffer.from(helpers+checks).toString('base64'));}
catch(error){console.error(error.message);process.exitCode=1;}
