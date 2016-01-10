describe('jms - contains value check', function () {

  describe('where contains is of type string', function(){

    var actualMsg = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <testRootElement xmlns="http://www.testing.com/integration/event">
        <containsElement>noisehellonoise</containsElement>
      </testRootElement>`;

    it('should report a mismatch where an element\'s actual value does not contain the expected value', function () {
      var expectedMessage = [
        {path: 'containsElement', contains: 'yello'}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMsg,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, false);
      assert.deepEqual(result.checks[2], {
        actual: 'noisehellonoise',
        description: 'Check actual value noisehellonoise contains yello',
        expected: 'contains: yello',
        pass: false,
        path: 'containsElement'
      });
    });

    it('should report a match where the expected value is contained within the element\'s actual value', function () {
      var expectedMessage = [
        {path: 'containsElement', contains: 'hello'}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMsg,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);
      assert.deepEqual(result.checks[2], {
        actual: 'noisehellonoise',
        description: 'Check actual value noisehellonoise contains hello',
        expected: 'contains: hello',
        pass: true,
        path: 'containsElement'
      });
    });

    it('should report a match where the expected value is equal to the element\'s actual value', function () {
      var expectedMessage = [
        {path: 'containsElement', contains: 'noisehellonoise'}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMsg,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);
      assert.deepEqual(result.checks[2], {
        actual: 'noisehellonoise',
        description: 'Check actual value noisehellonoise contains noisehellonoise',
        expected: 'contains: noisehellonoise',
        pass: true,
        path: 'containsElement'
      });
    });
  });

  describe('where contains is of type integer', function(){

    var actualMsg = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <testRootElement xmlns="http://www.testing.com/integration/event">
        <containsElement>12345</containsElement>
      </testRootElement>`;

    it('should report a mismatch where an element\'s actual value does not contain the expected value', function () {
      var expectedMessage = [
        {path: 'containsElement', contains: 123456}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMsg,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, false);
      assert.deepEqual(result.checks[2], {
        actual: '12345',
        description: 'Check actual value 12345 contains 123456',
        expected: 'contains: 123456',
        pass: false,
        path: 'containsElement'
      });
    });

    it('should report a match where the expected value is contained within the element\'s actual value', function () {
      var expectedMessage = [
        {path: 'containsElement', contains: 1234}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMsg,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);
      assert.deepEqual(result.checks[2], {
        actual: '12345',
        description: 'Check actual value 12345 contains 1234',
        expected: 'contains: 1234',
        pass: true,
        path: 'containsElement'
      });
    });

    it('should report a match where the expected value is equal to the element\'s actual value', function () {
      var expectedMessage = [
        {path: 'containsElement', contains: 12345}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMsg,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);
      assert.deepEqual(result.checks[2], {
        actual: '12345',
        description: 'Check actual value 12345 contains 12345',
        expected: 'contains: 12345',
        pass: true,
        path: 'containsElement'
      });
    });
  });
});