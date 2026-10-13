ObjC.import('Foundation');
ObjC.import('AppKit');
var root = '/Users/williams_design/Desktop/portfolio/материалы для второй версии сайта';
var groups = [
  ['social', '/Соцсети'],
  ['photo', '/Дизайн презентаций/Предметная фотография/Фототех'],
  ['keyrings', '/Дизайн презентаций/Предметная фотография/Брелки']
];
var output = '/tmp/portfolio-graphic-materials-review';
var result = [];
for (var g = 0; g < groups.length; g++) {
  var folder = root + groups[g][1];
  var entries = ObjC.deepUnwrap($.NSFileManager.defaultManager.subpathsAtPath(folder));
  var paths = entries.filter(function (p) { return /\.(png|jpe?g)$/i.test(p); }).sort();
  var width = 1200;
  var cellHeight = 245;
  var height = Math.ceil(paths.length / 4) * cellHeight;
  var sheet = $.NSImage.alloc.initWithSize($.NSMakeSize(width, height));
  sheet.lockFocus;
  $.NSColor.colorWithCalibratedWhiteAlpha(.92, 1).set;
  $.NSRectFill($.NSMakeRect(0, 0, width, height));
  for (var i = 0; i < paths.length; i++) {
    var img = $.NSImage.alloc.initWithContentsOfFile(folder + '/' + paths[i]);
    var size = img.size;
    var scale = Math.min(280 / size.width, 215 / size.height);
    var w = size.width * scale, h = size.height * scale;
    var x = (i % 4) * 300 + (300 - w) / 2;
    var y = height - (Math.floor(i / 4) + 1) * cellHeight + 22;
    img.drawInRectFromRectOperationFraction($.NSMakeRect(x, y, w, h), $.NSMakeRect(0,0,0,0), 2, 1);
    $.NSString.stringWithString(String(i + 1)).drawAtPointWithAttributes($.NSMakePoint((i % 4) * 300 + 12, y - 14), $.NSDictionary.dictionary);
    result.push(groups[g][0] + ' ' + (i + 1) + ': ' + paths[i]);
  }
  sheet.unlockFocus;
  var bitmap = $.NSBitmapImageRep.imageRepWithData(sheet.TIFFRepresentation);
  bitmap.representationUsingTypeProperties(4, $.NSDictionary.dictionary).writeToFileAtomically(output + '/' + groups[g][0] + '-images.png', true);
}
result.join('\n');
