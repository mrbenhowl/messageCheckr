describe('jms - is alpha check', function() {

  var actualMsg = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <testRootElement xmlns="http://www.testing.com/integration/event">
    <integerField>1</integerField>
    <lettersOnlyField>abc</lettersOnlyField>
    <oneLetterField>z</oneLetterField>
    <mixedNumberAndAlphabeticalField>ab1c</mixedNumberAndAlphabeticalField>
  </testRootElement>`;

  it('should report a mismatch where the actual value is not just letters - it is an integer', function() {
    var expectedMessage = [
      {path: 'integerField', equals: '{alpha}'}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, false);
    assert.deepEqual(result.checks[2], {
      "description": "Check actual value 1 is alpha",
      "passedCheck": false
    });
  });

  it('should report a mismatch where the actual value is not just letters - it is combination of letters and an integer', function() {
    var expectedMessage = [
      {path: 'mixedNumberAndAlphabeticalField', equals: '{alpha}'}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, false);
    assert.deepEqual(result.checks[2], {
      "description": "Check actual value ab1c is alpha",
      "passedCheck": false
    });
  });

  it('should report a match where the actual value is alpha (more than 1 letter)', function() {
    var expectedMessage = [
      {path: 'lettersOnlyField', equals: '{alpha}'}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, true);
    assert.deepEqual(result.checks[2], {
      "description": "Check actual value abc is alpha",
      "passedCheck": true
    });
  });

  it('should report a match where the actual value is alpha (1 letter)', function() {
    var expectedMessage = [
      {path: 'oneLetterField', equals: '{alpha}'}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, true);
    assert.deepEqual(result.checks[2], {
      "description": "Check actual value z is alpha",
      "passedCheck": true
    });
  });
});