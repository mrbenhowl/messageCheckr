describe('jms - regex check', function () {

  var actualMsg = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <testRootElement xmlns="http://www.testing.com/integration/event">
    <elementToCheckRegex>2015-11-01T08:12:15.425+11:00</elementToCheckRegex>
  </testRootElement>`;

  describe('regex pattern does not contains begins or ends with', function () {

    it('should report a mismatch where the actual element does not match the expected regex pattern', function () {
      var regexPattern, expectedMessage;

      regexPattern = /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}\+[0-9]{2}:[0-9]{3}/;
      expectedMessage = [
        {path: 'elementToCheckRegex', equals: regexPattern}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMsg,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, false);
      assert.deepEqual(result.checks[2], {
        description: 'Check actual value 2015-11-01T08:12:15.425+11:00 against regex ' + regexPattern,
        passedCheck: false
      });
    });

    it('should report a match where the actual element matches the expected regex pattern', function () {
      var regexPattern, expectedMessage;

      regexPattern = /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}\+[0-9]{2}:[0-9]{2}/;
      expectedMessage = [
        {path: 'elementToCheckRegex', equals: regexPattern}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMsg,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);
      assert.deepEqual(result.checks[2], {
        description: 'Check actual value 2015-11-01T08:12:15.425+11:00 against regex ' + regexPattern,
        passedCheck: true
      });
    });
  });

  describe('regex pattern contains begins with', function () {

    it('should report a mismatch where the actual element does not match the expected regex pattern', function () {
      var regexPattern, expectedMessage;

      regexPattern = /^[0-9]{5}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}\+[0-9]{2}:[0-9]{2}/;
      expectedMessage = [
        {path: 'elementToCheckRegex', equals: regexPattern}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMsg,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, false);
      assert.deepEqual(result.checks[2], {
        description: 'Check actual value 2015-11-01T08:12:15.425+11:00 against regex ' + regexPattern,
        passedCheck: false
      });
    });

    it('should report a match where the actual element matches the expected regex pattern', function () {
      var regexPattern, expectedMessage;

      regexPattern = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}\+[0-9]{2}:[0-9]{2}/;
      expectedMessage = [
        {path: 'elementToCheckRegex', equals: regexPattern}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMsg,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);
      assert.deepEqual(result.checks[2], {
        description: 'Check actual value 2015-11-01T08:12:15.425+11:00 against regex ' + regexPattern,
        passedCheck: true
      });
    });
  });

  describe('regex pattern contains ends with', function () {

    it('should report a mismatch where the actual element does not match the expected regex pattern', function () {
      var regexPattern, expectedMessage;

      regexPattern = /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}\+[0-9]{2}:[0-9]{3}$/;
      expectedMessage = [
        {path: 'elementToCheckRegex', equals: regexPattern}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMsg,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, false);
      assert.deepEqual(result.checks[2], {
        description: 'Check actual value 2015-11-01T08:12:15.425+11:00 against regex ' + regexPattern,
        passedCheck: false
      });
    });

    it('should report a match where the actual element matches the expected regex pattern', function () {
      var regexPattern, expectedMessage;

      regexPattern = /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}\+[0-9]{2}:[0-9]{2}$/;
      expectedMessage = [
        {path: 'elementToCheckRegex', equals: regexPattern}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMsg,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);
      assert.deepEqual(result.checks[2], {
        description: 'Check actual value 2015-11-01T08:12:15.425+11:00 against regex ' + regexPattern,
        passedCheck: true
      });
    });
  });

  describe('regex pattern contains begins and ends with', function () {

    it('should report a mismatch where the actual element does not match the expected regex pattern', function () {
      var regexPattern, expectedMessage;

      regexPattern = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}\+[0-9]{2}:[0-9]{3}$/;
      expectedMessage = [
        {path: 'elementToCheckRegex', equals: regexPattern}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMsg,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, false);
      assert.deepEqual(result.checks[2], {
        description: 'Check actual value 2015-11-01T08:12:15.425+11:00 against regex ' + regexPattern,
        passedCheck: false
      });
    });

    it('should report a match where the actual element matches the expected regex pattern', function () {
      var regexPattern, expectedMessage;

      regexPattern = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}\+[0-9]{2}:[0-9]{2}$/;
      expectedMessage = [
        {path: 'elementToCheckRegex', equals: regexPattern}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMsg,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);
      assert.deepEqual(result.checks[2], {
        description: 'Check actual value 2015-11-01T08:12:15.425+11:00 against regex ' + regexPattern,
        passedCheck: true
      });
    });
  });
});