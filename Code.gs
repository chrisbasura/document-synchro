var sourceContentFolderID = "0B8XPtk4Oz3lYUHc0eHp3RlRfUWM";
var documentFolderID = "0B8XPtk4Oz3lYNkdQckM0d1dNa1k";
var endSourceText = "EndPage";

function checkSynchroNeed() {
  var folderContent = DriveApp.getFolderById(sourceContentFolderID);
  var filesContent = folderContent.getFiles();
  while (filesContent.hasNext()) {
    var fileContent = filesContent.next();
    var lastUpdateDate = fileContent.getLastUpdated();
    var lastSynchroDateProperty = PropertiesService.getScriptProperties().getProperty(fileContent.getName()+" lastSynchroDate");
    var lastSynchroDate = new Date(2000,01,01);
    if (lastSynchroDateProperty != null)
      var lastSynchroDate = new Date(lastSynchroDateProperty);
    if (lastSynchroDate.getTime() <= lastUpdateDate.getTime()) {
      Logger.log("Perform synchro of: "+fileContent.getName());
      synchro(fileContent.getId());
    }
  }
}

function forceFullSynchro() {
  var folderContent = DriveApp.getFolderById(sourceContentFolderID);
  var filesContent = folderContent.getFiles();
  while (filesContent.hasNext()) {
    var fileContent = filesContent.next();
    synchro(fileContent.getId());
  }
}

function synchro(sourceFileID) {
  var folderDocuments = DriveApp.getFolderById(documentFolderID);
  var filesDocuments = folderDocuments.getFiles();
  while (filesDocuments.hasNext()) {
    var fileDocument = filesDocuments.next();
    var body = DocumentApp.openById(fileDocument.getId()).getBody();
    
    var folderContent = DriveApp.getFolderById(sourceContentFolderID);
    var filesContent = folderContent.getFiles();
    while (filesContent.hasNext()) {
      var fileContent = filesContent.next();
      var fileContentName = fileContent.getName();
      if (fileContent.getId() == sourceFileID && body.getText().indexOf(fileContentName) != -1 && body.getText().indexOf(endSourceText) != -1) {
        var docContent = DocumentApp.openById(fileContent.getId());
        var bodyContent = docContent.getBody().getText();
        
        var childIndex = -1;
        for( var c = 0; c < body.getNumChildren() ; ++c ) {
          if (body.getChild(c).getText() == fileContentName) {
            childIndex = c;
            break;
          }
        }
        
        Logger.log("Matching childIndex: "+childIndex);
        childIndex++;
        
        while(body.getChild(childIndex).getText() != endSourceText && (childIndex-1)< body.getNumChildren()) {
          body.getChild(childIndex).removeFromParent();
        }
        
        var totalElements = docContent.getNumChildren();
        for( var j = totalElements; j > 0 ; --j ) {
          var element = docContent.getChild(j-1).copy();
          var type = element.getType();
          if( type == DocumentApp.ElementType.PARAGRAPH )
            body.insertParagraph(childIndex, element);
          else if( type == DocumentApp.ElementType.TABLE )
            body.insertTable(childIndex, element);
          else if( type == DocumentApp.ElementType.LIST_ITEM ) {
            if (element.asListItem().getGlyphType() == DocumentApp.GlyphType.BULLET)
              body.insertListItem(childIndex, element).setGlyphType(DocumentApp.GlyphType.BULLET);
            else if (element.asListItem().getGlyphType() == DocumentApp.GlyphType.HOLLOW_BULLET)
              body.insertListItem(childIndex, element).setGlyphType(DocumentApp.GlyphType.HOLLOW_BULLET);
            else if (element.asListItem().getGlyphType() == DocumentApp.GlyphType.SQUARE_BULLET)
              body.insertListItem(childIndex, element).setGlyphType(DocumentApp.GlyphType.SQUARE_BULLET);
            else if (element.asListItem().getGlyphType() == DocumentApp.GlyphType.NUMBER)
              body.insertListItem(childIndex, element).setGlyphType(DocumentApp.GlyphType.NUMBER);
            else if (element.asListItem().getGlyphType() == DocumentApp.GlyphType.LATIN_UPPER)
              body.insertListItem(childIndex, element).setGlyphType(DocumentApp.GlyphType.LATIN_UPPER);
            else if (element.asListItem().getGlyphType() == DocumentApp.GlyphType.LATIN_LOWER)
              body.insertListItem(childIndex, element).setGlyphType(DocumentApp.GlyphType.LATIN_LOWER);
            else if (element.asListItem().getGlyphType() == DocumentApp.GlyphType.ROMAN_UPPER)
              body.insertListItem(childIndex, element).setGlyphType(DocumentApp.GlyphType.ROMAN_UPPER);
            else if (element.asListItem().getGlyphType() == DocumentApp.GlyphType.ROMAN_LOWER)
              body.insertListItem(childIndex, element).setGlyphType(DocumentApp.GlyphType.ROMAN_LOWER);
            else
              body.insertListItem(childIndex, element);
          }
          else if( type == DocumentApp.ElementType.INLINE_IMAGE )
            body.insertImage(childIndex, element);
          else if( type == DocumentApp.ElementType.PAGE_BREAK )
            body.insertPageBreak(childIndex, element);
          else if( type == DocumentApp.ElementType.HORIZONTAL_RULE )
            body.insertHorizontalRule(childIndex);
          else if( type == DocumentApp.ElementType.TEXT )
            body.insertText(childIndex, element);
          else
            throw new Error("According to the doc this type couldn't appear in the body: "+type);
        }
      }
    }
  }
  PropertiesService.getScriptProperties().setProperty(DocumentApp.openById(sourceFileID).getName()+" lastSynchroDate", new Date());
}