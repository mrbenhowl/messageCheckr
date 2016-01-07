var messageValidator = rewire('../messageCheckr.js');

describe('result variable', function () {

  var result = messageValidator.__get__("result");

  it('should have an empty checks array and the attribute allChecksPassed set to true', function () {
    assert.deepEqual(result,
      {
        allChecksPassed: true,
        checks: []
      }
    );
  });

});