import {execFileSync} from 'node:child_process';
import {statSync} from 'node:fs';
const slides=JSON.parse(execFileSync('osascript',['-l','JavaScript','scripts/prepare-presentation-assets.js'],{encoding:'utf8',maxBuffer:1024*1024}));
let standard=0,hires=0;
for(const slide of slides)for(const variant of slide.variants){
  const target='assets/graphic/'+variant.name+'.webp';
  execFileSync('cwebp',['-quiet','-lossless','-m','6','/tmp/portfolio-presentation-exports/'+variant.name+'.png','-o',target]);
  if(variant.name.endsWith('-hires'))hires+=statSync(target).size;
  else standard+=statSync(target).size;
}
console.log(JSON.stringify({slides,standardMB:Number((standard/1024/1024).toFixed(2)),hiresMB:Number((hires/1024/1024).toFixed(2))}));
