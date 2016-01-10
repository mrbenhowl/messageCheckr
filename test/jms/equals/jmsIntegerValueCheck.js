describe('jms - integer value check', function() {

  var actualMsg = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <testRootElement xmlns="http://www.testing.com/integration/event">
    <integerFieldWith1Digit>1</integerFieldWith1Digit>
    <integerFieldWithMoreThan1Digit>12345</integerFieldWithMoreThan1Digit>
    <alphabeticalValue>abc</alphabeticalValue>
  </testRootElement>`;

  it('should report a mismatch where actual integer value does not the expected integer value', function() {
    var expectedMessage = [
      {path: 'integerFieldWith1Digit', equals: 2}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, false);
    assert.deepEqual(result.checks[2], {
      actual: 1,
      description: "Check actual value 1 is equal to 2",
      expected: 2,
      pass: false,
      path: 'integerFieldWith1Digit'
    });
  });

  it('should report a mismatch where actual value is not an integer', function() {
    var expectedMessage = [
      {path: 'alphabeticalValue', equals: 1}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, false);
    assert.deepEqual(result.checks[2], {
      actual: NaN,
      description: "Check actual value abc is equal to 1",
      expected: 1,
      pass: false,
      path: "alphabeticalValue"
    });
  });

  it('should report a match where the actual integer value matches the expected integer value - single digit', function () {
    var expectedMessage = [
      {path: 'integerFieldWith1Digit', equals: 1}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, true);
    assert.deepEqual(result.checks[2], {
      actual: 1,
      description: "Check actual value 1 is equal to 1",
      expected: 1,
      pass: true,
      path: "integerFieldWith1Digit"
    });
  });

  it('should report a match where the actual integer value matches the expected integer value - more than single digit', function () {
    var expectedMessage = [
      {path: 'integerFieldWithMoreThan1Digit', equals: 12345}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, true);
    assert.deepEqual(result.checks[2], {
      actual: 12345,
      description: "Check actual value 12345 is equal to 12345",
      expected: 12345,
      pass: true,
      path: "integerFieldWithMoreThan1Digit"
    });
  });
});