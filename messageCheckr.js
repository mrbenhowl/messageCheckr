var xmldoc = require('xmldoc'),
  validator = require('validator'),
  _ = require('lodash'),
  moment = require('moment'),
  convertToXmlDocumentType = require('./libs/convertToXmlDocumentType'),
  validateParams = require('./libs/validateParams.js'),
  validateExpectedMsg = require('./libs/validateExpectedMsg'),
  cleanRawSoapMessage = require('./libs/cleanRawSoapMessage'),
  cleanRawXmlMessage = require('./libs/cleanRawXmlMessage'),
  verificationResults = require('./libs/verificationResults'),
  getFullPath = require('./libs/getFullPath');

// for storing user defined attributes
var store = {};

function checkRootElement(xmlDocument, expectedRootElement) {
  verificationResults.add(
    {
      pass: xmlDocument.name === expectedRootElement,
      path: expectedRootElement,
      actual: xmlDocument.name,
      expected: expectedRootElement,
      description: 'Check actual root element ' + xmlDocument.name + ' is equal to expected root element ' + expectedRootElement
    }
  );
}

function checkPathForExpectedMsgComponent(actualMsgAsXmlDocument, expectedMsgComponent, pathIsRootElement) {
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

function getActualValueAtPathSpecified(actualMsgAsXmlDocument, expectedMsgComponent, pathIsRootElement) {
  var child = expectedMsgComponent.child,
    attribute = expectedMsgComponent.attribute,
    actualValue;

  if (_.isUndefined(expectedMsgComponent.repeatingGroup)) {
    var path = expectedMsgComponent.path;

    if (child && attribute) {
      if (pathIsRootElement) {
        actualValue = actualMsgAsXmlDocument.children[parseInt(child)].attr[attribute];
      } else {
        actualValue = actualMsgAsXmlDocument.descendantWithPath(path).children[parseInt(child)].attr[attribute];
      }
    } else if (child) {
      if (pathIsRootElement) {
        actualValue = actualMsgAsXmlDocument.children[parseInt(child)].val;
      } else {
        actualValue = actualMsgAsXmlDocument.descendantWithPath(path).children[parseInt(child)].val;
      }
    } else if (attribute) {
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
  } else {
    // TODO: no support for child/attribute in the repeating group yet
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

    actualValue = actualMsgAsXmlDocument.descendantWithPath(pathToElementEnclosingRepeatingGroup).children[matchingGroups[version - 1]].valueWithPath(pathToElementFromRepeatingElement);
  }

  return actualValue;
}

function uuidCheck(path, actualValue) {
  verificationResults.add(
    {
      pass: validator.isUUID(actualValue),
      path: path,
      actual: actualValue,
      expected: '{uuid}',
      description: 'Check actual value ' + actualValue + ' is a valid UUID'
    }
  );
}

function isAlphanumericCheck(path, actualValue) {
  verificationResults.add(
    {
      pass: validator.isAlphanumeric(actualValue),
      path: path,
      actual: actualValue,
      expected: '{alphanumeric}',
      description: 'Check actual value ' + actualValue + ' is alphanumeric'
    }
  );
}

function isAlphaCheck(path, actualValue) {
  verificationResults.add(
    {
      pass: validator.isAlpha(actualValue),
      path: path,
      actual: actualValue,
      expected: '{alpha}',
      description: 'Check actual value ' + actualValue + ' is alpha'
    }
  );
}

function isInteger(path, actualValue) {
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
}

function lessThanLengthCheck(path, actualValue, expectedLength) {
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
}

function greaterThanLengthCheck(path, actualValue, expectedLength) {
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
}

function equalLengthCheck(path, actualValue, expectedLength) {
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
}

function storeNameAndActualValue(storeName, actualValue) {
  if (Object.keys(store).indexOf(storeName) > -1) {
    throw new Error('The store name you have provided is already is use.');
  }
  store[storeName] = actualValue;
}

function compareToStoredValue(path, storeName, actualValue) {
  if (Object.keys(store).indexOf(storeName) === -1) {
    throw new Error('The store name you have provided to compare to does not exist.');
  }
  verificationResults.add(
    {
      pass: store[storeName] === actualValue,
      path: path,
      actual: actualValue,
      expected: store[storeName],
      description: 'Check actual value ' + actualValue + ' matches value ' + store[storeName] + ' in store[' + storeName + ']'
    }
  );
}

function regexCheck(path, actualValue, regexPattern) {
  verificationResults.add(
    {
      pass: regexPattern.test(actualValue),
      path: path,
      actual: actualValue,
      expected: regexPattern,
      description: 'Check actual value ' + actualValue + ' against regex ' + regexPattern.toString()
    }
  );
}

function timestampCheck(path, actualValue, regexPattern, timezone, dateFormat) {
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
}

function checkForExpectedMsgComponent(actualMsgAsXmlDocument, expectedMsgComponent, pathIsRootElement) {
  checkPathForExpectedMsgComponent(actualMsgAsXmlDocument, expectedMsgComponent, pathIsRootElement);

  if (_.isUndefined(expectedMsgComponent.pathShouldNotExist) || !expectedMsgComponent.pathShouldNotExist) {
    var actualValue = getActualValueAtPathSpecified(actualMsgAsXmlDocument, expectedMsgComponent, pathIsRootElement);
    var expectedValue = expectedMsgComponent.equals;
    var containsExpectedValue = expectedMsgComponent.contains;

    if (expectedValue != undefined) {
      if (Number.isInteger(expectedValue)) {
        verificationResults.add(
          {
            pass: parseInt(actualValue) === expectedValue,
            path: getFullPath(expectedMsgComponent),
            actual: parseInt(actualValue),
            expected: expectedValue,
            description: 'Check actual value ' + actualValue + ' is equal to ' + expectedValue
          }
        );
      } else if (_.isRegExp(expectedValue)) {

        if (expectedValue.toString().indexOf('local-timezone') != -1) {
          timestampCheck(getFullPath(expectedMsgComponent), actualValue, expectedValue, 'local-timezone', expectedMsgComponent.dateFormat);
        } else if (expectedValue.toString().indexOf('utc-timezone') != -1) {
          timestampCheck(getFullPath(expectedMsgComponent), actualValue, expectedValue, 'utc-timezone', expectedMsgComponent.dateFormat);
        } else {
          regexCheck(getFullPath(expectedMsgComponent), actualValue, expectedValue);
        }
      } else if (expectedValue.match(/^\{store\(.*\)}$/) != null) {
        var storeName = expectedValue.match(/\(([^)]+)\)/)[1];
        if (!/^[a-zA-Z]+$/.test(storeName)) {
          throw new Error('Store name \'' + storeName + '\' is only allowed to consist of characters.')
        }
        storeNameAndActualValue(storeName, actualValue);
      } else if (expectedValue.match(/^\{matches\([a-zA-Z]*\)}$/) != null) {
        var storeName = expectedValue.match(/\(([^)]+)\)/)[1];
        compareToStoredValue(getFullPath(expectedMsgComponent), storeName, actualValue);
      } else if (expectedValue.match(/^\{uuid}$/) != null) {
        uuidCheck(getFullPath(expectedMsgComponent), actualValue);
      } else if (expectedValue.match(/^\{alphanumeric}$/) != null) {
        isAlphanumericCheck(getFullPath(expectedMsgComponent), actualValue);
      } else if (expectedValue.match(/^\{alpha}$/) != null) {
        isAlphaCheck(getFullPath(expectedMsgComponent), actualValue);
      } else if (expectedValue.match(/^\{integer}$/) != null) {
        isInteger(getFullPath(expectedMsgComponent), actualValue);
      } else if (expectedValue.match(/^\{length\(<\d+\)\}$/) != null) {
        lessThanLengthCheck(getFullPath(expectedMsgComponent), actualValue, parseInt(expectedValue.match(/\d+/)[0]));
      } else if (expectedValue.match(/^\{length\(>\d+\)\}$/) != null) {
        greaterThanLengthCheck(getFullPath(expectedMsgComponent), actualValue, parseInt(expectedValue.match(/\d+/)[0]));
      } else if (expectedValue.match(/^\{length\(\d+\)\}$/) != null) {
        equalLengthCheck(getFullPath(expectedMsgComponent), actualValue, parseInt(expectedValue.match(/\d+/)[0]));
      } else {
        verificationResults.add(
          {
            pass: actualValue === expectedValue,
            path: getFullPath(expectedMsgComponent),
            actual: actualValue,
            expected: expectedValue,
            description: 'Check actual value ' + actualValue + ' is equal to ' + expectedValue
          }
        );
      }
    }

    if (containsExpectedValue != undefined) {
      verificationResults.add(
        {
          pass: actualValue.indexOf(containsExpectedValue) != -1,
          path: getFullPath(expectedMsgComponent),
          actual: actualValue,
          expected: 'contains: ' + containsExpectedValue,
          description: 'Check actual value ' + actualValue + ' contains ' + containsExpectedValue
        }
      );
    }
  }
}

function checkForAllExpectedMsgComponents(actualMsgAsXmlDocument, expectedMsg, rootElement) {
  expectedMsg.forEach(function (expectedMsgComponent) {
    // TODO: what if the root element name matches a child element?
    checkForExpectedMsgComponent(actualMsgAsXmlDocument, expectedMsgComponent, rootElement === expectedMsgComponent.path)
  });
}

var messageCheckr = function messageCheckr(params) {
  var type, actualMsg, expectedMsg, expectedRootElement, cleansedMessage, xmlDocument;

  validateParams(params);
  validateExpectedMsg(params.expectedMsg);
  verificationResults.initialise();
  store = {};

  type = params.type;
  actualMsg = params.actualMsg;
  expectedMsg = params.expectedMsg;
  expectedRootElement = params.expectedRootElement;

  if (type === 'soap') {
    cleansedMessage = cleanRawSoapMessage(actualMsg);
    xmlDocument = convertToXmlDocumentType(cleansedMessage);
    checkRootElement(xmlDocument, 'SOAP-ENV:Envelope');
    checkForAllExpectedMsgComponents(xmlDocument, expectedMsg, 'SOAP-ENV:Envelope');
  } else if (type === 'jms') {
    cleansedMessage = cleanRawXmlMessage(actualMsg);
    xmlDocument = convertToXmlDocumentType(cleansedMessage);
    checkRootElement(xmlDocument, expectedRootElement);
    checkForAllExpectedMsgComponents(xmlDocument, expectedMsg, xmlDocument.name);
  } else {
    throw new Error('type ' + type + ' is not handled yet');
  }

  return ({allChecksPassed: verificationResults.getOverallResult(), checks: verificationResults.getAllChecks()});
};

module.exports = messageCheckr;