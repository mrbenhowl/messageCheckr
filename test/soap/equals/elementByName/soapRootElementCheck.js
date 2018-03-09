describe('soap - root element check', function () {

  describe('standard soap message', () => {
    it('should not report a mismatch where the actual root element is soap-env', function () {
      var actualMsg =
        `<soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
      <soap-env:Header/>
      <soap-env:Body/>
      </soap-env:Envelope>`

      var expectedMessage = [
        {path: 'SOAP-ENV:Envelope', attribute: 'xmlns', equals: 'http://schemas.xmlsoap.org/soap/envelope/'}
      ]

      var result = messageCheckr({
        type: 'soap',
        verbose: true,
        actualMsg: actualMsg,
        expectedMsg: expectedMessage
      })

      assert.equal(result.allChecksPassed, false)
      assert.deepEqual(result.checks[0], {
        actual: 'SOAP-ENV:Envelope',
        description: 'Check actual root element SOAP-ENV:Envelope is equal to expected root element SOAP-ENV:Envelope',
        expected: 'SOAP-ENV:Envelope',
        pass: true,
        target: 'SOAP-ENV:Envelope'
      })
    })

    it('should report a mismatch where the actual root element does not match the expected root element', function () {
      var actualMsg =
        `<soap-env:Envelope1 xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
      <soap-env:Header/>
      <soap-env:Body/>
      </soap-env:Envelope1>`

      var expectedMessage = [
        {path: 'SOAP-ENV:Envelope', attribute: 'xmlns', equals: 'http://schemas.xmlsoap.org/soap/envelope/'}
      ]

      var result = messageCheckr({
        type: 'soap',
        verbose: true,
        actualMsg: actualMsg,
        expectedMsg: expectedMessage
      })

      assert.equal(result.allChecksPassed, false)
      assert.deepEqual(result.checks[0], {
        actual: 'SOAP-ENV:Envelope1',
        description: 'Check actual root element SOAP-ENV:Envelope1 is equal to expected root element SOAP-ENV:Envelope',
        expected: 'SOAP-ENV:Envelope',
        pass: false,
        target: 'SOAP-ENV:Envelope'
      })
    })
  })

  describe('non standard soap message', () => {
    var actualMsg =
      `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Header/>
      <soap:Body/>
    </soap:Envelope>`

    it('should not report a mismatch where the actual root element is soap ', function () {
      var expectedMessage = [
        {path: 'SOAP-ENV:Envelope', attribute: 'xmlns', equals: 'http://schemas.xmlsoap.org/soap/envelope/'}
      ]

      var result = messageCheckr({
        type: 'soap',
        verbose: true,
        actualMsg: actualMsg,
        expectedMsg: expectedMessage
      })

      assert.equal(result.allChecksPassed, false)
      assert.deepEqual(result.checks[0], {
        actual: 'SOAP-ENV:Envelope',
        description: 'Check actual root element SOAP-ENV:Envelope is equal to expected root element SOAP-ENV:Envelope',
        expected: 'SOAP-ENV:Envelope',
        pass: true,
        target: 'SOAP-ENV:Envelope'
      })
    })
  })
})