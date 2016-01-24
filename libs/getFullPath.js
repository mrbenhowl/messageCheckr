var _ = require('lodash');

var getFullPath = function getFullPath(expectedMessageComponent) {
  var attribute = expectedMessageComponent.attribute;

  if (_.isUndefined(expectedMessageComponent.repeatingGroup) && _.isUndefined(expectedMessageComponent.parentPath)) {
    return expectedMessageComponent.path + (_.isUndefined(attribute) ? '' : ' (attribute: ' + attribute + ')');
  } else if (_.isUndefined(expectedMessageComponent.parentPath)) {
    var pathToElementEnclosingRepeatingGroup, repeatingElement, number;
    pathToElementEnclosingRepeatingGroup = expectedMessageComponent.repeatingGroup.path;
    repeatingElement = expectedMessageComponent.repeatingGroup.repeater;
    number = expectedMessageComponent.repeatingGroup.number;
    return pathToElementEnclosingRepeatingGroup + '.' + repeatingElement + '.' + expectedMessageComponent.path + ' number: ' + number + (_.isUndefined(attribute) ? '' : ' (attribute: ' + attribute + ')');
  } else {
    var pathToParent, element, elementPosition;
    pathToParent = expectedMessageComponent.parentPath;
    element = expectedMessageComponent.element;
    elementPosition = expectedMessageComponent.elementPosition;
    return pathToParent + '.' + element + ' (element position: ' + elementPosition + (_.isUndefined(attribute) ? ')': ', attribute: ' + attribute + ')');
  }
};

module.exports = getFullPath;