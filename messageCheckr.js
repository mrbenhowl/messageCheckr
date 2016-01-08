var xmldoc = require('xmldoc'),
  validator = require('validator'),
  _ = require('lodash'),
  moment = require('moment'),
  convertToXmlDocumentType = require('./libs/convertToXmlDocumentType.js'),
  validateParams = require('./libs/validateParams.js'),
  validateExpectedMsg = require('./libs/validateExpectedMsg.js'),
  cleanRawSoapMessage = require('./libs/cleanRawSoapMessage.js');

var result = {
  allChecksPassed: true,
  checks: []
};

// for storing user defined attributes
var store = {};

function prepareRawXmlMessage(beginFrom, message) {

  var cleansedMessage =
    message.substr(beginFrom)
      .replace(/(<\?xml)/gi, '<?XML')
      .replace(/<([a-z0-9\-]+):/gi, function(str) {
        if (str != '<?XML:') {
          return '<';
        } else {
          return str;
        }
      })
      .replace(/<\/([a-z0-9\-]+):/gi, '</');

  return cleansedMessage;
}

function compareAndRecord(actual, expected, description) {
  var record = {};
  record.passedCheck = actual === expected;

  if (typeof actual != "boolean") {
    record.actual = actual;
    record.expected = expected;
  }

  if (description) {
    record.description = description;
  }
  result.checks.push(record);

  if (!record.passedCheck) {
    result.allChecksPassed = false;
  }
}

function checkRootElement(xmlDocument, expectedRootElement) {
  compareAndRecord(xmlDocument.name, expectedRootElement, 'Check actual root element ' + xmlDocument.name + ' is equal to expected root element ' + expectedRootElement);
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

    compareAndRecord(_.isUndefined(pathShouldNotExist), pathExists, 'Check existence of path: ' + path);

  } else {
    // TODO: no support for child/attribute in the repeating group yet
    var pathToElementEnclosingRepeatingGroup = expectedMsgComponent.repeatingGroup.path;
    var repeatingElement = expectedMsgComponent.repeatingGroup.repeater;
    var pathToElementFromRepeatingElement = path;
    var version = expectedMsgComponent.repeatingGroup.number;

    var matchingGroups = _(actualMsgAsXmlDocument.descendantWithPath(pathToElementEnclosingRepeatingGroup).children)
      .pluck('name')
      .map(function(el, index) {
        if (el === repeatingElement) return index;
        return -1;
      })
      .filter(function(el) {
        return el != -1;
      })
      .value();

    pathExists = actualMsgAsXmlDocument.descendantWithPath(pathToElementEnclosingRepeatingGroup).children[matchingGroups[version - 1]].descendantWithPath(pathToElementFromRepeatingElement) != undefined;

    compareAndRecord(_.isUndefined(pathShouldNotExist), pathExists, 'Check for presence of the path: ' + pathToElementEnclosingRepeatingGroup + '.' + repeatingElement + '.' + pathToElementFromRepeatingElement + ' version: ' + version);
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
      .map(function(el, index) {
        if (el === repeatingElement) return index;
        return -1;
      })
      .filter(function(el) {
        return el != -1;
      })
      .value();

    actualValue = actualMsgAsXmlDocument.descendantWithPath(pathToElementEnclosingRepeatingGroup).children[matchingGroups[version - 1]].valueWithPath(pathToElementFromRepeatingElement);
  }

  return actualValue;
}

function uuidCheck(actualValue) {
  compareAndRecord(validator.isUUID(actualValue), true, 'Check actual value ' + actualValue + ' is a valid UUID');
}

function isAlphanumericCheck(actualValue) {
  compareAndRecord(validator.isAlphanumeric(actualValue), true, 'Check actual value ' + actualValue + ' is alphanumeric');
}

function isAlphaCheck(actualValue) {
  compareAndRecord(validator.isAlpha(actualValue), true, 'Check actual value ' + actualValue + ' is alpha');
}

function isInteger(actualValue) {
  if (Number.isNaN(Number(actualValue))) {
    compareAndRecord(false, true, 'Check actual value ' + actualValue + ' is an integer');
  } else {
    compareAndRecord(Number.isInteger(Number.parseFloat(actualValue)), true, 'Check actual value ' + actualValue + ' is an integer');
  }
}

function lessThanLengthCheck(actualValue, expectedLength) {
  var lessThanExpected = actualValue.toString().length < expectedLength;
  compareAndRecord(lessThanExpected, true, 'Check actual value ' + actualValue + ' has a length less than ' + expectedLength);
}

function greaterThanLengthCheck(actualValue, expectedLength) {
  var greaterThanExpected = actualValue.toString().length > expectedLength;
  compareAndRecord(greaterThanExpected, true, 'Check actual value ' + actualValue + ' has a length greater than ' + expectedLength);
}

function equalLengthCheck(actualValue, expectedLength) {
  var equal = actualValue.toString().length === expectedLength;
  compareAndRecord(equal, true, 'Check actual value ' + actualValue + ' has a length equal to ' + expectedLength);
}

function storeNameAndActualValue(storeName, actualValue) {
  if (Object.keys(store).indexOf(storeName) > -1) {
    throw new Error('The store name you have provided is already is use.');
  }
  store[storeName] = actualValue;
}

function compareToStoredValue(storeName, actualValue) {
  if (Object.keys(store).indexOf(storeName) === -1) {
    throw new Error('The store name you have provided to compare to does not exist.');
  }
  compareAndRecord(actualValue, store[storeName], 'Check actual value ' + actualValue + ' matches value ' + store[storeName] + ' in store[' + storeName + ']');
}

function regexCheck(actualValue, regexPattern) {
  compareAndRecord(regexPattern.test(actualValue), true, 'Check actual value ' + actualValue + ' against regex ' + regexPattern.toString());
}

function timestampCheck(actualValue, regexPattern, timezone, dateFormat) {
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
  compareAndRecord(regexObj.test(actualValue), true, 'Check actual value ' + actualValue + ' matches date/regex pattern ' + regexObj);
}

function checkForExpectedMsgComponent(actualMsgAsXmlDocument, expectedMsgComponent, pathIsRootElement) {

  checkPathForExpectedMsgComponent(actualMsgAsXmlDocument, expectedMsgComponent, pathIsRootElement);

  if (_.isUndefined(expectedMsgComponent.pathShouldNotExist) || !expectedMsgComponent.pathShouldNotExist) {
    var actualValue = getActualValueAtPathSpecified(actualMsgAsXmlDocument, expectedMsgComponent, pathIsRootElement);
    var expectedValue = expectedMsgComponent.equals;
    var containsExpectedValue = expectedMsgComponent.contains;

    if (expectedValue != undefined) {
      if (Number.isInteger(expectedValue)) {
        compareAndRecord(parseInt(actualValue), expectedValue, 'Check actual value ' + actualValue + ' is equal to ' + expectedValue);
      } else if (_.isRegExp(expectedValue)) {

        if (expectedValue.toString().indexOf('local-timezone') != -1) {
          timestampCheck(actualValue, expectedValue, 'local-timezone', expectedMsgComponent.dateFormat);
        } else if (expectedValue.toString().indexOf('utc-timezone') != -1) {
          timestampCheck(actualValue, expectedValue, 'utc-timezone', expectedMsgComponent.dateFormat);
        } else {
          regexCheck(actualValue, expectedValue);
        }

      } else if (expectedValue.match(/^\{store\(.*\)}$/) != null) {
        var storeName = expectedValue.match(/\(([^)]+)\)/)[1];
        if (!/^[a-zA-Z]+$/.test(storeName)) {
          throw new Error('Store name \'' + storeName + '\' is only allowed to consist of characters.')
        }
        storeNameAndActualValue(storeName, actualValue);
      } else if (expectedValue.match(/^\{matches\([a-zA-Z]*\)}$/) != null) {
        var storeName = expectedValue.match(/\(([^)]+)\)/)[1];
        compareToStoredValue(storeName, actualValue);
      } else if (expectedValue.match(/^\{uuid}$/) != null) {
        uuidCheck(actualValue);
      } else if (expectedValue.match(/^\{alphanumeric}$/) != null) {
        isAlphanumericCheck(actualValue);
      } else if (expectedValue.match(/^\{alpha}$/) != null) {
        isAlphaCheck(actualValue);
      } else if (expectedValue.match(/^\{integer}$/) != null) {
        isInteger(actualValue);
      } else if (expectedValue.match(/^\{length\(<\d+\)\}$/) != null) {
        lessThanLengthCheck(actualValue, parseInt(expectedValue.match(/\d+/)[0]));
      } else if (expectedValue.match(/^\{length\(>\d+\)\}$/) != null) {
        greaterThanLengthCheck(actualValue, parseInt(expectedValue.match(/\d+/)[0]));
      } else if (expectedValue.match(/^\{length\(\d+\)\}$/) != null) {
        equalLengthCheck(actualValue, parseInt(expectedValue.match(/\d+/)[0]));
      } else {
        compareAndRecord(actualValue, expectedValue, 'Check actual value ' + actualValue + ' is equal to ' + expectedValue);
      }
    }

    if (containsExpectedValue != undefined) {
      compareAndRecord(actualValue.indexOf(containsExpectedValue) != -1, true, 'Check actual value ' + actualValue + ' contains ' + containsExpectedValue);
    }
  }
}

function checkForAllExpectedMsgComponents(actualMsgAsXmlDocument, expectedMsg, rootElement) {
  expectedMsg.forEach(function(expectedMsgComponent) {
    // TODO: what if the root element name matches a child element?
    checkForExpectedMsgComponent(actualMsgAsXmlDocument, expectedMsgComponent, rootElement === expectedMsgComponent.path)
  });
}

var messageCheckr = function messageCheckr(params) {
  validateParams(params);
  validateExpectedMsg(params.expectedMsg);

  result.allChecksPassed = true;
  result.checks = [];
  store = {};

  var type = params.type,
    actualMsg = params.actualMsg,
    expectedMsg = params.expectedMsg,
    expectedRootElement = params.expectedRootElement;

  if (type === 'soap') {
    var cleansedSoapMessage = cleanRawSoapMessage(actualMsg);
    var actualSOAPMessageAsXmlDocument = convertToXmlDocumentType(cleansedSoapMessage);

    checkRootElement(actualSOAPMessageAsXmlDocument, 'SOAP-ENV:Envelope');
    checkForAllExpectedMsgComponents(actualSOAPMessageAsXmlDocument, expectedMsg, 'SOAP-ENV:Envelope');
  } else if (type === 'jms') {
    var scanMessageFromPosition = actualMsg.toLowerCase().indexOf('<?xml');
    if (scanMessageFromPosition === -1) throw new Error('message does contain the initial <?xml attribute.');

    var cleansedXmlMessage = prepareRawXmlMessage(scanMessageFromPosition, actualMsg);
    var actualXmlMessageAsXmlDocument = convertToXmlDocumentType(cleansedXmlMessage);
    checkRootElement(actualXmlMessageAsXmlDocument, expectedRootElement);
    checkForAllExpectedMsgComponents(actualXmlMessageAsXmlDocument, expectedMsg, actualXmlMessageAsXmlDocument.name);
  } else {
    throw new Error('type ' + type + ' is not handled yet');
  }

  return result;
};

module.exports = messageCheckr;