var messageComponentType = require('./messageComponentType');

var messageComponent = function (expectedMessageComponent, actualMessageXmlDocument) {

  var type, expected, actualValue, printablePath, pathToTarget, pathExists;

  var result = validate(expectedMessageComponent);
  type = result.type;
  expected = result.expected;

  pathToTarget = getPathToElement(expectedMessageComponent, type, actualMessageXmlDocument);
  pathExists = !_.isUndefined(pathToTarget);
  printablePath = determinePrintablePath(expectedMessageComponent, type);

  if (pathExists) {
    actualValue = getValueAtPath(pathToTarget, type);
  }

  return {

    isPathPresent: function isPathPresent() {
      return pathExists;
    },

    getActualValue: function getActualValue() {
      return actualValue;
    },

    getExpected: function getExpected() {
      return expected;
    },

    getPrintablePath: function getPrintablePath() {
      return printablePath;
    }
  };
};

module.exports = messageComponent;

function validate(expectedMessageComponent) {

  // TODO: the original validateExpectedMsg operated above this function on the array of objects, ensure the following is covered elsewhere
  /*if (!Array.isArray(expectedMsg)) {
   throw new Error('expectedMsg should be an array');
   }

   if (expectedMsg.length === 0) {
   throw new Error('expectedMsg is empty');
   }*/

  if (_.isNull(expectedMessageComponent) ||
    _.isArray(expectedMessageComponent) ||
    _.isString(expectedMessageComponent) ||
    _.isBoolean(expectedMessageComponent) ||
    _.isNumber(expectedMessageComponent) ||
    _.keys(expectedMessageComponent).length === 0) {
    throw new Error('The following expectedMessageComponent is not valid: ' + JSON.stringify(expectedMessageComponent));
  }

  var type = messageComponentType.UNKNOWN,
    expectedMessageComponentKeys = _.keys(expectedMessageComponent).sort(),
    expected;

  if (_.has(expectedMessageComponent, 'repeatingGroup') && _.isEqual(_.keys(expectedMessageComponent.repeatingGroup).sort(), ['number', 'path', 'repeater'])) {

    if (_.isEqual(expectedMessageComponentKeys, ['equals', 'path', 'repeatingGroup'])
      || _.isEqual(expectedMessageComponentKeys, ['dateFormat', 'equals', 'path', 'repeatingGroup'])
      || _.isEqual(expectedMessageComponentKeys, ['attribute', 'equals', 'path', 'repeatingGroup'])
      || _.isEqual(expectedMessageComponentKeys, ['attribute', 'dateFormat', 'equals', 'path', 'repeatingGroup'])
      || _.isEqual(expectedMessageComponentKeys, ['attribute', 'contains', 'path', 'repeatingGroup'])
      || _.isEqual(expectedMessageComponentKeys, ['contains', 'path', 'repeatingGroup'])
      || _.isEqual(expectedMessageComponentKeys, ['path', 'pathShouldNotExist', 'repeatingGroup'])) {
      type = messageComponentType.REPEATING_GROUP;
      expected = _.omit(_.clone(expectedMessageComponent), ['path', 'repeatingGroup']);
    }

  } else if (_.has(expectedMessageComponent, 'parentPath')) {

    if (_.isEqual(expectedMessageComponentKeys, ['element', 'elementPosition', 'equals', 'parentPath'])
      || _.isEqual(expectedMessageComponentKeys, ['dateFormat', 'element', 'elementPosition', 'equals', 'parentPath'])
      || _.isEqual(expectedMessageComponentKeys, ['contains', 'element', 'elementPosition', 'parentPath'])
      || _.isEqual(expectedMessageComponentKeys, ['attribute', 'element', 'elementPosition', 'equals', 'parentPath'])
      || _.isEqual(expectedMessageComponentKeys, ['attribute', 'dateFormat', 'element', 'elementPosition', 'equals', 'parentPath'])
      || _.isEqual(expectedMessageComponentKeys, ['attribute', 'contains', 'element', 'elementPosition', 'parentPath'])) {
      type = messageComponentType.POSITION;
      expected = _.omit(_.clone(expectedMessageComponent), ['parentPath', 'element', 'elementPosition']);
    }

  } else {

    if (_.isEqual(expectedMessageComponentKeys, ['equals', 'path'])
      || _.isEqual(expectedMessageComponentKeys, ['dateFormat', 'equals', 'path'])
      || _.isEqual(expectedMessageComponentKeys, ['contains', 'path'])
      || _.isEqual(expectedMessageComponentKeys, ['attribute', 'equals', 'path'])
      || _.isEqual(expectedMessageComponentKeys, ['attribute', 'dateFormat', 'equals', 'path'])
      || _.isEqual(expectedMessageComponentKeys, ['attribute', 'contains', 'path'])
      || _.isEqual(expectedMessageComponentKeys, ['path', 'pathShouldNotExist'])) {
      type = messageComponentType.STANDARD;
      expected = _.omit(_.clone(expectedMessageComponent), ['path']);
    }
  }

  if (type === 'UNKNOWN') throw new Error('Expected message component does not match any expected patterns. The invalid component is ' + JSON.stringify(expectedMessageComponent));

  return {type: type, expected: expected};
}


function getPathToElement(expectedMessageComponent, type, actualMessageXmlDocument) {
  // returns undefined if cannot find element, otherwise it returns xmlDoc type
  var pathToElement, pathExists, pathIsRootElement;

  if (type === messageComponentType.STANDARD){
    var path = expectedMessageComponent.path,
      pathIsRootElement = expectedMessageComponent.path === actualMessageXmlDocument.name,
      attribute = expectedMessageComponent.attribute;
      pathExists = pathIsRootElement ? true : actualMessageXmlDocument.descendantWithPath(path) != undefined;

      if (pathExists){
        if (attribute && pathIsRootElement) {
          pathToElement = _.has(actualMessageXmlDocument.attr, attribute) ? actualMessageXmlDocument : undefined;
        } else if (attribute) {
          pathToElement = _.has(actualMessageXmlDocument.descendantWithPath(path).attr, attribute) ? actualMessageXmlDocument.descendantWithPath(path) : undefined;
        } else if (pathIsRootElement) {
          pathToElement = actualMessageXmlDocument;
        } else {
          pathToElement = actualMessageXmlDocument.descendantWithPath(path);
        }
      }

  } else if (type === messageComponentType.POSITION){
    pathIsRootElement = expectedMessageComponent.parentPath === actualMessageXmlDocument.name;

    var pathToParentElement, countOfChildElements, elementAtSpecifiedPosition;
    pathToParentElement = expectedMessageComponent.parentPath;
    countOfChildElements = pathIsRootElement ? actualMessageXmlDocument.children.length : actualMessageXmlDocument.descendantWithPath(pathToParentElement).children.length;

    if (countOfChildElements >= expectedMessageComponent.elementPosition){
      var expectedPosition = expectedMessageComponent.elementPosition - 1;
      elementAtSpecifiedPosition = pathIsRootElement ? actualMessageXmlDocument.children[expectedPosition] : actualMessageXmlDocument.descendantWithPath(pathToParentElement).children[expectedPosition];

      if (elementAtSpecifiedPosition.name === expectedMessageComponent.element){
        pathToElement = elementAtSpecifiedPosition;
      }
    }

  } else if (type === messageComponentType.REPEATING_GROUP){

    var pathToElementEnclosingRepeatingGroup, repeatingElement, pathToElementFromRepeatingElement, version, matchingGroups;

    pathToElementEnclosingRepeatingGroup = expectedMessageComponent.repeatingGroup.path;
    repeatingElement = expectedMessageComponent.repeatingGroup.repeater;
    pathToElementFromRepeatingElement = expectedMessageComponent.path;
    version = expectedMessageComponent.repeatingGroup.number;

    matchingGroups = _(actualMessageXmlDocument.descendantWithPath(pathToElementEnclosingRepeatingGroup).children)
      .pluck('name')
      .map(function (el, index) {
        if (el === repeatingElement) return index;
        return -1;
      })
      .filter(function (el) {
        return el != -1;
      })
      .value();

    pathToElement = actualMessageXmlDocument.descendantWithPath(pathToElementEnclosingRepeatingGroup).children[matchingGroups[version - 1]].descendantWithPath(pathToElementFromRepeatingElement);

  } else {
    throw new Error('Unexpected messageComponentType')
  }

  return pathToElement;
}

function getValueAtPath(pathToTarget, type) {
  throw new Error('to be implemented');
}

function determinePrintablePath(expectedMessageComponent, type) {
  throw new Error('to be implemented')
}