// Export the user's selected gallery artwork without changing the originals.
ObjC.import('Foundation');
ObjC.import('AppKit');
var root='/Users/williams_design/Desktop/portfolio/материалы для второй версии сайта/избранное для галереи';
var output='/tmp/portfolio-gallery-exports';
$.NSFileManager.defaultManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(output,true,$.NSDictionary.dictionary,null);
var pictures=[
  ['gallery-mustang','4.1_постер 2.png','Постер Ford Mustang'],
  ['gallery-cruella','poster 1.png','Постер «Круэлла»'],
  ['gallery-subway','poster_2 1.png','Постер Subway New York'],
  ['gallery-billie','Клаузура_2_Задорожная.png','Типографический постер Billie Eilish'],
  ['gallery-terminal','рендер_полный с фоном.png','3D-композиция с платёжным терминалом и банковскими картами'],
  ['gallery-racing-one','1.png','Праздничный пост для Клуба Автоспорта ИТМО'],
  ['gallery-racing-four','4.png','Анонс студенческой гонки Клуба Автоспорта ИТМО'],
  ['gallery-web-school','A4 - 1.png','Сайт Marvel Print на ноутбуке'],
  ['gallery-alfa-cover','file-001 2.png','Обложка презентации «Альфа Старт»'],
  ['gallery-podvezi-problems','file-002 1.png','Слайд презентации «Подвези»'],
  ['gallery-podvezi-cover','file-001 1.png','Обложка презентации «Подвези»'],
  ['gallery-lighthouse-identity','Корпоративная_1.png','Логотип и паттерн музея «Дом маяков»'],
  ['gallery-lighthouse-cards','мокап_1.png','Визитки музея «Дом маяков»'],
  ['gallery-glass-neutral','фотография/DSCF2946_после.jpg','Предметная фотография стеклянной бутылки'],
  ['gallery-glass-blue','фотография/DSCF2962_после.jpg','Стеклянная бутылка с голубой подсветкой'],
  ['gallery-water-one','фотография/IMG_2642_после.jpg','Предметная фотография бутылки Baikal'],
  ['gallery-water-two','фотография/IMG_2652_после.jpg','Бутылка Baikal в синем свете'],
  ['gallery-portrait-one','фотография/артем_1.jpg','Студийный чёрно-белый портрет'],
  ['gallery-portrait-two','фотография/артем_2.jpg','Студийный портрет в пальто'],
  ['gallery-portrait-three','фотография/артем_3.jpg','Чёрно-белый портрет с динамичной позой'],
  ['gallery-portrait-four','фотография/артем_4.jpg','Чёрно-белый поясной портрет']
];
var result=[];
for(var i=0;i<pictures.length;i++) {
  var original=$.NSImage.alloc.initWithContentsOfFile(root+'/'+pictures[i][1]);
  var source=$.NSBitmapImageRep.imageRepWithData(original.TIFFRepresentation);
  var pixelWidth=Number(source.pixelsWide),pixelHeight=Number(source.pixelsHigh);
  var scale=Math.min(1,1800/Math.max(pixelWidth,pixelHeight));
  var width=Math.round(pixelWidth*scale),height=Math.round(pixelHeight*scale);
  var resized=$.NSImage.alloc.initWithSize($.NSMakeSize(width,height));
  resized.lockFocus;
  original.drawInRectFromRectOperationFraction($.NSMakeRect(0,0,width,height),$.NSMakeRect(0,0,0,0),2,1);
  resized.unlockFocus;
  var bitmap=$.NSBitmapImageRep.imageRepWithData(resized.TIFFRepresentation);
  bitmap.representationUsingTypeProperties(4,$.NSDictionary.dictionary).writeToFileAtomically(output+'/'+pictures[i][0]+'.png',true);
  result.push({name:pictures[i][0],width:width,height:height,alt:pictures[i][2]});
}
JSON.stringify(result);
