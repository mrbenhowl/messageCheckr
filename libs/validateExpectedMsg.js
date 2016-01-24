var _ = require('lodash');

var validateExpectedMsg = function (expectedMsg) {

  if (!Array.isArray(expectedMsg)) {
    throw new Error('expectedMsg should be an array');
  }

  if (expectedMsg.length === 0) {
    throw new Error('expectedMsg is empty');
  }

  var nonMatchingPatterns = _(expectedMsg)
    .filter(function (el) {
      var topLevelKeys = _.keys(el).sort(),
        matchesAnExpectedPattern = false,
        repeatingGroupKeys = ['number', 'path', 'repeater'];

      if (_.isEqual(topLevelKeys, ['equals', 'path'])) {
        matchesAnExpectedPattern = true;
      } else if (_.isEqual(topLevelKeys, ['dateFormat', 'equals', 'path'])) {
        matchesAnExpectedPattern = true;
      } else if (_.isEqual(topLevelKeys, ['contains', 'path'])) {
        matchesAnExpectedPattern = true;
      } else if (_.isEqual(topLevelKeys, ['attribute', 'equals', 'path'])) {
        matchesAnExpectedPattern = true;
      } else if (_.isEqual(topLevelKeys, ['attribute', 'dateFormat', 'equals', 'path'])) {
        matchesAnExpectedPattern = true;
      } else if (_.isEqual(topLevelKeys, ['attribute', 'contains', 'path'])) {
        matchesAnExpectedPattern = true;
      } else if (_.isEqual(topLevelKeys, ['path', 'pathShouldNotExist'])) {
        matchesAnExpectedPattern = true;
      } else if (_.isEqual(topLevelKeys, ['attribute', 'dateFormat', 'equals', 'path', 'repeatingGroup'])) {
        if (_.isEqual(_.keys(el.repeatingGroup).sort(), repeatingGroupKeys)) {
          matchesAnExpectedPattern = true;
        }
      } else if (_.isEqual(topLevelKeys, ['dateFormat', 'equals', 'path', 'repeatingGroup'])) {
        if (_.isEqual(_.keys(el.repeatingGroup).sort(), repeatingGroupKeys)) {
          matchesAnExpectedPattern = true;
        }
      } else if (_.isEqual(topLevelKeys, ['attribute', 'equals', 'path', 'repeatingGroup'])) {
        if (_.isEqual(_.keys(el.repeatingGroup).sort(), repeatingGroupKeys)) {
          matchesAnExpectedPattern = true;
        }
      } else if (_.isEqual(topLevelKeys, ['attribute', 'contains', 'path', 'repeatingGroup'])) {
        if (_.isEqual(_.keys(el.repeatingGroup).sort(), repeatingGroupKeys)) {
          matchesAnExpectedPattern = true;
        }
      } else if (_.isEqual(topLevelKeys, ['equals', 'path', 'repeatingGroup'])) {
        if (_.isEqual(_.keys(el.repeatingGroup).sort(), repeatingGroupKeys)) {
          matchesAnExpectedPattern = true;
        }
      } else if (_.isEqual(topLevelKeys, ['contains', 'path', 'repeatingGroup'])) {
        if (_.isEqual(_.keys(el.repeatingGroup).sort(), repeatingGroupKeys)) {
          matchesAnExpectedPattern = true;
        }
      } else if (_.isEqual(topLevelKeys, ['path', 'pathShouldNotExist', 'repeatingGroup'])) {
        if (_.isEqual(_.keys(el.repeatingGroup).sort(), repeatingGroupKeys)) {
          matchesAnExpectedPattern = true;
        }
      } else if (_.isEqual(topLevelKeys, ['element', 'elementPosition', 'equals', 'parentPath'])) {
        if (!Number.isInteger(el.elementPosition)) throw new Error('elementPosition should be an integer');
        if (el.elementPosition < 1) throw new Error('elementPosition should be greater than 0');
        matchesAnExpectedPattern = true;
      } else if (_.isEqual(topLevelKeys, ['dateFormat', 'element', 'elementPosition', 'equals', 'parentPath'])) {
        if (!Number.isInteger(el.elementPosition)) throw new Error('elementPosition should be an integer');
        if (el.elementPosition < 1) throw new Error('elementPosition should be greater than 0');
        matchesAnExpectedPattern = true;
      } else if (_.isEqual(topLevelKeys, ['contains', 'element', 'elementPosition', 'parentPath'])) {
        if (!Number.isInteger(el.elementPosition)) throw new Error('elementPosition should be an integer');
        if (el.elementPosition < 1) throw new Error('elementPosition should be greater than 0');
        matchesAnExpectedPattern = true;
      } else if (_.isEqual(topLevelKeys, ['attribute', 'element', 'elementPosition', 'equals', 'parentPath'])) {
        if (!Number.isInteger(el.elementPosition)) throw new Error('elementPosition should be an integer');
        if (el.elementPosition < 1) throw new Error('elementPosition should be greater than 0');
        matchesAnExpectedPattern = true;
      } else if (_.isEqual(topLevelKeys, ['attribute', 'dateFormat', 'element', 'elementPosition', 'equals', 'parentPath'])) {
        if (!Number.isInteger(el.elementPosition)) throw new Error('elementPosition should be an integer');
        if (el.elementPosition < 1) throw new Error('elementPosition should be greater than 0');
        matchesAnExpectedPattern = true;
      } else if (_.isEqual(topLevelKeys, ['attribute', 'contains', 'element', 'elementPosition', 'parentPath'])) {
        if (!Number.isInteger(el.elementPosition)) throw new Error('elementPosition should be an integer');
        if (el.elementPosition < 1) throw new Error('elementPosition should be greater than 0');
        matchesAnExpectedPattern = true;
      }

      return !matchesAnExpectedPattern;
    })
    .value();

  if (nonMatchingPatterns.length > 0) {
    var errorMessage;
    if (nonMatchingPatterns.length > 1) {
      errorMessage = nonMatchingPatterns.length + ' expected message components do not match any of the expected patterns. Invalid components are: ';
    } else {
      errorMessage = '1 expected message component does not match any of the expected patterns. The invalid component is: ';
    }
    errorMessage += JSON.stringify(nonMatchingPatterns);

    throw new Error(errorMessage);
  }
};

module.exports = validateExpectedMsg;