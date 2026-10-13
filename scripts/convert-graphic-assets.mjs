import { readdirSync, mkdirSync, copyFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const destination = resolve('assets/graphic');
mkdirSync(destination, { recursive: true });
let total = 0;
for (const name of readdirSync('/tmp/portfolio-graphic-exports')) {
  if (!name.endsWith('.png')) continue;
  const target = resolve(destination, name.replace(/\.png$/, '.webp'));
  execFileSync('cwebp', ['-quiet', '-q', '88', '-m', '6', '/tmp/portfolio-graphic-exports/' + name, '-o', target]);
  total += statSync(target).size;
}
const source = resolve('материалы для второй версии сайта');
const pdfs = [
  ['presentations-bambook.pdf', '/Дизайн презентаций/BamBook_presentation.pdf'],
  ['presentations-alfa.pdf', '/Дизайн презентаций/Без_тормозов_Альфа_Чемпионат_2026.pdf'],
  ['presentations-podvezi.pdf', '/Дизайн презентаций/podvezi_presentation.pdf'],
  ['presentations-practicum.pdf', '/Дизайн презентаций/презентация для практикума/презентация_9.pdf'],
  ['brand-lighthouse.pdf', '/Соцсети/фирстиль/Brandbook_Задорожная.pdf']
];
for (const [name,path] of pdfs) copyFileSync(source + path, resolve('assets/docs',name));
console.log(`Optimized website images: ${(total / 1024 / 1024).toFixed(1)} MB. Original PDFs copied separately.`);
