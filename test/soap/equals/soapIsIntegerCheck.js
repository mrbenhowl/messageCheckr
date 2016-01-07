describe('soap - is integer check', function() {

  var actualMsg =
    `<soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
      <soap-env:Header/>
      <soap-env:Body>
          <integerFieldWithMoreThan1Digit>12345</integerFieldWithMoreThan1Digit>
      </soap-env:Body>
    </soap-env:Envelope>`;

  it('should report a match where the actual value is an integer (12345)', function() {
    var expectedMessage = [
      {path: 'SOAP-ENV:Body.integerFieldWithMoreThan1Digit', equals: '{integer}'}
    ];

    var result = messageCheckr({
      type: 'soap',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
    });

    assert.equal(result.allChecksPassed, true);
    assert.deepEqual(result.checks[2], {
      "description": "Check actual value 12345 is an integer",
      "passedCheck": true
    });
  });
});