var messageValidator = rewire('../messageCheckr.js');

describe('compareAndRecord()', function(){

  it('should add a record to results.checks[] with actual, expected and passedCheck attributes where no description param is passed', function(){
    var result = messageValidator.__get__("result");
    var compareAndRecord = messageValidator.__get__("compareAndRecord");

    compareAndRecord('actual value', 'expected value');
    assert.equal(result.checks.length, 1);
    assert.deepEqual(Object.keys(result.checks[0]), ["passedCheck", "actual", "expected"]);
  });

});