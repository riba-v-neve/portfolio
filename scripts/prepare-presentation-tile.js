// Extract the slides supplied in плитка.pdf without changing the original.
// Historical review helper. Current website slides are exported directly from
// their source PDFs by scripts/convert-presentation-assets.mjs instead.
// macOS: osascript -l JavaScript scripts/prepare-presentation-tile.js
ObjC.import('Foundation');
ObjC.import('AppKit');
ObjC.import('PDFKit');
var source = '/Users/williams_design/Desktop/portfolio/материалы для второй версии сайта/плитка.pdf';
var output = '/tmp/portfolio-graphic-exports';
$.NSFileManager.defaultManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(output, true, $.NSDictionary.dictionary, null);
var pdf = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(source));
var sheet = pdf.pageAtIndex(0).thumbnailOfSizeForBox($.NSMakeSize(3600,3600),0);
var size = sheet.size;
// Coordinates measured on the 1800 × 1026 contact sheet, excluding its gutters.
var columns = [[0,581],[609,582],[1219,581]];
var rows = [[0,326],[349,327],[699,327]];
var slides = [2,4,6,8,9]; // Other selected slides already have full-page exports.
for (var i = 0; i < slides.length; i++) {
  var number = slides[i];
  var column = columns[(number - 1) % 3];
  var row = rows[Math.floor((number - 1) / 3)];
  var cropWidth = Math.round(size.width * column[1] / 1800);
  var cropHeight = Math.round(size.height * row[1] / 1026);
  var cropped = $.NSImage.alloc.initWithSize($.NSMakeSize(cropWidth,cropHeight));
  cropped.lockFocus;
  sheet.drawInRectFromRectOperationFraction(
    $.NSMakeRect(0,0,cropWidth,cropHeight),
    $.NSMakeRect(size.width * column[0] / 1800, size.height * (1 - (row[0] + row[1]) / 1026), size.width * column[1] / 1800, size.height * row[1] / 1026),2,1);
  cropped.unlockFocus;
  var bitmap = $.NSBitmapImageRep.imageRepWithData(cropped.TIFFRepresentation);
  bitmap.representationUsingTypeProperties(4,$.NSDictionary.dictionary).writeToFileAtomically(output + '/podvezi-' + number + '.png',true);
}
'Exported five additional slides from плитка.pdf';
