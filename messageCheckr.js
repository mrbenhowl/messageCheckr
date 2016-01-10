var _ = require('lodash'),
  convertToXmlDocumentType = require('./libs/convertToXmlDocumentType'),
  validateParams = require('./libs/validateParams.js'),
  validateExpectedMsg = require('./libs/validateExpectedMsg'),
  cleanRawSoapMessage = require('./libs/cleanRawSoapMessage'),
  cleanRawXmlMessage = require('./libs/cleanRawXmlMessage'),
  verificationResults = require('./libs/verificationResults'),
  getFullPath = require('./libs/getFullPath'),
  assertions = require('./libs/assertions');

// for storing user defined attributes
var store = {};

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

function checkForExpectedMsgComponent(actualMsgAsXmlDocument, expectedMsgComponent, pathIsRootElement) {
  assertions.checkPathForExpectedMsgComponent(actualMsgAsXmlDocument, expectedMsgComponent, pathIsRootElement);

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
          assertions.timestampCheck(getFullPath(expectedMsgComponent), actualValue, expectedValue, 'local-timezone', expectedMsgComponent.dateFormat);
        } else if (expectedValue.toString().indexOf('utc-timezone') != -1) {
          assertions.timestampCheck(getFullPath(expectedMsgComponent), actualValue, expectedValue, 'utc-timezone', expectedMsgComponent.dateFormat);
        } else {
          assertions.regexCheck(getFullPath(expectedMsgComponent), actualValue, expectedValue);
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
        assertions.uuidCheck(getFullPath(expectedMsgComponent), actualValue);
      } else if (expectedValue.match(/^\{alphanumeric}$/) != null) {
        assertions.isAlphanumericCheck(getFullPath(expectedMsgComponent), actualValue);
      } else if (expectedValue.match(/^\{alpha}$/) != null) {
        assertions.isAlphaCheck(getFullPath(expectedMsgComponent), actualValue);
      } else if (expectedValue.match(/^\{integer}$/) != null) {
        assertions.isInteger(getFullPath(expectedMsgComponent), actualValue);
      } else if (expectedValue.match(/^\{length\(<\d+\)\}$/) != null) {
        assertions.lessThanLengthCheck(getFullPath(expectedMsgComponent), actualValue, parseInt(expectedValue.match(/\d+/)[0]));
      } else if (expectedValue.match(/^\{length\(>\d+\)\}$/) != null) {
        assertions.greaterThanLengthCheck(getFullPath(expectedMsgComponent), actualValue, parseInt(expectedValue.match(/\d+/)[0]));
      } else if (expectedValue.match(/^\{length\(\d+\)\}$/) != null) {
        assertions.equalLengthCheck(getFullPath(expectedMsgComponent), actualValue, parseInt(expectedValue.match(/\d+/)[0]));
      } else {
        assertions.equalCheck(getFullPath(expectedMsgComponent), actualValue, expectedValue);
      }
    }

    if (containsExpectedValue != undefined) {
      assertions.containsCheck(getFullPath(expectedMsgComponent), actualValue, containsExpectedValue);
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
    assertions.checkRootElement(xmlDocument, 'SOAP-ENV:Envelope');
    checkForAllExpectedMsgComponents(xmlDocument, expectedMsg, 'SOAP-ENV:Envelope');
  } else if (type === 'jms') {
    cleansedMessage = cleanRawXmlMessage(actualMsg);
    xmlDocument = convertToXmlDocumentType(cleansedMessage);
    assertions.checkRootElement(xmlDocument, expectedRootElement);
    checkForAllExpectedMsgComponents(xmlDocument, expectedMsg, xmlDocument.name);
  } else {
    throw new Error('type ' + type + ' is not handled');
  }

  return ({allChecksPassed: verificationResults.getOverallResult(), checks: verificationResults.getAllChecks()});
};

module.exports = messageCheckr;