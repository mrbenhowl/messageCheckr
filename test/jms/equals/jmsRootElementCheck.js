describe('jms - root element check', function () {
  var actualMsg = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <testRootElement xmlns="http://www.testing.com/integration/event"></testRootElement>`;

  it('should report a mismatch where the actual root element does not match the expected root element', function () {
    var expectedMessage = [
      {path: 'testRootElement', attribute: 'xmlns', equals: 'http://www.testing.com/integration/event'}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement_wrong'
    });

    assert.equal(result.allChecksPassed, false);
    assert.deepEqual(result.checks[0], {
      actual: 'testRootElement',
      description: 'Check actual root element testRootElement is equal to expected root element testRootElement_wrong',
      expected: 'testRootElement_wrong',
      passedCheck: false
    });
  });

  it('should report a match where the actual root element matches the expected root element', function () {
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
    assert.deepEqual(result.checks[0], {
      actual: 'testRootElement',
      description: 'Check actual root element testRootElement is equal to expected root element testRootElement',
      expected: 'testRootElement',
      passedCheck: true
    });
  });

});