var moment = require('moment');

describe('readme tests', function () {

  describe('jms example', function () {
    var actualMsg =
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
       <testRootElement xmlns="http://www.testing.com/integration/event">
          <elementOne>hello</elementOne>
          <anotherElement>
            <elementTwo>123</elementTwo>
          </anotherElement>
       </testRootElement>`;

    it('should work', function () {
      var expectedMessage = [
        {path: 'testRootElement', attribute: 'xmlns', equals: 'http://www.testing.com/integration/event'},
        {path: 'elementOne', equals: 'hello'},
        {path: 'anotherElement.elementTwo', equals: '{integer}'},
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMsg,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);
    });
  });

  describe('soap example', function () {
    var actualMsg = `
    <soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
      <soap-env:Header/>
      <soap-env:Body>
        <m:elementOne>hello</m:elementOne>
      </soap-env:Body>
    </soap-env:Envelope>`;

    it('should work', function () {
      var expectedMessage = [
        {path: 'SOAP-ENV:Envelope', attribute: 'xmlns:SOAP-ENV', equals: 'http://schemas.xmlsoap.org/soap/envelope/'},
        {path: 'SOAP-ENV:Body.elementOne', equals: 'hello'}
      ];

      var result = messageCheckr({
        type: 'soap',
        actualMsg: actualMsg,
        expectedMsg: expectedMessage
      });

      assert.equal(result.allChecksPassed, true);
    });
  });

  describe('expectedMessage Types', function () {

    it("{path: 'path.to.element', equals: operator - see section Operators')", function () {

      var actualMessage =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <testRootElement xmlns="http://www.testing.com/integration/event">
          <elementOne>hello</elementOne>
        </testRootElement>`;

      var expectedMessage = [
        {path: 'elementOne', equals: 'hello'}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMessage,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);

      var expectedMessage = [
        {path: 'elementOne', equals: /^hel/}
      ];

      result = messageCheckr({
        type: 'jms',
        actualMsg: actualMessage,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);
    });

    it("{path: 'path.to.element', contains: 'string' or integer}", function () {
      var actualMessage =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <testRootElement xmlns="http://www.testing.com/integration/event">
            <elementOne>h3llo mr howl</elementOne>
          </testRootElement>`;

      var expectedMessage = [
        {path: 'elementOne', contains: 'howl'}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMessage,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);

      var expectedMessage = [
        {path: 'elementOne', contains: 3}
      ];

      result = messageCheckr({
        type: 'jms',
        actualMsg: actualMessage,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);
    });

    it("{path: 'path.to.element', attribute: 'attribute name', contains: 'string' or integer}", function () {

      var actualMessage =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <testRootElement xmlns="http://www.testing.com/integration/event">
            <elementOne attribute1="brilliant name for an attribute" attribute2="123456">hello</elementOne>
          </testRootElement>`;

      var expectedMessage = [
        {path: 'elementOne', attribute: 'attribute1', contains: 'brilliant'}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMessage,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);

      var expectedMessage = [
        {path: 'elementOne', attribute: 'attribute2', contains: 345}
      ];

      result = messageCheckr({
        type: 'jms',
        actualMsg: actualMessage,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);
    });

    it("{path: 'path.to.element', attribute: 'attribute name', equals: operator - see section Operators}", function () {
      var actualMessage =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <testRootElement xmlns="http://www.testing.com/integration/event">
          <elementOne attribute1="123456">hello</elementOne>
        </testRootElement>`;

      var expectedMessage = [
        {path: 'elementOne', attribute: 'attribute1', equals: '{integer}'}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMessage,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);

      expectedMessage = [
        {path: 'elementOne', attribute: 'attribute1', equals: 123456}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMessage,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);

      expectedMessage = [
        {path: 'elementOne', attribute: 'attribute1', equals: '123456'}
      ];

      result = messageCheckr({
        type: 'jms',
        actualMsg: actualMessage,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);
    });

    it("{path: 'path.to.element', pathShouldNotExist: true}", function () {

      var actualMessage =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
         <testRootElement xmlns="http://www.testing.com/integration/event">
         <elementOne attribute1="brilliant name for an attribute" attribute2="123456">hello</elementOne>
         </testRootElement>`;

      var expectedMessage = [
        {path: 'elementTwo', pathShouldNotExist: true}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMessage,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);
    });

    it("{path: 'path.to.element', equals: /regex containing utc-timezone or local-timezone/, dateFormat: 'see section Date Format'}", function () {

      var localDate = moment().format('YYYY-MM-DD');
      var actualMessage =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <testRootElement xmlns="http://www.testing.com/integration/event">
        <elementOne>` + localDate + `T18:39:00.896+11:00</elementOne>
        </testRootElement>`;

      var expectedMessage = [
        {path: 'elementOne', equals: /local-timezoneT\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d/, dateFormat: 'YYYY-MM-DD'}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMessage,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);

      var utcDate = moment().utc().format('MMMM YYYY');

      var actualMessage =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
          <testRootElement xmlns="http://www.testing.com/integration/event">
          <elementOne>T18:39:00.896+11:00 ` + utcDate + `</elementOne>
          </testRootElement>`;

      expectedMessage = [
        {path: 'elementOne', equals: /T\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d utc-timezone/, dateFormat: 'MMMM YYYY'}
      ];

      result = messageCheckr({
        type: 'jms',
        actualMsg: actualMessage,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);
    });

    it("{path: 'path.to.element', attribute: 'attribute name', equals: /regex containing utc-timezone or local-timezone/, dateFormat: 'see section Date Format'}", function () {

      var localDate = moment().format('YYYY-MM-DD');
      var actualMessage =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <testRootElement xmlns="http://www.testing.com/integration/event">
          <elementOne attributeContainingDateTimestamp="` + localDate + `T18:39:00.896+11:00">hello</elementOne>
        </testRootElement>`;

      var expectedMessage = [
        {path: 'elementOne', attribute: 'attributeContainingDateTimestamp', equals: /local-timezoneT\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d/, dateFormat: 'YYYY-MM-DD'}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMessage,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);

      var utcDate = moment().format('MMMM YYYY');
      actualMessage =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <testRootElement xmlns="http://www.testing.com/integration/event">
          <elementOne attributeContainingDateTimestamp="T18:39:00.896+11:00 ` + utcDate + `">hello</elementOne>
        </testRootElement>`;

      expectedMessage = [
        {path: 'elementOne', attribute: 'attributeContainingDateTimestamp', equals: /T\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d utc-timezone/, dateFormat: 'MMMM YYYY'}
      ];

      result = messageCheckr({
        type: 'jms',
        actualMsg: actualMessage,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);
    });

    it("{repeatingGroup: {path: 'path to element containing repeating group', repeater: 'repeating group name', number: integer - occurrence}, path: 'element name', equals: operator - see section Operators}", function () {

      var actualMessage =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
           <testRootElement xmlns="http://www.testing.com/integration/event">
            <elementOne>
              <thingContainingRepeatingGroups>
                <RepeatingGroup>
                  <fieldOneOfRepeatingGroup>10001</fieldOneOfRepeatingGroup>
                  <fieldTwoOfRepeatingGroup>hello</fieldTwoOfRepeatingGroup>
                </RepeatingGroup>
                <RepeatingGroup>
                  <fieldOneOfRepeatingGroup>10002</fieldOneOfRepeatingGroup>
                  <fieldTwoOfRepeatingGroup>goodbye</fieldTwoOfRepeatingGroup>
                </RepeatingGroup>
              </thingContainingRepeatingGroups>
            </elementOne>
          </testRootElement>`;

      var expectedMessage = [
        {repeatingGroup: {path: 'elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldOneOfRepeatingGroup', equals: 10001},
        {repeatingGroup: {path: 'elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldTwoOfRepeatingGroup', equals: 'hello'},
        {repeatingGroup: {path: 'elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldOneOfRepeatingGroup', equals: '{integer}'},
        {repeatingGroup: {path: 'elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldTwoOfRepeatingGroup', equals: '{alpha}'}
      ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMessage,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);
    });

    it("{repeatingGroup: {path: 'path to element containing repeating group', repeater: 'repeating group name', number: integer - occurrence}, path: 'element name', contains: 'string' or integer}", function(){
      var actualMessage = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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

        var expectedMessage = [
          {repeatingGroup: {path: 'elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldOneOfRepeatingGroup', contains: 100},
          {repeatingGroup: {path: 'elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldOneOfRepeatingGroup', contains: 'howl'},
        ];

      var result = messageCheckr({
        type: 'jms',
        actualMsg: actualMessage,
        expectedMsg: expectedMessage,
        expectedRootElement: 'testRootElement'
      });

      assert.equal(result.allChecksPassed, true);
    });
  });
});

