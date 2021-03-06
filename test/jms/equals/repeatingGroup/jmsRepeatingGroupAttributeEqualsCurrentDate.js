var moment = require('moment');

describe('jms - repeating element attribute equals current date', function () {
  var currentDateTimeLocal, currentDateTimeUtc;
  currentDateTimeLocal = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
  currentDateTimeUtc = moment().utc().format('DD-MM-YYYYTHH:mm:ss.SSSZ');

  var actualMsg = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <testRootElement xmlns="http://www.testing.com/integration/event">
    <thingContainingRepeatingGroups>
        <RepeatingGroup>
            <fieldOneOfRepeatingGroup attribute1="` + currentDateTimeLocal + `">not interested in this value</fieldOneOfRepeatingGroup>
        </RepeatingGroup>
        <RepeatingGroup>
            <fieldOneOfRepeatingGroup attribute1="` + currentDateTimeUtc + `">not interested in this value</fieldOneOfRepeatingGroup>
        </RepeatingGroup>
    </thingContainingRepeatingGroups>
  </testRootElement>`;

  it('should report a mismatch where the actual repeating group element value does not match the expected value', function () {
    var currentLocalDateRegexPattern = /local-timezoneT\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d\d/; // expecting 1 more digit than what is present
    var currentUtcDateRegexPattern = /utc-timezoneT\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d/;
    var currentLocalDate = moment().format('YYYY-MM-DD');
    var currentUtcDate = moment().utc().format('DD MM-YYYY'); // a dash is missing between DD and MM

    var expectedMessage = [
      {repeatingGroup: {path: 'testRootElement.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldOneOfRepeatingGroup', attribute: 'attribute1', equals: currentLocalDateRegexPattern, dateFormat: 'YYYY-MM-DD'},
      {repeatingGroup: {path: 'testRootElement.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldOneOfRepeatingGroup', attribute: 'attribute1', equals: currentUtcDateRegexPattern, dateFormat: 'DD MM-YYYY'}
    ];

    var result = messageCheckr({
      type: 'jms',
      verbose: true,
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, false);
    assert.deepEqual(result.checks[1], {
      actual: currentDateTimeLocal,
      description: "Check actual value " + currentDateTimeLocal + " matches date/regex pattern " + currentLocalDateRegexPattern.toString().replace('local-timezone', currentLocalDate),
      expected: {equals: currentLocalDateRegexPattern, dateFormat: 'YYYY-MM-DD'},
      pass: false,
      target: {repeatingGroup: {path: 'testRootElement.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldOneOfRepeatingGroup', attribute: 'attribute1'}
    });

    assert.deepEqual(result.checks[2], {
      actual: currentDateTimeUtc,
      description: "Check actual value " + currentDateTimeUtc + " matches date/regex pattern " + currentUtcDateRegexPattern.toString().replace('utc-timezone', currentUtcDate),
      expected: {equals: currentUtcDateRegexPattern, dateFormat: 'DD MM-YYYY'},
      pass: false,
      target: {repeatingGroup: {path: 'testRootElement.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldOneOfRepeatingGroup', attribute: 'attribute1'}
    });
  });

  it('should report a match where the actual repeating group element value does match the expected value', function () {
    var currentLocalDateRegexPattern = /local-timezoneT\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d/;
    var currentUtcDateRegexPattern = /utc-timezoneT\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d/;
    var currentLocalDate = moment().format('YYYY-MM-DD');
    var currentUtcDate = moment().utc().format('DD-MM-YYYY');

    var expectedMessage = [
      {repeatingGroup: {path: 'testRootElement.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldOneOfRepeatingGroup', attribute: 'attribute1', equals: currentLocalDateRegexPattern, dateFormat: 'YYYY-MM-DD'},
      {repeatingGroup: {path: 'testRootElement.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldOneOfRepeatingGroup', attribute: 'attribute1', equals: currentUtcDateRegexPattern, dateFormat: 'DD-MM-YYYY'}
    ];

    var result = messageCheckr({
      type: 'jms',
      verbose: true,
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, true);
    assert.deepEqual(result.checks[1], {
      actual: currentDateTimeLocal,
      description: "Check actual value " + currentDateTimeLocal + " matches date/regex pattern " + currentLocalDateRegexPattern.toString().replace('local-timezone', currentLocalDate),
      expected: {equals: currentLocalDateRegexPattern, dateFormat: 'YYYY-MM-DD'},
      pass: true,
      target: {repeatingGroup: {path: 'testRootElement.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldOneOfRepeatingGroup', attribute: 'attribute1'}
    });

    assert.deepEqual(result.checks[2], {
      actual: currentDateTimeUtc,
      description: "Check actual value " + currentDateTimeUtc + " matches date/regex pattern " + currentUtcDateRegexPattern.toString().replace('utc-timezone', currentUtcDate),
      expected: {equals: currentUtcDateRegexPattern, dateFormat: 'DD-MM-YYYY'},
      pass: true,
      target: {repeatingGroup: {path: 'testRootElement.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldOneOfRepeatingGroup', attribute: 'attribute1'}
    });
  });
});