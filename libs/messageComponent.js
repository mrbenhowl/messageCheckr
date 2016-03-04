var messageComponentType = require('./messageComponentType');

var messageComponent = function (expectedMessageComponent, actualMessageXmlDocument) {

  var type, expected, actualValue, printablePath, pathToElement, pathExists;

  var result = validate(expectedMessageComponent);
  type = result.type;
  expected = result.expected;

  pathToElement = getPathToElement(expectedMessageComponent, type, actualMessageXmlDocument);
  pathExists = !_.isUndefined(pathToElement);
  printablePath = determinePrintablePath(expectedMessageComponent, type);

  if (pathExists) {
    actualValue = getValueAtPath(pathToElement, expectedMessageComponent.attribute);
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
      || _.isEqual(expectedMessageComponentKeys, ['attribute', 'contains', 'element', 'elementPosition', 'parentPath'])
      || _.isEqual(expectedMessageComponentKeys, ['element', 'elementPosition', 'parentPath', 'pathShouldNotExist'])) {

      if (!Number.isInteger(expectedMessageComponent.elementPosition)) throw new Error('elementPosition should be an integer');
      if (expectedMessageComponent.elementPosition < 1) throw new Error('elementPosition should be greater than 0');
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
  var pathToElement;

  if (type === messageComponentType.STANDARD) {
    var path = expectedMessageComponent.path,
      pathIsRootElement = expectedMessageComponent.path === actualMessageXmlDocument.name,
      attribute = expectedMessageComponent.attribute,
      pathExists = pathIsRootElement ? true : actualMessageXmlDocument.descendantWithPath(path) != undefined;

    if (pathExists) {
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

  } else if (type === messageComponentType.POSITION) {
    var parentPathIsRootElement = expectedMessageComponent.parentPath === actualMessageXmlDocument.name;

    var pathToParentElement, countOfChildElements, elementAtSpecifiedPosition;
    pathToParentElement = expectedMessageComponent.parentPath,
      attribute = expectedMessageComponent.attribute,
      countOfChildElements = parentPathIsRootElement ? actualMessageXmlDocument.children.length : actualMessageXmlDocument.descendantWithPath(pathToParentElement).children.length;

    if (countOfChildElements >= expectedMessageComponent.elementPosition) {
      var expectedPosition = expectedMessageComponent.elementPosition - 1;
      elementAtSpecifiedPosition = parentPathIsRootElement ? actualMessageXmlDocument.children[expectedPosition] : actualMessageXmlDocument.descendantWithPath(pathToParentElement).children[expectedPosition];

      if (elementAtSpecifiedPosition.name === expectedMessageComponent.element) {

        if (_.has(expectedMessageComponent, 'attribute')) {
          pathToElement = _.has(elementAtSpecifiedPosition.attr, attribute) ? elementAtSpecifiedPosition : undefined;
        } else {
          pathToElement = elementAtSpecifiedPosition;
        }
      }
    }

  } else if (type === messageComponentType.REPEATING_GROUP) {
    var pathIsRootElement, pathToElementEnclosingRepeatingGroup, repeatingElement, pathToElementFromRepeatingElement, version, matchingGroups;

    pathToElementEnclosingRepeatingGroup = expectedMessageComponent.repeatingGroup.path;
    repeatingElement = expectedMessageComponent.repeatingGroup.repeater;
    pathToElementFromRepeatingElement = expectedMessageComponent.path;
    version = expectedMessageComponent.repeatingGroup.number;
    pathIsRootElement = pathToElementEnclosingRepeatingGroup === actualMessageXmlDocument.name;
    attribute = expectedMessageComponent.attribute;

    if (!pathIsRootElement && _.isUndefined(actualMessageXmlDocument.descendantWithPath(pathToElementEnclosingRepeatingGroup))){
      return undefined;
    }

    matchingGroups = _(pathIsRootElement ? actualMessageXmlDocument.children : actualMessageXmlDocument.descendantWithPath(pathToElementEnclosingRepeatingGroup).children)
      .pluck('name')
      .map(function (el, index) {
        if (el === repeatingElement) return index;
        return -1;
      })
      .filter(function (el) {
        return el != -1;
      })
      .value();

    if (matchingGroups.length > 0 && version <= matchingGroups.length) {
      pathToElement = pathIsRootElement ? actualMessageXmlDocument.children[matchingGroups[version-1]].descendantWithPath(pathToElementFromRepeatingElement) : actualMessageXmlDocument.descendantWithPath(pathToElementEnclosingRepeatingGroup).children[matchingGroups[version - 1]].descendantWithPath(pathToElementFromRepeatingElement);
      if (_.has(expectedMessageComponent, 'attribute')){
        if(!_.has(pathToElement.attr, attribute)) {
          return undefined;
        }
      }
    }

  } else {
    throw new Error('Unexpected messageComponentType')
  }

  return pathToElement;
}

function getValueAtPath(pathToElement, attribute) {
  if (attribute){
    return pathToElement.attr[attribute];
  }else{
    return pathToElement.val;
  }
}

function determinePrintablePath(expectedMessageComponent) {
  return _.omit(expectedMessageComponent, ['equals', 'attribute', 'dateFormat', 'contains', 'pathShouldNotExist']);
}
