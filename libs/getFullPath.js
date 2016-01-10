var getFullPath = function getFullPath(expectedMessageComponent){
  var path, attribute;
  path = expectedMessageComponent.path;
  attribute = expectedMessageComponent.attribute;

  if (_.isUndefined(expectedMessageComponent.repeatingGroup)){
    return path + (_.isUndefined(attribute)? '': ' (attribute: ' + attribute + ')');
  }else {
    var pathToElementEnclosingRepeatingGroup, repeatingElement, number;
    pathToElementEnclosingRepeatingGroup = expectedMessageComponent.repeatingGroup.path;
    repeatingElement = expectedMessageComponent.repeatingGroup.repeater;
    number = expectedMessageComponent.repeatingGroup.number;
    return pathToElementEnclosingRepeatingGroup + '.' + repeatingElement + '.' + path + ' number: ' + number + (_.isUndefined(attribute)? '': ' (attribute: ' + attribute + ')');
  }
};

module.exports = getFullPath;