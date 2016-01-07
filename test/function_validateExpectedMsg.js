var validateExpectedMsg = require('../libs/validateExpectedMsg.js');

describe('validateExpectedMsg()', function() {

  it('should throw an error when expectedMsg is not an array', function(){
    var expectedIsANumber = 1;
    assert.throws(function() {
      validateExpectedMsg(expectedIsANumber)
    }, Error, 'expectedMsg should be an array');

    var expectedIsAString= 'string';
    assert.throws(function() {
      validateExpectedMsg(expectedIsAString)
    }, Error, 'expectedMsg should be an array');

    var expectedIsAnObject = {key:'value'};
    assert.throws(function() {
      validateExpectedMsg(expectedIsAnObject)
    }, Error, 'expectedMsg should be an array');
  });

  it('should throw an error when expectedMsg is an empty array', function(){
    var expectedIsANumber = [];
    assert.throws(function() {
      validateExpectedMsg(expectedIsANumber)
    }, Error, 'expectedMsg is empty');
  });

  it('should not throw an error when expected message component is valid', function() {
    var expectedMsgWithValidComponents = [
      {path: 'testPath', attribute: 'testAttribute', equals: 'testValue'},
      {path: 'testPath', equals: 'testValue'},
      {repeatingGroup: {path: 'testPath', repeater: 'testRepeater', number: 1}, path: 'testPath', equals: 'testValue'},
      {path: 'testPath', pathShouldNotExist: true}
    ];

    assert.doesNotThrow(function() {
      validateExpectedMsg(expectedMsgWithValidComponents)
    }, Error);
  });

  it('should throw an error when expected message component is not one of the expected patterns', function() {
    var expectedMsgContainingComponentWithMissingPropertyAtTopLevel = [
      {path: 'testPath', attribute: 'testAttribute'}
    ];
    assert.throws(function() {
      validateExpectedMsg(expectedMsgContainingComponentWithMissingPropertyAtTopLevel)
    }, Error, '1 expected message component does not match any of the expected patterns. The invalid component is: [{"path":"testPath","attribute":"testAttribute"}]');

    var expectedMsgContainingComponentWithAdditionalPropertyAtTopLevel = [
      {path: 'testPath', attribute: 'testAttribute', additionalAttribute: 'test'}
    ];
    assert.throws(function() {
      validateExpectedMsg(expectedMsgContainingComponentWithAdditionalPropertyAtTopLevel)
    }, Error, '1 expected message component does not match any of the expected patterns. The invalid component is: [{"path":"testPath","attribute":"testAttribute","additionalAttribute":"test"}]');

    var expectedMsgContainingComponentWithMissingPropertyAtNestedLevel = [
      {repeatingGroup: {path: 'testPath', repeater: 'testRepeater'}, path: 'testPath', equals: 'testValue'}
    ];
    assert.throws(function() {
      validateExpectedMsg(expectedMsgContainingComponentWithMissingPropertyAtNestedLevel)
    }, Error, '1 expected message component does not match any of the expected patterns. The invalid component is: [{"repeatingGroup":{"path":"testPath","repeater":"testRepeater"},"path":"testPath","equals":"testValue"}]');

    var expectedMsgContainingComponentWithAdditionalPropertyAtNestedLevel = [
      {repeatingGroup: {path: 'testPath', repeater: 'testRepeater', number: 1, additionalProperty: 'test'}, path: 'testPath', equals: 'testValue'}
    ];
    assert.throws(function() {
      validateExpectedMsg(expectedMsgContainingComponentWithAdditionalPropertyAtNestedLevel)
    }, Error, '1 expected message component does not match any of the expected patterns. The invalid component is: [{"repeatingGroup":{"path":"testPath","repeater":"testRepeater","number":1,"additionalProperty":"test"},"path":"testPath","equals":"testValue"}]');

  });

  it('should throw an error when multiple expected message components do not match any of the expected patterns', function() {
    var expectedMsgContainingMultipleComponentThatFailValidation = [
      {path: 'testPath', attribute: 'testAttribute'},
      {repeatingGroup: {path: 'testPath', repeater: 'testRepeater', number: 1, additionalProperty: 'test'}, path: 'testPath', equals: 'testValue'},
      {path: 'testPath', equals: 'testValue'}
    ];
    assert.throws(function() {
      validateExpectedMsg(expectedMsgContainingMultipleComponentThatFailValidation)
    }, Error, '2 expected message components do not match any of the expected patterns. Invalid components are: [{"path":"testPath","attribute":"testAttribute"},{"repeatingGroup":{"path":"testPath","repeater":"testRepeater","number":1,"additionalProperty":"test"},"path":"testPath","equals":"testValue"}]');
  });

  it('should be called by messageCheckr', function() {
    // tried to do this with sinon.spy(validateExpectedMsg) but could not get it to work

    var expectedMessage = [
      {path: 'testPath', incorrectPropertyName: 'testValue'}
    ];

    var actualMsg = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
      <checkJustTheValue>hello</checkJustTheValue>
    </testRootElement>`;

    assert.throws(function() {
        messageCheckr({
          type: 'jms',
          expectedMsg: expectedMessage,
          actualMsg: actualMsg,
          expectedRootElement: 'test'
        })
      }, Error, '1 expected message component does not match any of the expected patterns. The invalid component is: [{"path":"testPath","incorrectPropertyName":"testValue"}]'
    );
  });
});