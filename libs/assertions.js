var moment = require('moment'),
  validator = require('validator'),
  verificationResults = require('./verificationResults'),
  getFullPath = require('./getFullPath');

var assertions = {

  checkRootElement: function checkRootElement(xmlDocument, expectedRootElement) {
    verificationResults.add(
      {
        pass: xmlDocument.name === expectedRootElement,
        path: expectedRootElement,
        actual: xmlDocument.name,
        expected: expectedRootElement,
        description: 'Check actual root element ' + xmlDocument.name + ' is equal to expected root element ' + expectedRootElement
      }
    );
  },

  equalCheck: function equalCheck(path, actualValue, expectedValue) {
    verificationResults.add(
      {
        pass: actualValue === expectedValue,
        path: path,
        actual: actualValue,
        expected: expectedValue,
        description: 'Check actual value ' + actualValue + ' is equal to ' + expectedValue
      }
    );
  },

  containsCheck: function containsCheck(path, actualValue, containsExpectedValue) {
    verificationResults.add(
      {
        pass: actualValue.indexOf(containsExpectedValue) != -1,
        path: path,
        actual: actualValue,
        expected: 'contains: ' + containsExpectedValue,
        description: 'Check actual value ' + actualValue + ' contains ' + containsExpectedValue
      }
    );
  },

  uuidCheck: function uuidCheck(path, actualValue) {
    verificationResults.add(
      {
        pass: validator.isUUID(actualValue),
        path: path,
        actual: actualValue,
        expected: '{uuid}',
        description: 'Check actual value ' + actualValue + ' is a valid UUID'
      }
    );
  },

  isAlphanumericCheck: function isAlphanumericCheck(path, actualValue) {
    verificationResults.add(
      {
        pass: validator.isAlphanumeric(actualValue),
        path: path,
        actual: actualValue,
        expected: '{alphanumeric}',
        description: 'Check actual value ' + actualValue + ' is alphanumeric'
      }
    );
  },

  isAlphaCheck: function isAlphaCheck(path, actualValue) {
    verificationResults.add(
      {
        pass: validator.isAlpha(actualValue),
        path: path,
        actual: actualValue,
        expected: '{alpha}',
        description: 'Check actual value ' + actualValue + ' is alpha'
      }
    );
  },

  isInteger: function isInteger(path, actualValue) {
    var descriptionOfCheck = 'Check actual value ' + actualValue + ' is an integer';

    if (Number.isNaN(Number(actualValue))) {
      verificationResults.add(
        {
          pass: false,
          path: path,
          actual: actualValue,
          expected: '{integer}',
          description: descriptionOfCheck
        }
      );
    } else {
      verificationResults.add(
        {
          pass: Number.isInteger(Number.parseFloat(actualValue)),
          path: path,
          actual: actualValue,
          expected: '{integer}',
          description: descriptionOfCheck
        }
      );
    }
  },

  lessThanLengthCheck: function lessThanLengthCheck(path, actualValue, expectedLength) {
    var lessThanExpected = actualValue.toString().length < expectedLength;
    verificationResults.add(
      {
        pass: lessThanExpected,
        path: path,
        actual: actualValue,
        expected: '{length(<' + expectedLength + ')}',
        description: 'Check actual value ' + actualValue + ' has a length less than ' + expectedLength
      }
    );
  },

  greaterThanLengthCheck: function greaterThanLengthCheck(path, actualValue, expectedLength) {
    var greaterThanExpected = actualValue.toString().length > expectedLength;
    verificationResults.add(
      {
        pass: greaterThanExpected,
        path: path,
        actual: actualValue,
        expected: '{length(>' + expectedLength + ')}',
        description: 'Check actual value ' + actualValue + ' has a length greater than ' + expectedLength
      }
    );
  },

  equalLengthCheck: function equalLengthCheck(path, actualValue, expectedLength) {
    var equal = actualValue.toString().length === expectedLength;
    verificationResults.add(
      {
        pass: equal,
        path: path,
        actual: actualValue,
        expected: '{length(' + expectedLength + ')}',
        description: 'Check actual value ' + actualValue + ' has a length equal to ' + expectedLength
      }
    );
  },

  regexCheck: function regexCheck(path, actualValue, regexPattern) {
    verificationResults.add(
      {
        pass: regexPattern.test(actualValue),
        path: path,
        actual: actualValue,
        expected: regexPattern,
        description: 'Check actual value ' + actualValue + ' against regex ' + regexPattern.toString()
      }
    );
  },

  timestampCheck: function timestampCheck(path, actualValue, regexPattern, timezone, dateFormat) {
    var currentDate, regexObj;

    if (_.isUndefined(dateFormat)) {
      throw new Error('Expected additional attribute \'dateFormat\' when local-timezone or utc-timezone is present in a regex literal for \'equals\'');
    }

    if (timezone === 'local-timezone') {
      currentDate = moment().format(dateFormat);
    } else if (timezone === 'utc-timezone') {
      currentDate = moment().utc().format(dateFormat);
    } else {
      // TODO: no unit test yet
      throw new Error('A valid timezone has not been specified - valid values are \'local-timezone\' and \'utc-timezone\'');
    }

    regexObj = new RegExp(regexPattern.toString().replace(timezone, currentDate).slice(1, -1));
    verificationResults.add(
      {
        pass: regexObj.test(actualValue),
        path: path,
        actual: actualValue,
        expected: regexPattern + ' where ' + timezone + ' has the date format ' + dateFormat,
        description: 'Check actual value ' + actualValue + ' matches date/regex pattern ' + regexObj
      }
    );
  },

  checkPathForExpectedMsgComponent: function checkPathForExpectedMsgComponent(actualMsgAsXmlDocument, expectedMsgComponent, pathIsRootElement) {
    var path = expectedMsgComponent.path,
      child = expectedMsgComponent.child,
      attribute = expectedMsgComponent.attribute,
      pathShouldNotExist = expectedMsgComponent.pathShouldNotExist,
      pathExists;

    // TODO: move checking of attributes and children into separate function

    if (_.isUndefined(expectedMsgComponent.repeatingGroup)) {
      pathExists = pathIsRootElement ? actualMsgAsXmlDocument.name != undefined : actualMsgAsXmlDocument.descendantWithPath(path) != undefined;

      if (pathExists && (child) && attribute) {
        if (pathIsRootElement) {
          pathExists = (actualMsgAsXmlDocument.children[parseInt(child)].name != undefined) && (actualMsgAsXmlDocument.children[parseInt(child)].attr[attribute] != undefined);
        } else {
          pathExists = (actualMsgAsXmlDocument.descendantWithPath(path).children[parseInt(child)].name != undefined) && (actualMsgAsXmlDocument.descendantWithPath(path).children[parseInt(child)].attr[attribute] != undefined);
        }
      } else if (pathExists && child) {
        if (pathIsRootElement) {
          pathExists = (actualMsgAsXmlDocument.children[parseInt(child)].name != undefined);
        } else {
          pathExists = (actualMsgAsXmlDocument.descendantWithPath(path).children[parseInt(child)].name != undefined);
        }
      } else if (pathExists && attribute) {
        if (pathIsRootElement) {
          pathExists = (actualMsgAsXmlDocument.attr[attribute] != undefined);
        } else {
          pathExists = (actualMsgAsXmlDocument.descendantWithPath(path).attr[attribute] != undefined);
        }
      }

      verificationResults.add(
        {
          pass: _.isUndefined(pathShouldNotExist) === pathExists,
          path: getFullPath(expectedMsgComponent),
          actual: pathExists,
          expected: _.isUndefined(pathShouldNotExist),
          description: 'Check existence of path: ' + getFullPath(expectedMsgComponent)
        }
      );

    } else {
      // TODO: no support for child/attribute in the repeating group yet, including getFullPath
      var pathToElementEnclosingRepeatingGroup = expectedMsgComponent.repeatingGroup.path;
      var repeatingElement = expectedMsgComponent.repeatingGroup.repeater;
      var pathToElementFromRepeatingElement = path;
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

      pathExists = actualMsgAsXmlDocument.descendantWithPath(pathToElementEnclosingRepeatingGroup).children[matchingGroups[version - 1]].descendantWithPath(pathToElementFromRepeatingElement) != undefined;

      verificationResults.add(
        {
          pass: _.isUndefined(pathShouldNotExist) === pathExists,
          path: getFullPath(expectedMsgComponent),
          actual: pathExists,
          expected: _.isUndefined(pathShouldNotExist),
          description: 'Check for presence of the path: ' + getFullPath(expectedMsgComponent)
        }
      );
    }
  }

};

module.exports = assertions;
