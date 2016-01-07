describe('jms - contains repeating group check', function() {

  var actualMsg = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <testRootElement xmlns="http://www.testing.com/integration/event">
    <thingContainingRepeatingGroups>
        <RepeatingGroup>
            <fieldOneOfRepeatingGroup>10001</fieldOneOfRepeatingGroup>
            <fieldTwoOfRepeatingGroup>10003</fieldTwoOfRepeatingGroup>
        </RepeatingGroup>
        <RepeatingGroup>
            <fieldOneOfRepeatingGroup>10002</fieldOneOfRepeatingGroup>
            <fieldTwoOfRepeatingGroup>10004</fieldTwoOfRepeatingGroup>
        </RepeatingGroup>
    </thingContainingRepeatingGroups>
  </testRootElement>`;

  it('should report a musmatch where the actual repeating group element value does not match the expected value', function() {
    var expectedMessage = [
      {repeatingGroup: {path: 'thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldOneOfRepeatingGroup', contains: 10002},
      {repeatingGroup: {path: 'thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldTwoOfRepeatingGroup', contains: 10004},
      {repeatingGroup: {path: 'thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldOneOfRepeatingGroup', contains: 10001},
      {repeatingGroup: {path: 'thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldTwoOfRepeatingGroup', contains: 10003}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, false);

    assert.deepEqual(result.checks[2], {
      "description": "Check actual value 10001 contains 10002",
      "passedCheck": false
    });

    assert.deepEqual(result.checks[4], {
      "description": "Check actual value 10003 contains 10004",
      "passedCheck": false
    });

    assert.deepEqual(result.checks[6], {
      "description": "Check actual value 10002 contains 10001",
      "passedCheck": false
    });

    assert.deepEqual(result.checks[8], {
      "description": "Check actual value 10004 contains 10003",
      "passedCheck": false
    });
  });

  it('should report a match where the actual repeating group element value does contain the expected value', function() {
    var expectedMessage = [
      {repeatingGroup: {path: 'thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldOneOfRepeatingGroup', contains: 10001},
      {repeatingGroup: {path: 'thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldTwoOfRepeatingGroup', contains: 10003},
      {repeatingGroup: {path: 'thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldOneOfRepeatingGroup', contains: 10002},
      {repeatingGroup: {path: 'thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldTwoOfRepeatingGroup', contains: 10004}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, true);
    assert.deepEqual(result.checks[2], {
      "description": "Check actual value 10001 contains 10001",
      "passedCheck": true
    });

    assert.deepEqual(result.checks[4], {
      "description": "Check actual value 10003 contains 10003",
      "passedCheck": true
    });

    assert.deepEqual(result.checks[6], {
      "description": "Check actual value 10002 contains 10002",
      "passedCheck": true
    });

    assert.deepEqual(result.checks[8], {
      "description": "Check actual value 10004 contains 10004",
      "passedCheck": true
    });
  });
});