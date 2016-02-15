describe('jms - path not present checks', function () {
  var actualMsg = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <testRootElement xmlns="http://www.testing.com/integration/event">
    <subRootLevel>
      <field>checkingPathIsPresent</field>
    </subRootLevel>
  </testRootElement>`;

  it('should report a pass where path does not exist and the flag pathShouldNotExist is set to true', function () {
    //TODO: message not suitable for pathShouldNotExist
    var expectedMessage = [
      {path: 'subRootLevel.fieldDoesNotExist', pathShouldNotExist: true}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, true);
    assert.deepEqual(result.checks[1], {
      actual: false,
      expected: false,
      path: 'subRootLevel.fieldDoesNotExist',
      description: 'Check existence of path: subRootLevel.fieldDoesNotExist',
      pass: true
    });
  });

  it('should report a fail where a path exists and the flag pathShouldNotExist is set to true', function () {
    //TODO: message not suitable for pathShouldNotExist
    var expectedMessage = [
      {path: 'subRootLevel.field', pathShouldNotExist: true}
    ];

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMsg,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });

    assert.equal(result.allChecksPassed, false);
    assert.deepEqual(result.checks[1], {
      actual: true,
      expected: false,
      path: 'subRootLevel.field',
      description: 'Check existence of path: subRootLevel.field',
      pass: false
    });
  });

  describe('repeating group', function(){
    var actualMessage =
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <testRootElement xmlns="http://www.testing.com/integration/event">
        <elementOne>
          <thingContainingRepeatingGroups>
            <RepeatingGroup>
              <fieldOneOfRepeatingGroup>10001</fieldOneOfRepeatingGroup>
            </RepeatingGroup>
            <RepeatingGroup>
              <fieldOneOfRepeatingGroup>hello mr howl</fieldOneOfRepeatingGroup>
            </RepeatingGroup>
          </thingContainingRepeatingGroups>
        </elementOne>
        </testRootElement>`;

    it('should report a pass where path does not exist and the flag pathShouldNotExist is set to true (element "path" does not exist)', function () {
      var expectedMessage = [
        {repeatingGroup: {path: 'elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldTwoOfRepeatingGroup', pathShouldNotExist: true}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMessage,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);
    });

    it('should report a pass where path does not exist and the flag pathShouldNotExist is set to true ("number" does not exist)', function () {
      var expectedMessage = [
        {repeatingGroup: {path: 'elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 3}, path: 'fieldOneOfRepeatingGroup', pathShouldNotExist: true}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMessage,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);
    });

    it('should report a fail where a path exists and the flag pathShouldNotExist is set to true', function () {
      var expectedMessage = [
        {repeatingGroup: {path: 'elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldOneOfRepeatingGroup', pathShouldNotExist: true}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMessage,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, false);
    });
  });
});

//TODO: child and attribute tests
