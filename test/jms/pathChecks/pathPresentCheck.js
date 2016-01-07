describe('jms - path checks', function () {
  var actualMsg = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <testRootElement xmlns="http://www.testing.com/integration/event">
    <subRootLevel>
      <field>checkingPathIsPresent</field>
    </subRootLevel>
  </testRootElement>`;

  it('should report a path is present where the specified path does exist', function () {
    var expectedMessage = [
      {path: 'subRootLevel.field', equals: 'checkingPathIsPresent'}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, true);
    assert.deepEqual(result.checks[1], {
      description: 'Check existence of path: subRootLevel.field',
      passedCheck: true
    });
  });

  it('should report a path to an attribute is present where the specified path does exist', function () {
    //TODO: attribute path check could get a better message
    var expectedMessage = [
      {path: 'testRootElement', attribute: 'xmlns', equals: 'http://www.testing.com/integration/event'}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, true);
    assert.deepEqual(result.checks[1], {
      description: 'Check existence of path: testRootElement',
      passedCheck: true
    });
  });

  it('should report the root path is present where the expectedRootElement does exist', function () {
    var expectedMessage = [
      {path: 'subRootLevel.field', equals: 'checkingPathIsPresent'}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, true);
    assert.deepEqual(result.checks[0], {
      actual: "testRootElement",
      expected: "testRootElement",
      description: 'Check actual root element testRootElement is equal to expected root element testRootElement',
      passedCheck: true
    });
  });

  it('should report a path is not present where the specified path does not exist', function () {
    var expectedMessage = [
      {path: 'subRootLevel.fieldDoesNotExist', equals: 'checkingPathIsPresent'}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, false);
    assert.deepEqual(result.checks[1], {
      description: 'Check existence of path: subRootLevel.fieldDoesNotExist',
      passedCheck: false
    });
  });

  it('should report a path to an attribute is not present where the specified path does exist', function () {
    //TODO: attribute path check could get a better message
    var expectedMessage = [
      {path: 'testRootElement', attribute: 'wrong', equals: 'http://www.testing.com/integration/event'}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, false);
    assert.deepEqual(result.checks[1], {
      description: 'Check existence of path: testRootElement',
      passedCheck: false
    });
  });

  it('should report the root path is not present where the expectedRootElement does not exist', function () {
    var expectedMessage = [
      {path: 'subRootLevel.field', equals: 'checkingPathIsPresent'}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElementDoesNotExist'
    });

    assert.equal(result.allChecksPassed, false);
    assert.deepEqual(result.checks[0], {
      actual: "testRootElement",
      expected: "testRootElementDoesNotExist",
      description: 'Check actual root element testRootElement is equal to expected root element testRootElementDoesNotExist',
      passedCheck: false
    });
  });
});

//TODO: child tests
