var _ = require('lodash');

//TODO: to remove eventually

var getFullPath = function getFullPath(messageComponent) {

  var attribute = messageComponent.getPrintablePath().attribute;

  if (_.isUndefined(messageComponent.getPrintablePath().repeatingGroup) && _.isUndefined(messageComponent.getPrintablePath().parentPath)) {
    return messageComponent.getPrintablePath().path + (_.isUndefined(attribute) ? '' : ' (attribute: ' + attribute + ')');
  } else if (_.isUndefined(messageComponent.getPrintablePath().parentPath)) {
    var pathToElementEnclosingRepeatingGroup, repeatingElement, number;
    pathToElementEnclosingRepeatingGroup = messageComponent.getPrintablePath().repeatingGroup.path;
    repeatingElement = messageComponent.getPrintablePath().repeatingGroup.repeater;
    number = messageComponent.getPrintablePath().repeatingGroup.number;
    return pathToElementEnclosingRepeatingGroup + '.' + repeatingElement + '.' + messageComponent.getPrintablePath().path + ' number: ' + number + (_.isUndefined(attribute) ? '' : ' (attribute: ' + attribute + ')');
  } else {
    var pathToParent, element, elementPosition;
    pathToParent = messageComponent.getPrintablePath().parentPath;
    element = messageComponent.getPrintablePath().element;
    elementPosition = messageComponent.getPrintablePath().elementPosition;
    return pathToParent + '.' + element + ' (element position: ' + elementPosition + (_.isUndefined(attribute) ? ')': ', attribute: ' + attribute + ')');
  }
  
  //var attribute = expectedMessageComponent.attribute;
  //
  //if (_.isUndefined(expectedMessageComponent.repeatingGroup) && _.isUndefined(expectedMessageComponent.parentPath)) {
  //  return expectedMessageComponent.path + (_.isUndefined(attribute) ? '' : ' (attribute: ' + attribute + ')');
  //} else if (_.isUndefined(expectedMessageComponent.parentPath)) {
  //  var pathToElementEnclosingRepeatingGroup, repeatingElement, number;
  //  pathToElementEnclosingRepeatingGroup = expectedMessageComponent.repeatingGroup.path;
  //  repeatingElement = expectedMessageComponent.repeatingGroup.repeater;
  //  number = expectedMessageComponent.repeatingGroup.number;
  //  return pathToElementEnclosingRepeatingGroup + '.' + repeatingElement + '.' + expectedMessageComponent.path + ' number: ' + number + (_.isUndefined(attribute) ? '' : ' (attribute: ' + attribute + ')');
  //} else {
  //  var pathToParent, element, elementPosition;
  //  pathToParent = expectedMessageComponent.parentPath;
  //  element = expectedMessageComponent.element;
  //  elementPosition = expectedMessageComponent.elementPosition;
  //  return pathToParent + '.' + element + ' (element position: ' + elementPosition + (_.isUndefined(attribute) ? ')': ', attribute: ' + attribute + ')');
  //}
};

module.exports = getFullPath;