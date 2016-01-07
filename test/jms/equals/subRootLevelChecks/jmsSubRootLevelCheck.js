describe('jms - sub root level check', function() {

  var actualMsg = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <testRootElement xmlns="http://www.testing.com/integration/event">
    <subRootLevel>
        <elementAtSubRootLevel>checkMe</elementAtSubRootLevel>
    </subRootLevel>
  </testRootElement>`;

  it('should report a mismatch where the actual sub root level value does not the expected value', function() {
    var expectedMessage = [
      {path: 'subRootLevel.elementAtSubRootLevel', equals: 'willNotMatch'}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, false);
    assert.deepEqual(result.checks[2], {
      "actual": 'checkMe',
      "description": "Check actual value checkMe is equal to willNotMatch",
      "expected": 'willNotMatch',
      "passedCheck": false
    });
  });

  it('should report a match where the actual sub root level value does match the expected value', function() {
    var expectedMessage = [
      {path: 'subRootLevel.elementAtSubRootLevel', equals: 'checkMe'}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, true);
    assert.deepEqual(result.checks[2], {
      "actual": 'checkMe',
      "description": "Check actual value checkMe is equal to checkMe",
      "expected": 'checkMe',
      "passedCheck": true
    });
  });
});