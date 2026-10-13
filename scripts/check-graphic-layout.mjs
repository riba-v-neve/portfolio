import { writeFileSync, mkdirSync } from 'node:fs';

const targets = await (await fetch('http://127.0.0.1:9234/json')).json();
const target = targets.find(item => item.type === 'page');
if (!target) throw new Error('Local preview browser is not running.');
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let sequence = 0;
const pending = new Map();
const runtimeErrors = [];
const loadedDocuments = new Set();
socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.method === 'Page.lifecycleEvent' && message.params.name === 'load') loadedDocuments.add(message.params.loaderId);
  if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails.text);
  if (!message.id) return;
  const request = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) request.reject(new Error(JSON.stringify(message.error)));
  else request.resolve(message.result);
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence;
  pending.set(id, { resolve, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
await send('Runtime.enable');
await send('Page.enable');
await send('Page.setLifecycleEventsEnabled', { enabled: true });
await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
mkdirSync('/tmp/graphic-portfolio-qa', { recursive: true });

async function loadPage(path, width, deviceScaleFactor = 1) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 950, deviceScaleFactor, mobile: width < 760 });
  const navigation = await send('Page.navigate', { url: 'http://127.0.0.1:5173/' + path });
  if (navigation.errorText) throw new Error(navigation.errorText);
  for (let attempt = 0; navigation.loaderId && !loadedDocuments.has(navigation.loaderId); attempt++) {
    if (attempt > 200) throw new Error('Preview page did not finish loading: ' + path);
    await pause(100);
  }
  await evaluate(`(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelectorAll('.reveal').forEach(e => {e.classList.add('is-visible');e.style.transition='none'});
    document.querySelectorAll('img').forEach(e => e.loading = 'eager');
    await document.fonts.ready;
    await Promise.all(Array.from(document.images).map(img => img.complete ? Promise.resolve() : new Promise(resolve => {img.onload=resolve;img.onerror=resolve})));
    window.scrollTo(0,0);
  })()`);
  await pause(300);
}

async function screenshot(name, full = true) {
  const layout = await send('Page.getLayoutMetrics');
  const size = layout.cssContentSize;
  const params = { format: 'png', captureBeyondViewport: full };
  if (full) params.clip = { x: 0, y: 0, width: size.width, height: Math.min(size.height, 14000), scale: 1 };
  const result = await send('Page.captureScreenshot', params);
  writeFileSync('/tmp/graphic-portfolio-qa/' + name + '.png', Buffer.from(result.data, 'base64'));
}

const pages = ['index.html', 'case-social.html', 'case-presentations.html', 'case-lighthouse.html', 'case.html', 'case-vtb.html', 'case-cosmetics.html', 'resume.html'];
for (const width of [390, 1440]) {
  for (const page of pages) {
    await loadPage(page, width);
    const state = await evaluate(`({width:innerWidth,rootWidth:document.documentElement.scrollWidth,brokenImages:Array.from(document.images).filter(e=>e.getAttribute('src')&&!e.naturalWidth).map(e=>e.getAttribute('src')),headingOverflow:Array.from(document.querySelectorAll('h1,h2,h3')).filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>({text:e.innerText,width:e.clientWidth,content:e.scrollWidth})),captions:document.querySelectorAll('figcaption').length,title:document.title})`);
    console.log(JSON.stringify({ page, width, ...state }));
    await screenshot(page.replace('.html','') + '-' + width);
  }
}

await loadPage('index.html', 360);
console.log('Narrow mobile: ' + JSON.stringify(await evaluate(`({width:innerWidth,rootWidth:document.documentElement.scrollWidth})`)));
await screenshot('index-360');
await evaluate(`document.querySelector('[data-menu-button]').click()`);
console.log('Mobile menu: ' + JSON.stringify(await evaluate(`({expanded:document.querySelector('[data-menu-button]').getAttribute('aria-expanded'),visible:document.querySelector('[data-mobile-menu]').classList.contains('is-open')})`)));
await evaluate(`document.querySelector('[data-mobile-menu] a').click()`);
console.log('Menu closes after navigation: ' + await evaluate(`document.querySelector('[data-menu-button]').getAttribute('aria-expanded') === 'false'`));

await loadPage('case-social.html', 1440);
await evaluate(`document.querySelector('[data-artwork]').click()`);
console.log('Viewer opens: ' + await evaluate(`document.querySelector('.art-viewer').open`));
const beforeImage = await evaluate(`document.querySelector('.art-viewer img').src`);
await evaluate(`document.querySelector('.art-viewer-next').click()`);
console.log('Viewer next image: ' + await evaluate(`document.querySelector('.art-viewer img').src !== ${JSON.stringify(beforeImage)}`));
await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
await pause(100);
console.log('Escape closes viewer: ' + await evaluate(`!document.querySelector('.art-viewer').open && !document.body.classList.contains('art-viewer-open')`));
await loadPage('case-presentations.html', 1440);
console.log('Presentations are scroll-only: ' + await evaluate(`!document.querySelector('[data-artwork]') && !document.querySelector('.art-viewer') && !document.body.innerText.includes('нажмите, чтобы увеличить')`));
await evaluate(`document.querySelector('[data-deck-direction="1"]').click()`);
await pause(700);
console.log('Deck scroll control: ' + await evaluate(`document.querySelector('.deck-track').scrollLeft > 0`));

await loadPage('index.html', 2560);
console.log('Large display: ' + JSON.stringify(await evaluate(`({width:innerWidth,rootWidth:document.documentElement.scrollWidth,cardWidth:document.querySelector('.work-card').getBoundingClientRect().width})`)));
await screenshot('index-2560');

await loadPage('resume.html', 794);
await send('Emulation.setEmulatedMedia', { media: 'print' });
await pause(300);
await screenshot('resume-print');
const pdf = await send('Page.printToPDF', { printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false });
writeFileSync('assets/docs/vladislava-zadorozhnaya-graphic-resume.pdf', Buffer.from(pdf.data, 'base64'));
await send('Emulation.setEmulatedMedia', { media: '' });
console.log('Runtime errors: ' + JSON.stringify(runtimeErrors));
socket.close();
