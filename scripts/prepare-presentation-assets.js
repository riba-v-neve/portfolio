// Render selected slides directly from the original PDFs, including Podvezi.
ObjC.import('Foundation');
ObjC.import('AppKit');
ObjC.import('PDFKit');
var root='/Users/williams_design/Desktop/portfolio/assets/docs';
var output='/tmp/portfolio-presentation-exports';
$.NSFileManager.defaultManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(output,true,$.NSDictionary.dictionary,null);
var documents=[
  ['bambook','presentations-bambook.pdf',[1,4,6,8]],
  ['podvezi','presentations-podvezi.pdf',[1,2,3,4,5,6,7,8,9]],
  ['alfa','presentations-alfa.pdf',[1,2,8,10]],
  ['practicum','presentations-practicum.pdf',[1,3,5,8]]
];
var result=[];
for(var d=0;d<documents.length;d++) {
  var doc=$.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(root+'/'+documents[d][1]));
  for(var p=0;p<documents[d][2].length;p++) {
    var number=documents[d][2][p];
    var variants=[];
    for(var v=0;v<2;v++) {
      var edge=v===0?1800:3200;
      var name=documents[d][0]+'-'+number+(v===0?'':'-hires');
      var img=doc.pageAtIndex(number-1).thumbnailOfSizeForBox($.NSMakeSize(edge,edge),0);
      var bitmap=$.NSBitmapImageRep.imageRepWithData(img.TIFFRepresentation);
      bitmap.representationUsingTypeProperties(4,$.NSDictionary.dictionary).writeToFileAtomically(output+'/'+name+'.png',true);
      variants.push({name:name,width:Number(bitmap.pixelsWide),height:Number(bitmap.pixelsHigh)});
    }
    result.push({deck:documents[d][0],page:number,variants:variants});
  }
}
JSON.stringify(result);
