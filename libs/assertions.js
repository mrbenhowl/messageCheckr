var _ = require('lodash'),
  moment = require('moment'),
  validator = require('validator'),
  verificationResults = require('./verificationResults'),
  getFullPath = require('./getFullPath'),
  store = require('./store');

var assertions = {

  verifyMessageComponent: function verifyMessageComponent(messageComponent) {

    verificationResults.add(
      {
        pass: _.isUndefined(messageComponent.getExpected().pathShouldNotExist) === messageComponent.isPathPresent(),
        path: getFullPath(messageComponent),
        actual: messageComponent.isPathPresent(),
        expected: _.isUndefined(messageComponent.getExpected().pathShouldNotExist),
        description: 'Check existence of path: ' + getFullPath(messageComponent)
      }
    );

    if (_.isUndefined(messageComponent.getExpected().pathShouldNotExist)){
      if (_.has(messageComponent.getExpected(), 'equals')) {
        var actualValue = messageComponent.getActualValue();
        var expectedValue = messageComponent.getExpected().equals;

        if (Number.isInteger(expectedValue)) {
          verificationResults.add(
            {
              pass: parseInt(actualValue) === expectedValue,
              path: getFullPath(messageComponent),
              actual: parseInt(actualValue),
              expected: expectedValue,
              description: 'Check actual value ' + actualValue + ' is equal to ' + expectedValue
            }
          );
        } else if (_.isRegExp(expectedValue)) {

          if (expectedValue.toString().indexOf('local-timezone') != -1) {
            this.timestampCheck(getFullPath(messageComponent), actualValue, expectedValue, 'local-timezone', messageComponent.getExpected().dateFormat);
          } else if (expectedValue.toString().indexOf('utc-timezone') != -1) {
            this.timestampCheck(getFullPath(messageComponent), actualValue, expectedValue, 'utc-timezone', messageComponent.getExpected().dateFormat);
          } else {
            this.regexCheck(getFullPath(messageComponent), actualValue, expectedValue);
          }
        } else if (expectedValue.match(/^\{store\(.*\)}$/) != null) {
          var storeName = expectedValue.match(/\(([^)]+)\)/)[1];
          if (!/^[a-zA-Z]+$/.test(storeName)) {
            throw new Error('Store name \'' + storeName + '\' is only allowed to consist of characters.')
          }
          store.add(storeName, actualValue);
        } else if (expectedValue.match(/^\{matches\([a-zA-Z]*\)}$/) != null) {
          var storeName = expectedValue.match(/\(([^)]+)\)/)[1];
          this.storeCheck(getFullPath(messageComponent), storeName, actualValue);
        } else if (expectedValue.match(/^\{uuid}$/) != null) {
          this.uuidCheck(getFullPath(messageComponent), actualValue);
        } else if (expectedValue.match(/^\{alphanumeric}$/) != null) {
          this.isAlphanumericCheck(getFullPath(messageComponent), actualValue);
        } else if (expectedValue.match(/^\{alpha}$/) != null) {
          this.isAlphaCheck(getFullPath(messageComponent), actualValue);
        } else if (expectedValue.match(/^\{integer}$/) != null) {
          this.isInteger(getFullPath(messageComponent), actualValue);
        } else if (expectedValue.match(/^\{length\(<\d+\)\}$/) != null) {
          this.lessThanLengthCheck(getFullPath(messageComponent), actualValue, parseInt(expectedValue.match(/\d+/)[0]));
        } else if (expectedValue.match(/^\{length\(>\d+\)\}$/) != null) {
          this.greaterThanLengthCheck(getFullPath(messageComponent), actualValue, parseInt(expectedValue.match(/\d+/)[0]));
        } else if (expectedValue.match(/^\{length\(\d+\)\}$/) != null) {
          this.equalLengthCheck(getFullPath(messageComponent), actualValue, parseInt(expectedValue.match(/\d+/)[0]));
        } else {
          this.equalsCheck(getFullPath(messageComponent), actualValue, expectedValue);
        }

      } else if (_.has(messageComponent.getExpected(), 'contains')) {
        this.containsCheck(getFullPath(messageComponent), messageComponent.getActualValue(), messageComponent.getExpected().contains);
      } else {
        throw new Error('I have not accounted for something, whoops!');
      }
    }
  },

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

  equalsCheck: function equalsCheck(path, actualValue, expectedValue) {
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

  storeCheck: function storeCheck(path, storeName, actualValue) {
    var valuePreviouslyStored = store.get(storeName);

    verificationResults.add(
      {
        pass: valuePreviouslyStored === actualValue,
        path: path,
        actual: actualValue,
        expected: valuePreviouslyStored,
        description: 'Check actual value ' + actualValue + ' matches value ' + valuePreviouslyStored + ' in {store(' + storeName + ')}'
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
  }
  ,

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
  }
  ,

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
  }
  ,

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
  }
  ,

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
  }
  ,

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
  }
  ,

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
  }
  ,

  timestampCheck: function timestampCheck(path, actualValue, regexPattern, timezone, dateFormat) {
    var currentDate, regexObj;

    //TODO: can the undefined check be done in validate

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
};

module.exports = assertions;
