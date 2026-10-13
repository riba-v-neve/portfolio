// Run with: osascript -l JavaScript scripts/review-graphic-materials.js
ObjC.import('Foundation');
ObjC.import('AppKit');
ObjC.import('PDFKit');

var root = '/Users/williams_design/Desktop/portfolio/материалы для второй версии сайта';
var paths = [
  ['brandbook', '/Соцсети/фирстиль/Brandbook_Задорожная.pdf'],
  ['bambook', '/Дизайн презентаций/BamBook_presentation.pdf'],
  ['alfa', '/Дизайн презентаций/Без_тормозов_Альфа_Чемпионат_2026.pdf'],
  ['y2k', '/Дизайн презентаций/Y2K_Zadorozhnaya.pdf'],
  ['podvezi', '/Дизайн презентаций/podvezi_presentation.pdf'],
  ['practicum', '/Дизайн презентаций/презентация для практикума/презентация_9.pdf'],
  ['portfolio', '/презентация портфолио.pdf']
];
var output = '/tmp/portfolio-graphic-materials-review';
$.NSFileManager.defaultManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(output, true, $.NSDictionary.dictionary, null);
var texts = [];
for (var f = 0; f < paths.length; f++) {
  var item = paths[f];
  var pdf = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(root + item[1]));
  var count = Number(pdf.pageCount);
  texts.push('\nDOCUMENT ' + item[0] + ' / ' + count + ' pages');
  var width = 1200;
  var cellWidth = 400;
  var cellHeight = 275;
  var height = Math.ceil(count / 3) * cellHeight;
  var sheet = $.NSImage.alloc.initWithSize($.NSMakeSize(width, height));
  sheet.lockFocus;
  $.NSColor.colorWithCalibratedWhiteAlpha(0.93, 1).set;
  $.NSRectFill($.NSMakeRect(0, 0, width, height));
  for (var p = 0; p < count; p++) {
    var page = pdf.pageAtIndex(p);
    texts.push('PAGE ' + (p + 1) + '\n' + (ObjC.unwrap(page.string) || '[image-only]'));
    var thumb = page.thumbnailOfSizeForBox($.NSMakeSize(380, 250), 0);
    var size = thumb.size;
    var x = (p % 3) * cellWidth + (cellWidth - size.width) / 2;
    var y = height - (Math.floor(p / 3) + 1) * cellHeight + 20;
    thumb.drawInRectFromRectOperationFraction($.NSMakeRect(x, y, size.width, size.height), $.NSMakeRect(0, 0, 0, 0), 2, 1);
    var label = $.NSString.stringWithString(String(p + 1));
    label.drawAtPointWithAttributes($.NSMakePoint((p % 3) * cellWidth + 10, y - 10), $.NSDictionary.dictionary);
  }
  sheet.unlockFocus;
  var bitmap = $.NSBitmapImageRep.imageRepWithData(sheet.TIFFRepresentation);
  bitmap.representationUsingTypeProperties(4, $.NSDictionary.dictionary).writeToFileAtomically(output + '/' + item[0] + '.png', true);
}
texts.join('\n');
