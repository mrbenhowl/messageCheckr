describe('jms - repeating element equals integer', function() {

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

  it('should report a mismatch where the actual repeating group element value does not match the expected value', function() {
    var expectedMessage = [
      {repeatingGroup: {path: 'thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldOneOfRepeatingGroup', equals: 10002},
      {repeatingGroup: {path: 'thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldTwoOfRepeatingGroup', equals: 10004},
      {repeatingGroup: {path: 'thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldOneOfRepeatingGroup', equals: 10001},
      {repeatingGroup: {path: 'thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldTwoOfRepeatingGroup', equals: 10003}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, false);

    assert.deepEqual(result.checks[2], {
      actual: 10001,
      description: "Check actual value 10001 is equal to 10002",
      expected: 10002,
      pass: false,
      path: 'thingContainingRepeatingGroups.RepeatingGroup.fieldOneOfRepeatingGroup number: 1'
    });

    assert.deepEqual(result.checks[4], {
      actual: 10003,
      description: "Check actual value 10003 is equal to 10004",
      expected: 10004,
      pass: false,
      path: 'thingContainingRepeatingGroups.RepeatingGroup.fieldTwoOfRepeatingGroup number: 1'
    });

    assert.deepEqual(result.checks[6], {
      actual: 10002,
      description: "Check actual value 10002 is equal to 10001",
      expected: 10001,
      pass: false,
      path: 'thingContainingRepeatingGroups.RepeatingGroup.fieldOneOfRepeatingGroup number: 2'
    });

    assert.deepEqual(result.checks[8], {
      actual: 10004,
      description: "Check actual value 10004 is equal to 10003",
      expected: 10003,
      pass: false,
      path: 'thingContainingRepeatingGroups.RepeatingGroup.fieldTwoOfRepeatingGroup number: 2'
    });
  });

  it('should report a match where the actual repeating group element value does match the expected value', function() {
    var expectedMessage = [
      {repeatingGroup: {path: 'thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldOneOfRepeatingGroup', equals: 10001},
      {repeatingGroup: {path: 'thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldTwoOfRepeatingGroup', equals: 10003},
      {repeatingGroup: {path: 'thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldOneOfRepeatingGroup', equals: 10002},
      {repeatingGroup: {path: 'thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldTwoOfRepeatingGroup', equals: 10004}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, true);
    assert.deepEqual(result.checks[2], {
      actual: 10001,
      description: "Check actual value 10001 is equal to 10001",
      expected: 10001,
      pass: true,
      path: 'thingContainingRepeatingGroups.RepeatingGroup.fieldOneOfRepeatingGroup number: 1'
    });

    assert.deepEqual(result.checks[4], {
      actual: 10003,
      description: "Check actual value 10003 is equal to 10003",
      expected: 10003,
      pass: true,
      path: 'thingContainingRepeatingGroups.RepeatingGroup.fieldTwoOfRepeatingGroup number: 1'
    });

    assert.deepEqual(result.checks[6], {
      actual: 10002,
      description: "Check actual value 10002 is equal to 10002",
      expected: 10002,
      pass: true,
      path: 'thingContainingRepeatingGroups.RepeatingGroup.fieldOneOfRepeatingGroup number: 2'
    });

    assert.deepEqual(result.checks[8], {
      actual: 10004,
      description: "Check actual value 10004 is equal to 10004",
      expected: 10004,
      pass: true,
      path: 'thingContainingRepeatingGroups.RepeatingGroup.fieldTwoOfRepeatingGroup number: 2'
    });
  });
});