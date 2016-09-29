describe('soap - repeating group has elements', function () {

  var actualMsgWithThreeDifferentRepeatingGroups =
    `<soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
      <soap-env:Header/>
      <soap-env:Body>
        <thingContainingRepeatingGroups>
          <RepeatingGroup>
            <fieldOneOfRepeatingGroup>10001</fieldOneOfRepeatingGroup>
            <fieldTwoOfRepeatingGroup>10002</fieldTwoOfRepeatingGroup>
          </RepeatingGroup>
          <RepeatingGroup>
            <fieldOneOfRepeatingGroup>10003</fieldOneOfRepeatingGroup>
            <fieldTwoOfRepeatingGroup>10004</fieldTwoOfRepeatingGroup>
          </RepeatingGroup>
          <RepeatingGroup>
            <fieldOneOfRepeatingGroup>10005</fieldOneOfRepeatingGroup>
            <fieldTwoOfRepeatingGroup>10006</fieldTwoOfRepeatingGroup>           
          </RepeatingGroup>
        </thingContainingRepeatingGroups>
      </soap-env:Body>
    </soap-env:Envelope>`;

  it('should report a match where the first repeating group element contains the expected element values', function () {
    var expectedMessage = [
      {
        repeatingGroupHasElements: {
          path: 'SOAP-ENV:ENVELOPE.SOAP-ENV:Body.thingContainingRepeatingGroups',
          repeater: 'RepeatingGroup',
          elements: [
            { path: 'fieldOneOfRepeatingGroup', equals: 10001 },
            { path: 'fieldTwoOfRepeatingGroup', equals: 10002 }
          ]
        }
      }
    ];

    var result = messageCheckr({
      type: 'soap',
      verbose: true,
      actualMsg: actualMsgWithThreeDifferentRepeatingGroups,
      expectedMsg: expectedMessage
    });

    assert.equal(result.allChecksPassed, true);
    assert.deepEqual(result.checks[1], {
      description: 'Check for repeating group containing all specified elements and their corresponding values.',
      pass: true,
      target: {
        repeatingGroupHasElements: {
          path: 'SOAP-ENV:ENVELOPE.SOAP-ENV:Body.thingContainingRepeatingGroups',
          repeater: 'RepeatingGroup',
          elements: [
            { path: 'fieldOneOfRepeatingGroup', equals: 10001 },
            { path: 'fieldTwoOfRepeatingGroup', equals: 10002 }
          ]
        }
      }
    });
  });

  it('should report a match where the middle repeating group element contains the expected element values', function () {
    var expectedMessage = [
      {
        repeatingGroupHasElements: {
          path: 'SOAP-ENV:ENVELOPE.SOAP-ENV:Body.thingContainingRepeatingGroups',
          repeater: 'RepeatingGroup',
          elements: [
            { path: 'fieldTwoOfRepeatingGroup', equals: 10004 },
            { path: 'fieldOneOfRepeatingGroup', equals: 10003 }
          ]
        }
      }
    ];

    var result = messageCheckr({
      type: 'soap',
      verbose: true,
      actualMsg: actualMsgWithThreeDifferentRepeatingGroups,
      expectedMsg: expectedMessage
    });

    assert.equal(result.allChecksPassed, true);
    assert.deepEqual(result.checks[1], {
      description: 'Check for repeating group containing all specified elements and their corresponding values.',
      pass: true,
      target: {
        repeatingGroupHasElements: {
          path: 'SOAP-ENV:ENVELOPE.SOAP-ENV:Body.thingContainingRepeatingGroups',
          repeater: 'RepeatingGroup',
          elements: [
            { path: 'fieldTwoOfRepeatingGroup', equals: 10004 },
            { path: 'fieldOneOfRepeatingGroup', equals: 10003 }
          ]
        }
      }
    });
  });

  it('should report a match where the last repeating group element contains the expected element values', function () {
    var expectedMessage = [
      {
        repeatingGroupHasElements: {
          path: 'SOAP-ENV:ENVELOPE.SOAP-ENV:Body.thingContainingRepeatingGroups',
          repeater: 'RepeatingGroup',
          elements: [
            { path: 'fieldOneOfRepeatingGroup', equals: 10005 },
            { path: 'fieldTwoOfRepeatingGroup', equals: 10006 }
          ]
        }
      }
    ];

    var result = messageCheckr({
      type: 'soap',
      verbose: true,
      actualMsg: actualMsgWithThreeDifferentRepeatingGroups,
      expectedMsg: expectedMessage
    });

    assert.equal(result.allChecksPassed, true);
    assert.deepEqual(result.checks[1], {
      description: 'Check for repeating group containing all specified elements and their corresponding values.',
      pass: true,
      target: {
        repeatingGroupHasElements: {
          path: 'SOAP-ENV:ENVELOPE.SOAP-ENV:Body.thingContainingRepeatingGroups',
          repeater: 'RepeatingGroup',
          elements: [
            { path: 'fieldOneOfRepeatingGroup', equals: 10005 },
            { path: 'fieldTwoOfRepeatingGroup', equals: 10006 }
          ]
        }
      }
    });
  });

  var actualMsgWithThreeRepeatingGroupsWhereTwoHaveDuplicateElements =
    `<soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
      <soap-env:Header/>
      <soap-env:Body>
        <thingContainingRepeatingGroups>
          <RepeatingGroup>
            <fieldOneOfRepeatingGroup>10001</fieldOneOfRepeatingGroup>
            <fieldTwoOfRepeatingGroup>10002</fieldTwoOfRepeatingGroup>
          </RepeatingGroup>
          <RepeatingGroup>
            <fieldOneOfRepeatingGroup>10003</fieldOneOfRepeatingGroup>
            <fieldTwoOfRepeatingGroup>10004</fieldTwoOfRepeatingGroup>
          </RepeatingGroup>
          <RepeatingGroup>
            <fieldOneOfRepeatingGroup>10003</fieldOneOfRepeatingGroup>
            <fieldTwoOfRepeatingGroup>10004</fieldTwoOfRepeatingGroup>           
          </RepeatingGroup>
        </thingContainingRepeatingGroups>
      </soap-env:Body>
    </soap-env:Envelope>`;

  it('should report a match where the multiple repeating group elements contains the expected element values', function () {
    var expectedMessage = [
      {
        repeatingGroupHasElements: {
          path: 'SOAP-ENV:ENVELOPE.SOAP-ENV:Body.thingContainingRepeatingGroups',
          repeater: 'RepeatingGroup',
          elements: [
            { path: 'fieldOneOfRepeatingGroup', equals: 10003 },
            { path: 'fieldTwoOfRepeatingGroup', equals: 10004 }
          ]
        }
      }
    ];

    var result = messageCheckr({
      type: 'soap',
      verbose: true,
      actualMsg: actualMsgWithThreeRepeatingGroupsWhereTwoHaveDuplicateElements,
      expectedMsg: expectedMessage
    });

    assert.equal(result.allChecksPassed, true);
    assert.deepEqual(result.checks[1], {
      description: 'Check for repeating group containing all specified elements and their corresponding values.',
      pass: true,
      target: {
        repeatingGroupHasElements: {
          path: 'SOAP-ENV:ENVELOPE.SOAP-ENV:Body.thingContainingRepeatingGroups',
          repeater: 'RepeatingGroup',
          elements: [
            { path: 'fieldOneOfRepeatingGroup', equals: 10003 },
            { path: 'fieldTwoOfRepeatingGroup', equals: 10004 }
          ]
        }
      }
    });
  });

  it('should report a mismatch where an actual repeating group element contains only 1 of two expected element values', function () {
    var expectedMessage = [
      {
        repeatingGroupHasElements: {
          path: 'SOAP-ENV:ENVELOPE.SOAP-ENV:Body.thingContainingRepeatingGroups',
          repeater: 'RepeatingGroup',
          elements: [
            { path: 'fieldOneOfRepeatingGroup', equals: 10001 },
            { path: 'fieldTwoOfRepeatingGroup', equals: 10003 }
          ]
        }
      }
    ];

    var result = messageCheckr({
      type: 'soap',
      verbose: true,
      actualMsg: actualMsgWithThreeDifferentRepeatingGroups,
      expectedMsg: expectedMessage
    });

    assert.equal(result.allChecksPassed, false);
    assert.deepEqual(result.checks[1], {
      description: 'Check for repeating group containing all specified elements and their corresponding values.',
      expected: 'No repeating groups match the expected.',
      pass: false,
      target: {
        repeatingGroupHasElements: {
          path: 'SOAP-ENV:ENVELOPE.SOAP-ENV:Body.thingContainingRepeatingGroups',
          repeater: 'RepeatingGroup',
          elements: [
            { path: 'fieldOneOfRepeatingGroup', equals: 10001 },
            { path: 'fieldTwoOfRepeatingGroup', equals: 10003 }
          ]
        }
      }
    });
  });

  it('should report a mismatch where none of the repeating groups contains any of the expected element values', function () {
    var expectedMessage = [
      {
        repeatingGroupHasElements: {
          path: 'SOAP-ENV:ENVELOPE.SOAP-ENV:Body.thingContainingRepeatingGroups',
          repeater: 'RepeatingGroup',
          elements: [
            { path: 'fieldOneOfRepeatingGroup', equals: 10001 },
            { path: 'fieldTwoOfRepeatingGroup', equals: 10003 }
          ]
        }
      }
    ];

    var result = messageCheckr({
      type: 'soap',
      verbose: true,
      actualMsg: actualMsgWithThreeDifferentRepeatingGroups,
      expectedMsg: expectedMessage
    });

    assert.equal(result.allChecksPassed, false);
    assert.deepEqual(result.checks[1], {
      description: 'Check for repeating group containing all specified elements and their corresponding values.',
      expected: 'No repeating groups match the expected.',
      pass: false,
      target: {
        repeatingGroupHasElements: {
          path: 'SOAP-ENV:ENVELOPE.SOAP-ENV:Body.thingContainingRepeatingGroups',
          repeater: 'RepeatingGroup',
          elements: [
            { path: 'fieldOneOfRepeatingGroup', equals: 10001 },
            { path: 'fieldTwoOfRepeatingGroup', equals: 10003 }
          ]
        }
      }
    });
  });

  it('should report a mismatch where the an element\'s path does not exist in any repeating group', function () {
    var expectedMessage = [
      {
        repeatingGroupHasElements: {
          path: 'SOAP-ENV:ENVELOPE.SOAP-ENV:Body.thingContainingRepeatingGroups',
          repeater: 'RepeatingGroup',
          elements: [
            { path: 'fieldOneOfRepeatingGroup1', equals: 10001 },
            { path: 'fieldTwoOfRepeatingGroup', equals: 10002 }
          ]
        }
      }
    ];

    var result = messageCheckr({
      type: 'soap',
      verbose: true,
      actualMsg: actualMsgWithThreeDifferentRepeatingGroups,
      expectedMsg: expectedMessage
    });

    assert.equal(result.allChecksPassed, false);
    assert.deepEqual(result.checks[1], {
      description: 'Check for repeating group containing all specified elements and their corresponding values.',
      expected: 'No repeating groups match the expected.',
      pass: false,
      target: {
        repeatingGroupHasElements: {
          path: 'SOAP-ENV:ENVELOPE.SOAP-ENV:Body.thingContainingRepeatingGroups',
          repeater: 'RepeatingGroup',
          elements: [
            { path: 'fieldOneOfRepeatingGroup1', equals: 10001 },
            { path: 'fieldTwoOfRepeatingGroup', equals: 10002 }
          ]
        }
      }
    });
  });
});