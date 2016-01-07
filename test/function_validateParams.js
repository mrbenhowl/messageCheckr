var validateParams = require('../libs/validateParams.js');

describe('validateParams()', function() {

  it('should throw an error where params does not have property "type"', function() {
    assert.throws(function() {
        validateParams({
          actualMsg: 'test',
          expectedMsg: 'test',
          expectedRootElement: 'test'
        })
      }, Error, 'messageCheckr requires the property "type" as part of the "params" argument'
    );
  });

  it('should throw an error where params does not have property "actualMsg"', function() {
    assert.throws(function() {
        validateParams({
          type: 'jms',
          expectedMsg: 'test',
          expectedRootElement: 'test'
        })
      }, Error, 'messageCheckr requires the property "actualMsg" as part of the "params" argument'
    );
  });

  it('should throw an error where params does not have property "expectedMsg"', function() {
    assert.throws(function() {
        validateParams({
          type: 'jms',
          actualMsg: 'test',
          expectedRootElement: 'test'
        })
      }, Error, 'messageCheckr requires the property "expectedMsg" as part of the "params" argument'
    );
  });

  it('should throw an error where params does not have property "expectedRootElement" and type === "jms"', function() {
    assert.throws(function() {
        validateParams({
          type: 'jms',
          actualMsg: 'test',
          expectedMsg: 'test'
        })
      }, Error, 'messageCheckr requires the property "expectedRootElement" as part of the "params" argument'
    );
  });

  it('should not throw an error where params does not have property "expectedRootElement" and type === "soap"', function() {
    assert.doesNotThrow(function() {
        validateParams({
          type: 'soap',
          actualMsg: 'test',
          expectedMsg: 'test'
        })
      }, Error, 'messageCheckr requires the property "expectedRootElement" as part of the "params" argument'
    );
  });

  it('should not throw an error where params has all expected properties provided', function() {
    assert.doesNotThrow(function() {
        validateParams({
          type: 'jms',
          actualMsg: 'test',
          expectedMsg: 'test',
          expectedRootElement: 'test'
        })
      }, Error);
  });

  it('should be called by messageCheckr', function() {
    // tried to do this with sinon.spy(validateParams) but could not get it to work

    var actualMsg = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
      <checkJustTheValue>hello</checkJustTheValue>
    </testRootElement>`;

    assert.throws(function() {
        messageCheckr({
          type: 'jms',
          actualMsg: actualMsg,
          expectedRootElement: 'test'
        })
      }, Error, 'messageCheckr requires the property "expectedMsg" as part of the "params" argument'
    );
  });
});