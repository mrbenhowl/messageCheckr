var _ = require('lodash');

var getValueAtPath = function getValueAtPath(actualMsgAsXmlDocument, expectedMsgComponent, pathIsRootElement) {
  var attribute = expectedMsgComponent.attribute,
    actualValue;

  if (_.isUndefined(expectedMsgComponent.repeatingGroup) && _.isUndefined(expectedMsgComponent.parentPath)) {
    var path = expectedMsgComponent.path;

    if (attribute) {
      if (pathIsRootElement) {
        actualValue = actualMsgAsXmlDocument.attr[attribute];
      } else {
        actualValue = actualMsgAsXmlDocument.descendantWithPath(path).attr[attribute];
      }
    } else {
      if (pathIsRootElement) {
        throw new Error('Checking the value at the root element will return a empty string');
      } else {
        actualValue = actualMsgAsXmlDocument.valueWithPath(path);
      }
    }
  } else if (_.isUndefined(expectedMsgComponent.parentPath)) {
    // TODO: no support for child (and child/attribute combo) in the repeating group yet
    var pathToElementEnclosingRepeatingGroup = expectedMsgComponent.repeatingGroup.path;
    var repeatingElement = expectedMsgComponent.repeatingGroup.repeater;
    var pathToElementFromRepeatingElement = expectedMsgComponent.path;
    var version = expectedMsgComponent.repeatingGroup.number;

    var matchingGroups = _(actualMsgAsXmlDocument.descendantWithPath(pathToElementEnclosingRepeatingGroup).children)
      .pluck('name')
      .map(function (el, index) {
        if (el === repeatingElement) return index;
        return -1;
      })
      .filter(function (el) {
        return el != -1;
      })
      .value();

    if (attribute) {
      actualValue = actualMsgAsXmlDocument.descendantWithPath(pathToElementEnclosingRepeatingGroup).children[matchingGroups[version - 1]].descendantWithPath(pathToElementFromRepeatingElement).attr[attribute];
    } else {
      actualValue = actualMsgAsXmlDocument.descendantWithPath(pathToElementEnclosingRepeatingGroup).children[matchingGroups[version - 1]].valueWithPath(pathToElementFromRepeatingElement);
    }
  } else {
    var expectedPosition = expectedMsgComponent.elementPosition - 1,
    pathToParentElement = expectedMsgComponent.parentPath;

    if (attribute) {
      if (pathIsRootElement) {
        actualValue = actualMsgAsXmlDocument.children[expectedPosition].attr[attribute];
      } else {
        actualValue = actualMsgAsXmlDocument.descendantWithPath(pathToParentElement).children[expectedPosition].attr[attribute];
      }
    } else {
      if (pathIsRootElement) {
        actualValue = actualMsgAsXmlDocument.children[expectedPosition].val;
      } else {
        actualValue = actualMsgAsXmlDocument.descendantWithPath(pathToParentElement).children[expectedPosition].val;
      }
    }
  }
  return actualValue;
};

module.exports = getValueAtPath;