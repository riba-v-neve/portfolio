import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
const pictures=JSON.parse(execFileSync('osascript',['-l','JavaScript','scripts/prepare-gallery-assets.js'],{encoding:'utf8'}));
let total=0;
for(const picture of pictures) {
  const target='assets/graphic/'+picture.name+'.webp';
  execFileSync('cwebp',['-quiet','-q','88','-m','6','/tmp/portfolio-gallery-exports/'+picture.name+'.png','-o',target]);
  total+=statSync(target).size;
}
console.log(JSON.stringify({pictures,totalMB:Number((total/1024/1024).toFixed(2))}));
