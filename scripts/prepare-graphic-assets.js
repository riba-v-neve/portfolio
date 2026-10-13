// macOS: osascript -l JavaScript scripts/prepare-graphic-assets.js
// Exports provided artwork for the website without altering the source files.
ObjC.import('Foundation');
ObjC.import('AppKit');
ObjC.import('PDFKit');
var root = '/Users/williams_design/Desktop/portfolio/материалы для второй версии сайта';
var output = '/tmp/portfolio-graphic-exports';
$.NSFileManager.defaultManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(output, true, $.NSDictionary.dictionary, null);
function saveImage(image, name) {
  var bitmap = $.NSBitmapImageRep.imageRepWithData(image.TIFFRepresentation);
  bitmap.representationUsingTypeProperties(4, $.NSDictionary.dictionary).writeToFileAtomically(output + '/' + name + '.png', true);
}
var documents = [
  ['brand', '/Соцсети/фирстиль/Brandbook_Задорожная.pdf', [1,3,4,5,7,11]],
  ['bambook', '/Дизайн презентаций/BamBook_presentation.pdf', [1,4,6,8]],
  ['alfa', '/Дизайн презентаций/Без_тормозов_Альфа_Чемпионат_2026.pdf', [1,2,8,10]],
  ['podvezi', '/Дизайн презентаций/podvezi_presentation.pdf', [1,3,5,7]],
  ['practicum', '/Дизайн презентаций/презентация для практикума/презентация_9.pdf', [1,3,5,8]]
];
for (var d = 0; d < documents.length; d++) {
  var document = documents[d];
  var pdf = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(root + document[1]));
  for (var p = 0; p < document[2].length; p++) {
    var number = document[2][p];
    saveImage(pdf.pageAtIndex(number - 1).thumbnailOfSizeForBox($.NSMakeSize(1800,1800),0), document[0] + '-' + number);
  }
}
var pictures = [
  ['racing-1','/Соцсети/автоспорт/1.png'],
  ['racing-2','/Соцсети/автоспорт/2.png'],
  ['racing-3','/Соцсети/автоспорт/3.png'],
  ['racing-4','/Соцсети/автоспорт/4.png'],
  ['racing-5','/Соцсети/автоспорт/Какую гонку выберешь ты_.png'],
  ['racing-6','/Соцсети/автоспорт/4T.png'],
  ['tezis-desktop','/Соцсети/Оформление шапки сообщества вк/шапка_pc.jpg'],
  ['tezis-mobile','/Соцсети/Оформление шапки сообщества вк/шапка_phone.png'],
  ['print-social','/Соцсети/1 сентября.png'],
  ['poster-billie-1','/Соцсети/крсивые постеры/Клаузура_2_Задорожная.png'],
  ['poster-billie-2','/Соцсети/крсивые постеры/Клаузура_3_Задорожная.png'],
  ['brand-mockup-1','/Соцсети/фирстиль/мокап_1.png'],
  ['brand-mockup-2','/Соцсети/фирстиль/мокап_2.png'],
  ['brand-card-front','/Соцсети/фирстиль/Личная_1.png'],
  ['brand-card-back','/Соцсети/фирстиль/Личная_2.png'],
  ['photo-water','/Дизайн презентаций/Предметная фотография/Фототех/IMG_2633_после.jpg'],
  ['photo-glass','/Дизайн презентаций/Предметная фотография/Фототех/DSCF2962_после.jpg'],
  ['photo-keyring-blue','/Дизайн презентаций/Предметная фотография/Брелки/Hit Me Hard And Soft/3_Hit Me Hard And Soft.png'],
  ['photo-keyring-red','/Дизайн презентаций/Предметная фотография/Брелки/dont smile at me/3_dont smile at me.png']
];
for (var i = 0; i < pictures.length; i++) {
  var original = $.NSImage.alloc.initWithContentsOfFile(root + pictures[i][1]);
  var size = original.size;
  var scale = Math.min(1, 1800 / Math.max(size.width,size.height));
  var w = Math.round(size.width * scale), h = Math.round(size.height * scale);
  var resized = $.NSImage.alloc.initWithSize($.NSMakeSize(w,h));
  resized.lockFocus;
  original.drawInRectFromRectOperationFraction($.NSMakeRect(0,0,w,h),$.NSMakeRect(0,0,0,0),2,1);
  resized.unlockFocus;
  saveImage(resized,pictures[i][0]);
}
// Two standalone posters available only inside the portfolio PDF.
var portfolio = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(root + '/презентация портфолио.pdf'));
var posterPage = portfolio.pageAtIndex(2).thumbnailOfSizeForBox($.NSMakeSize(3600,2400),0);
var posterSize = posterPage.size;
var crops = [['poster-mustang', .0622],['poster-cruella', .3656]];
for (var c = 0; c < crops.length; c++) {
  var cropped = $.NSImage.alloc.initWithSize($.NSMakeSize(964,1362));
  cropped.lockFocus;
  posterPage.drawInRectFromRectOperationFraction(
    $.NSMakeRect(0,0,964,1362),
    $.NSMakeRect(posterSize.width*crops[c][1],posterSize.height*.1808,posterSize.width*.2678,posterSize.height*.6729),2,1);
  cropped.unlockFocus;
  saveImage(cropped,crops[c][0]);
}
'Exported ' + (pictures.length + crops.length) + ' images and 22 PDF pages to ' + output;
