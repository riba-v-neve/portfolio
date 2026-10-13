ObjC.import('Foundation');
ObjC.import('AppKit');
var root='/Users/williams_design/Desktop/portfolio/материалы для второй версии сайта/избранное для галереи';
var paths=ObjC.deepUnwrap($.NSFileManager.defaultManager.subpathsAtPath(root)).filter(function(path){return /\.(png|jpe?g)$/i.test(path);}).sort();
var width=1200, cellHeight=290, height=Math.ceil(paths.length/4)*cellHeight;
var sheet=$.NSImage.alloc.initWithSize($.NSMakeSize(width,height));
var inventory=[];
sheet.lockFocus;
$.NSColor.colorWithCalibratedWhiteAlpha(.92,1).set;
$.NSRectFill($.NSMakeRect(0,0,width,height));
for(var i=0;i<paths.length;i++) {
  var img=$.NSImage.alloc.initWithContentsOfFile(root+'/'+paths[i]);
  var size=img.size, scale=Math.min(280/size.width,250/size.height);
  var w=size.width*scale,h=size.height*scale;
  var x=(i%4)*300+(300-w)/2,y=height-(Math.floor(i/4)+1)*cellHeight+28;
  img.drawInRectFromRectOperationFraction($.NSMakeRect(x,y,w,h),$.NSMakeRect(0,0,0,0),2,1);
  $.NSString.stringWithString(String(i+1)).drawAtPointWithAttributes($.NSMakePoint((i%4)*300+12,y-18),$.NSDictionary.dictionary);
  inventory.push({number:i+1,path:paths[i],width:size.width,height:size.height});
}
sheet.unlockFocus;
var bitmap=$.NSBitmapImageRep.imageRepWithData(sheet.TIFFRepresentation);
bitmap.representationUsingTypeProperties(4,$.NSDictionary.dictionary).writeToFileAtomically('/tmp/portfolio-gallery-review.png',true);
JSON.stringify(inventory);
