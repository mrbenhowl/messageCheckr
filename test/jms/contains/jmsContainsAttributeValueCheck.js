describe('jms - contains attribute value check', function () {

  var actualMsg = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <testRootElement xmlns="http://www.testing.com/integration/event"></testRootElement>`;

  it('should report a mismatch where an element\'s attribute actual value does not match the expected value', function () {
    var expectedMessage = [
      {path: 'testRootElement', attribute: 'xmlns', contains: 'testing/'}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, false);
    assert.deepEqual(result.checks[2], {
      description: 'Check actual value http://www.testing.com/integration/event contains testing/',
      passedCheck: false
    });
  });

  it('should report a match where the expected value is contained within the attribute\'s actual value', function () {
    var expectedMessage = [
      {path: 'testRootElement', attribute: 'xmlns', contains: 'testing'}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, true);
    assert.deepEqual(result.checks[2], {
      description: 'Check actual value http://www.testing.com/integration/event contains testing',
      passedCheck: true
    });
  });

  it('should report a match where the expected value is equal to the attribute\'s actual value', function () {
    var expectedMessage = [
      {path: 'testRootElement', attribute: 'xmlns', contains: 'http://www.testing.com/integration/event'}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, true);
    assert.deepEqual(result.checks[2], {
      description: 'Check actual value http://www.testing.com/integration/event contains http://www.testing.com/integration/event',
      passedCheck: true
    });
  });
});