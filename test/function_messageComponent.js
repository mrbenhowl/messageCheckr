var rewire = require('rewire'),
  messageComponent = rewire('../libs/messageComponent.js'),
  messageComponentType = require('../libs/messageComponentType'),
  xmldoc = require('xmldoc');


describe('messageComponent()', function () {

  describe('determinePrintablePath()', function(){

    var determinePrintablePath = messageComponent.__get__('determinePrintablePath');

    it('should remove attribute "pathShouldNotExist" from expectedMessageComponent', function(){
      assert.deepEqual(determinePrintablePath({path: "a", pathShouldNotExist: "b"}), {path: "a"});
      assert.deepEqual(determinePrintablePath({repeatingGroup: {path: "a", repeater: "b", number: "c"},  path: "d", pathShouldNotExist: "e"}), {repeatingGroup: {path: "a", repeater: "b", number: "c"},  path: "d"});
      assert.deepEqual(determinePrintablePath({parentPath: "a", element: "b", elementPosition: "c", pathShouldNotExist: "d"}), {parentPath: "a", element: "b", elementPosition: "c"});
    });

    it('should remove attribute "equals" from expectedMessageComponent', function(){
      assert.deepEqual(determinePrintablePath({path: "a", equals: "b"}), {path: "a"});
      assert.deepEqual(determinePrintablePath({repeatingGroup: {path: "a", repeater: "b", number: "c"},  path: "d", equals: "e"}), {repeatingGroup: {path: "a", repeater: "b", number: "c"},  path: "d"});
      assert.deepEqual(determinePrintablePath({parentPath: "a", element: "b", elementPosition: "c", equals: "d"}), {parentPath: "a", element: "b", elementPosition: "c"});
    });

    it('should remove attribute "contains" from expectedMessageComponent', function(){
      assert.deepEqual(determinePrintablePath({path: "a", contains: "b"}), {path: "a"});
      assert.deepEqual(determinePrintablePath({repeatingGroup: {path: "a", repeater: "b", number: "c"},  path: "d", contains: "e"}), {repeatingGroup: {path: "a", repeater: "b", number: "c"},  path: "d"});
      assert.deepEqual(determinePrintablePath({parentPath: "a", element: "b", elementPosition: "c", contains: "d"}), {parentPath: "a", element: "b", elementPosition: "c"});
    });

    it('should remove attributes "attribute" and "equals" from expectedMessageComponent', function(){
      assert.deepEqual(determinePrintablePath({path: "a", attribute: "b", equals: "c"}), {path: "a"});
      assert.deepEqual(determinePrintablePath({repeatingGroup: {path: "a", repeater: "b", number: "c"},  path: "d", attribute: "e", equals: "f"}), {repeatingGroup: {path: "a", repeater: "b", number: "c"},  path: "d"});
      assert.deepEqual(determinePrintablePath({parentPath: "a", element: "b", elementPosition: "c", attribute: "d", equals: "e"}), {parentPath: "a", element: "b", elementPosition: "c"});
    });

    it('should remove attributes "attribute" and "contains" from expectedMessageComponent', function(){
      assert.deepEqual(determinePrintablePath({path: "a", attribute: "b", contains: "c"}), {path: "a"});
      assert.deepEqual(determinePrintablePath({repeatingGroup: {path: "a", repeater: "b", number: "c"},  path: "d", attribute: "e", contains: "f"}), {repeatingGroup: {path: "a", repeater: "b", number: "c"},  path: "d"});
      assert.deepEqual(determinePrintablePath({parentPath: "a", element: "b", elementPosition: "c", attribute: "d", contains: "e"}), {parentPath: "a", element: "b", elementPosition: "c"});
    });

    it('should remove attributes "equals" and "dateFormat" from expectedMessageComponent', function(){
      assert.deepEqual(determinePrintablePath({path: "a", equals: "b", dateFormat: "c"}), {path: "a"});
      assert.deepEqual(determinePrintablePath({repeatingGroup: {path: "a", repeater: "b", number: "c"},  path: "d", equals: "e", dateFormat: "f"}), {repeatingGroup: {path: "a", repeater: "b", number: "c"},  path: "d"});
      assert.deepEqual(determinePrintablePath({parentPath: "a", element: "b", elementPosition: "c", equals: "d", dateFormat: "e"}), {parentPath: "a", element: "b", elementPosition: "c"});
    });

    it('should remove attributes "attribute", "equals" and "dateFormat" from expectedMessageComponent', function(){
      assert.deepEqual(determinePrintablePath({path: "a", attribute: "b", equals: "c", dateFormat: "d"}), {path: "a"});
      assert.deepEqual(determinePrintablePath({repeatingGroup: {path: "a", repeater: "b", number: "c"},  path: "d", attribute: "e", equals: "f", dateFormat: "g"}), {repeatingGroup: {path: "a", repeater: "b", number: "c"},  path: "d"});
      assert.deepEqual(determinePrintablePath({parentPath: "a", element: "b", elementPosition: "c", attribute: "d", equals: "e", dateFormat: "f"}), {parentPath: "a", element: "b", elementPosition: "c"});
    });
  });

  describe('validate()', function () {

    var validate = messageComponent.__get__('validate');

    it('should throw an error when the parameter "expectedMessageComponent" is null', function () {
      assert.throw(() => validate(null), 'The following expectedMessageComponent is not valid: null');
    });

    it('should throw an error when the parameter "expectedMessageComponent" is an Array', function () {
      assert.throw(() => {
        validate(['test'])
      }, 'The following expectedMessageComponent is not valid: ["test"]');
    });

    it('should throw an error when the parameter "expectedMessageComponent" is an String', function () {
      assert.throw(() => {
        validate(new String('test'))
      }, 'The following expectedMessageComponent is not valid: "test"');
    });

    it('should throw an error when the parameter "expectedMessageComponent" is an Boolean', function () {
      assert.throw(() => {
        validate(true)
      }, 'The following expectedMessageComponent is not valid: true');
    });

    it('should throw an error when the parameter "expectedMessageComponent" is an Integer', function () {
      assert.throw(() => {
        validate(1)
      }, 'The following expectedMessageComponent is not valid: 1');
    });

    it('should throw an error when the parameter "expectedMessageComponent" is an Object with no keys', function () {
      assert.throw(() => {
        validate({})
      }, 'The following expectedMessageComponent is not valid: {}');
    });

    // STANDARD

    it('should return {type: messageComponentType.STANDARD, expected: {equals: "b"}} when "expectedMessageComponent" is {path: "a", equals: "b"}', function () {
      assert.deepEqual(validate({path: "a", equals: "b"}), {type: messageComponentType.STANDARD, expected: {equals: "b"}});
    });

    it('should return {type: messageComponentType.STANDARD, expected: {equals: "b", dateFormat: "c"}} when "expectedMessageComponent" is {path: "a", equals: "b", dateFormat: "c"}', function () {
      assert.deepEqual(validate({path: "a", equals: "b", dateFormat: "c"}), {type: messageComponentType.STANDARD, expected: {equals: "b", dateFormat: "c"}});
    });

    it('should return {type: messageComponentType.STANDARD, expected: {contains: "b"}} when "expectedMessageComponent" is {path: "a", contains: "b"}', function () {
      assert.deepEqual(validate({path: "a", contains: "b"}), {type: messageComponentType.STANDARD, expected: {contains: "b"}});
    });

    it('should return {type: messageComponentType.STANDARD, expected: {attribute: "b", equals: "c"}} when "expectedMessageComponent" is {path: "a", attribute: "b", equals: "c"}', function () {
      assert.deepEqual(validate({path: "a", attribute: "b", equals: "c"}), {type: messageComponentType.STANDARD, expected: {attribute: "b", equals: "c"}});
    });

    it('should return {type: messageComponentType.STANDARD, expected: {attribute: "b", equals: "c", dateFormat: "d"}} when "expectedMessageComponent" is {path: "a", attribute: "b", equals: "c", dateFormat: "d"}', function () {
      assert.deepEqual(validate({path: "a", attribute: "b", equals: "c", dateFormat: "d"}), {type: messageComponentType.STANDARD, expected: {attribute: "b", equals: "c", dateFormat: "d"}});
    });

    it('should return {type: messageComponentType.STANDARD, expected: {attribute: "b", contains: "c"}} when "expectedMessageComponent" is {path: "a", attribute: "b", contains: "c"}', function () {
      assert.deepEqual(validate({path: "a", attribute: "b", contains: "c"}), {type: messageComponentType.STANDARD, expected: {attribute: "b", contains: "c"}});
    });

    it('should return {type: messageComponentType.STANDARD, expected: {pathShouldNotExist: "b"}} when "expectedMessageComponent" is {path: "a", pathShouldNotExist: "b"}', function () {
      assert.deepEqual(validate({path: "a", pathShouldNotExist: "b"}), {type: messageComponentType.STANDARD, expected: {pathShouldNotExist: "b"}});
    });

    // REPEATING_GROUP

    it('should return {type: messageComponentType.REPEATING_GROUP, expected: {equals: "e"}} when "expectedMessageComponent" is {repeatingGroup: {path: "a", repeater: "b", number: "c"},  path: "d", equals: "e"}', function () {
      assert.deepEqual(validate({repeatingGroup: {path: "a", repeater: "b", number: "c"}, path: "d", equals: "e"}), {type: messageComponentType.REPEATING_GROUP, expected: {equals: "e"}});
    });

    it('should return {type: messageComponentType.REPEATING_GROUP, expected: {equals: "e", dateFormat: "f"}} when "expectedMessageComponent" is {repeatingGroup: {path: "a", repeater: "b", number: "c"},  path: "d", equals: "e", dateFormat: "f"}', function () {
      assert.deepEqual(validate({repeatingGroup: {path: "a", repeater: "b", number: "c"}, path: "d", equals: "e", dateFormat: "f"}), {type: messageComponentType.REPEATING_GROUP, expected: {equals: "e", dateFormat: "f"}});
    });

    it('should return {type: messageComponentType.REPEATING_GROUP, expected: {attribute: "e", equals: "f"}} when "expectedMessageComponent" is {repeatingGroup: {path: "a", repeater: "b", number: "c"},  path: "d", attribute: "e", equals: "f"}', function () {
      assert.deepEqual(validate({repeatingGroup: {path: "a", repeater: "b", number: "c"}, path: "d", attribute: "e", equals: "f"}), {type: messageComponentType.REPEATING_GROUP, expected: {attribute: "e", equals: "f"}});
    });

    it('should return {type: messageComponentType.REPEATING_GROUP, expected: {attribute: "e", equals: "f", dateFormat: "g"}} when "expectedMessageComponent" is {repeatingGroup: {path: "a", repeater: "b", number: "c"},  path: "d", attribute: "e", equals: "f", dateFormat: "g"}', function () {
      assert.deepEqual(validate({repeatingGroup: {path: "a", repeater: "b", number: "c"}, path: "d", attribute: "e", equals: "f", dateFormat: "g"}), {type: messageComponentType.REPEATING_GROUP, expected: {attribute: "e", equals: "f", dateFormat: "g"}});
    });

    it('should return {type: messageComponentType.REPEATING_GROUP, expected: {attribute: "e", contains: "f"}} when "expectedMessageComponent" is {repeatingGroup: {path: "a", repeater: "b", number: "c"},  path: "d", attribute: "e", contains: "f"}', function () {
      assert.deepEqual(validate({repeatingGroup: {path: "a", repeater: "b", number: "c"}, path: "d", attribute: "e", contains: "f"}), {type: messageComponentType.REPEATING_GROUP, expected: {attribute: "e", contains: "f"}});
    });

    it('should return {type: messageComponentType.REPEATING_GROUP, expected: {contains: "e"}}} when "expectedMessageComponent" is {repeatingGroup: {path: "a", repeater: "b", number: "c"},  path: "d", contains: "e"}', function () {
      assert.deepEqual(validate({repeatingGroup: {path: "a", repeater: "b", number: "c"}, path: "d", contains: "e"}), {type: messageComponentType.REPEATING_GROUP, expected: {contains: "e"}});
    });

    it('should return {type: messageComponentType.REPEATING_GROUP, expected: {pathShouldNotExist: "e"}} when "expectedMessageComponent" is {repeatingGroup: {path: "a", repeater: "b", number: "c"},  path: "d", pathShouldNotExist: "e"}', function () {
      assert.deepEqual(validate({repeatingGroup: {path: "a", repeater: "b", number: "c"}, path: "d", pathShouldNotExist: "e"}), {type: messageComponentType.REPEATING_GROUP, expected: {pathShouldNotExist: "e"}});
    });

    // POSITION

    it('should return {type: messageComponentType.POSITION, expected: {equals: "d"}} when "expectedMessageComponent" is {parentPath: "a", element: "b", elementPosition: "c", equals: "d"}', function () {
      assert.deepEqual(validate({parentPath: "a", element: "b", elementPosition: 1, equals: "d"}), {type: messageComponentType.POSITION, expected: {equals: "d"}});
    });

    it('should return {type: messageComponentType.POSITION, expected: {equals: "d", dateFormat: "e"}} when "expectedMessageComponent" is {parentPath: "a", element: "b", elementPosition: "c", equals: "d", dateFormat: "e"}', function () {
      assert.deepEqual(validate({parentPath: "a", element: "b", elementPosition: 1, equals: "d", dateFormat: "e"}), {type: messageComponentType.POSITION, expected: {equals: "d", dateFormat: "e"}});
    });

    it('should return {type: messageComponentType.POSITION, expected: {contains: "d"}} when "expectedMessageComponent" is {parentPath: "a", element: "b", elementPosition: "c", contains: "d"}', function () {
      assert.deepEqual(validate({parentPath: "a", element: "b", elementPosition: 1, contains: "d"}), {type: messageComponentType.POSITION, expected: {contains: "d"}});
    });

    it('should return {type: messageComponentType.POSITION, expected: {attribute: "d", equals: "e"}} when "expectedMessageComponent" is {parentPath: "a", element: "b", elementPosition: "c", attribute: "d", equals: "e"}', function () {
      assert.deepEqual(validate({parentPath: "a", element: "b", elementPosition: 1, attribute: "d", equals: "e"}), {type: messageComponentType.POSITION, expected: {attribute: "d", equals: "e"}});
    });

    it('should return {type: messageComponentType.POSITION, expected: {attribute: "d", equals: "e", dateFormat: "f"}} when "expectedMessageComponent" is {parentPath: "a", element: "b", elementPosition: "c", attribute: "d", equals: "e", dateFormat: "f"}', function () {
      assert.deepEqual(validate({parentPath: "a", element: "b", elementPosition: 1, attribute: "d", equals: "e", dateFormat: "f"}), {type: messageComponentType.POSITION, expected: {attribute: "d", equals: "e", dateFormat: "f"}});
    });

    it('should return {type: messageComponentType.POSITION, expected: {attribute: "d", contains: "e"}} when "expectedMessageComponent" is {parentPath: "a", element: "b", elementPosition: "c", attribute: "d", contains: "e"}', function () {
      assert.deepEqual(validate({parentPath: "a", element: "b", elementPosition: 1, attribute: "d", contains: "e"}), {type: messageComponentType.POSITION, expected: {attribute: "d", contains: "e"}});
    });

    it('should return {type: messageComponentType.POSITION, expected: {attribute: "d", contains: "e"}} when "expectedMessageComponent" is {parentPath: "a", element: "b", elementPosition: "c", pathShouldNotExist: "d"}', function () {
      assert.deepEqual(validate({parentPath: "a", element: "b", elementPosition: 1, pathShouldNotExist: "d"}), {type: messageComponentType.POSITION, expected: {pathShouldNotExist: "d"}});
    });

    it('should throw an error when "elementPosition" is NAN', function () {
      assert.throw(() => {
        validate({parentPath: "a", element: "b", elementPosition: "string", attribute: "d", contains: "e"})
      }, 'elementPosition should be an integer');
    });

    it('should throw an error when "elementPosition" is 0', function () {
      assert.throw(() => {
        validate({parentPath: "a", element: "b", elementPosition: 0, attribute: "d", contains: "e"})
      }, 'elementPosition should be greater than 0');
    });

    // PATTERN NOT RECOGNISED

    it('should throw an error when "expectedMessageComponent" does not match any expected pattern', function () {
      assert.throw(() => {
        validate({notExpected: "test"})
      }, 'Expected message component does not match any expected patterns. The invalid component is {"notExpected":"test"}');
    });

    it('should throw an error when "expectedMessageComponent" has parentPath but not match any expected pattern', function () {
      assert.throw(() => {
        validate({parentPath: "test"})
      }, 'Expected message component does not match any expected patterns. The invalid component is {"parentPath":"test"}');
    });

    it('should throw an error when "expectedMessageComponent" has correct {repeatingGroup} but does not match any pattern ', function () {
      assert.throw(() => {
        validate({repeatingGroup: {path: "test", repeater: "test", number: "test"}, equals: "test"})
      }, 'Expected message component does not match any expected patterns. The invalid component is {\"repeatingGroup\":{\"path\":\"test\",\"repeater\":\"test\",\"number\":\"test\"},\"equals\":\"test\"}');
    });

    it('should throw an error when "expectedMessageComponent" has {repeatingGroup} without path attribute', function () {
      assert.throw(() => {
        validate({repeatingGroup: {repeater: "test", number: "test"}, path: "test", equals: "test"})
      }, 'Expected message component does not match any expected patterns. The invalid component is {\"repeatingGroup\":{\"repeater\":\"test\",\"number\":\"test\"},\"path\":\"test\",\"equals\":\"test\"}');
    });

    it('should throw an error when "expectedMessageComponent" has {repeatingGroup} without repeater attribute', function () {
      assert.throw(() => {
        validate({repeatingGroup: {path: "test", number: "test"}, path: "test", equals: "test"})
      }, 'Expected message component does not match any expected patterns. The invalid component is {\"repeatingGroup\":{\"path\":\"test\",\"number\":\"test\"},\"path\":\"test\",\"equals\":\"test\"}');
    });

    it('should throw an error when "expectedMessageComponent" has {repeatingGroup} without number attribute', function () {
      assert.throw(() => {
        validate({repeatingGroup: {repeater: "test", path: "test"}, path: "test", equals: "test"})
      }, 'Expected message component does not match any expected patterns. The invalid component is {\"repeatingGroup\":{\"repeater\":\"test\",\"path\":\"test\"},\"path\":\"test\",\"equals\":\"test\"}');
    });
  });

  describe('getPathToElement()', function () {

    var getPathToElement = messageComponent.__get__('getPathToElement');

    describe('type is messageComponentType.STANDARD', function () {

      it('should return an object where "path" is the root element and an "attribute" is supplied and the path/attribute exist', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>12345</testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isDefined(getPathToElement({path: "testRootElement", attribute: "xmlns", equals: "test"}, 'STANDARD', actualMessageXmlDocument));
      });

      it('should return undefined where "path" is the root element and an "attribute" is supplied and the attribute does NOT exist (other attributes exist)', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>12345</testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({path: "testRootElement", attribute: "doesNotExist", equals: "test"}, 'STANDARD', actualMessageXmlDocument));
      });

      it('should return undefined where "path" is the root element and an "attribute" is supplied and the attribute does NOT exist (no other attributes exist)', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement>
              <testElement>12345</testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({path: "testRootElement", attribute: "doesNotExist", equals: "test"}, 'STANDARD', actualMessageXmlDocument));
      });

      it('should return an object where path is not the root element and an "attribute" is supplied and the path/attribute exist', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement testAttribute="test">12345</testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isDefined(getPathToElement({path: "testElement", attribute: "testAttribute", equals: "test"}, 'STANDARD', actualMessageXmlDocument));
      });

      it('should return undefined where path is not the root element and an "attribute" is supplied and the attribute does NOT exist (other attributes exist)', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement testAttribute="test">12345</testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({path: "testElement", attribute: "doesNotExist", equals: "test"}, 'STANDARD', actualMessageXmlDocument));
      });

      it('should return undefined where path is not the root element and an "attribute" is supplied and the attribute does NOT exist (no other attributes exist)', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>12345</testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({path: "testElement", attribute: "doesNotExist", equals: "test"}, 'STANDARD', actualMessageXmlDocument));
      });

      it('should return undefined where path is not the root element and an "attribute" is supplied and the path does NOT exist', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement testAttribute="test">12345</testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({path: "doesNotExist", attribute: "testAttribute", equals: "test"}, 'STANDARD', actualMessageXmlDocument));
      });

      it('should return an object where "path" is the root element and the path exists', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isDefined(getPathToElement({path: "testRootElement", equals: "test"}, 'STANDARD', actualMessageXmlDocument));
      });

      it('should return an object where path is not the root element and the path exists', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement testAttribute="test">12345</testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isDefined(getPathToElement({path: "testElement", equals: "test"}, 'STANDARD', actualMessageXmlDocument));
      });

      it('should return undefined where path is not the root element and the path does NOT exists', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement testAttribute="test">12345</testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({path: "doesNotExist", equals: "test"}, 'STANDARD', actualMessageXmlDocument));
      });

    });

    describe('type is messageComponentType.POSITION', function () {

      it('should return an object where "parentPath" is the root element and elementPosition/element match an element (only 1 element exists under parentPath)', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement testAttribute="test">12345</testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isDefined(getPathToElement({parentPath: "testRootElement", elementPosition: 1, element: "testElement", equals: "12345"}, 'POSITION', actualMessageXmlDocument));
      });

      it('should return an object where "parentPath" is the root element and elementPosition/element/attribute match an element\'s attribute (only 1 element exists under parentPath)', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement testAttribute="test">12345</testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isDefined(getPathToElement({parentPath: "testRootElement", elementPosition: 1, element: "testElement", attribute: "testAttribute", equals: "test"}, 'POSITION', actualMessageXmlDocument));
      });

      it('should return an object where "parentPath" is the root element and elementPosition/element match an element (multiple elements exist under parentPath and elementPosition = 1)', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement testAttribute="test1">1</testElement>
              <testElement testAttribute="test2">2</testElement>
              <testElement testAttribute="test3">3</testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isDefined(getPathToElement({parentPath: "testRootElement", elementPosition: 1, element: "testElement", equals: "1"}, 'POSITION', actualMessageXmlDocument));
      });

      it('should return an object where "parentPath" is the root element and elementPosition/element match an element (multiple elements exist under parentPath and elementPosition = position of last element)', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement testAttribute="test1">1</testElement>
              <testElement testAttribute="test2">2</testElement>
              <testElement testAttribute="test3">3</testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isDefined(getPathToElement({parentPath: "testRootElement", elementPosition: 3, element: "testElement", equals: "3"}, 'POSITION', actualMessageXmlDocument));
      });

      it('should return undefined where "parentPath" is the root element and elementPosition does not match an element', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement testAttribute="test">12345</testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({parentPath: "testRootElement", elementPosition: 2, element: "testElement", equals: "12345"}, 'POSITION', actualMessageXmlDocument));
      });

      it('should return undefined where "parentPath" is the root element and element does not match the element at the position specified by elementPosition', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement testAttribute="test">12345</testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({parentPath: "testRootElement", elementPosition: 1, element: "testElement1", equals: "12345"}, 'POSITION', actualMessageXmlDocument));
      });

      it('should return undefined where "parentPath" is the root element and no attributes exist for the element matched by elementPosition/element and an attribute is expected', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>12345</testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({parentPath: "testRootElement", elementPosition: 1, element: "testElement", attribute: "testAttribute", equals: "12345"}, 'POSITION', actualMessageXmlDocument));
      });

      it('should return undefined where "parentPath" is the root element and the expected attribute does not exist for the element matched by elementPosition/element', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement estAttribute="hello">12345</testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({parentPath: "testRootElement", elementPosition: 1, element: "testElement", attribute: "testAttribute", equals: "hello"}, 'POSITION', actualMessageXmlDocument));
      });

      it('should return an object where parentpath is not the root element and elementPosition/element match an element (only 1 element exists under parentPath)', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement>test</subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isDefined(getPathToElement({parentPath: "testElement", elementPosition: 1, element: "subTestElement", equals: "test"}, 'POSITION', actualMessageXmlDocument));
      });

      it('should return an object where parentpath is not the root element and elementPosition/element/attribute match an element\'s attribute (only 1 element exists under parentPath)', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement testAttribute="12345">test</subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isDefined(getPathToElement({parentPath: "testElement", elementPosition: 1, element: "subTestElement", attribute: "testAttribute", equals: "test"}, 'POSITION', actualMessageXmlDocument));
      });

      it('should return an object where parentpath is not the root element and elementPosition/element match an element (multiple elements exist under parentPath and elementPosition = 1)', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement1 testAttribute1="12345">test</subTestElement1>
                <subTestElement2 testAttribute2="67890">it</subTestElement2>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isDefined(getPathToElement({parentPath: "testElement", elementPosition: 1, element: "subTestElement1", attribute: "testAttribute1", equals: "test"}, 'POSITION', actualMessageXmlDocument));
      });

      it('should return an object where parentpath is not the root element and elementPosition/element match an element (multiple elements exist under parentPath and elementPosition = position of last element)', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement1 testAttribute1="12345">test</subTestElement1>
                <subTestElement2 testAttribute2="67890">it</subTestElement2>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isDefined(getPathToElement({parentPath: "testElement", elementPosition: 2, element: "subTestElement2", attribute: "testAttribute2", equals: "test"}, 'POSITION', actualMessageXmlDocument));
      });

      it('should return undefined where parentpath is not the root element and elementPosition does not match an element', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement1 testAttribute1="12345">test</subTestElement1>
                <subTestElement2 testAttribute2="67890">it</subTestElement2>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({parentPath: "testElement", elementPosition: 3, element: "subTestElement2", equals: "test"}, 'POSITION', actualMessageXmlDocument));
      });

      it('should return undefined where parentpath is not the root element and element does not match the element at the position specified by elementPosition', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement testAttribute="12345">test</subTestElement>
                <subTestElement testAttribute="12345">test</subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({parentPath: "testElement", elementPosition: 1, element: "subTestElement1", equals: "test"}, 'POSITION', actualMessageXmlDocument));
      });

      it('should return undefined where parentpath is not the root element and no attributes exist for the element matched by elementPosition/element and an attribute is expected', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement>test</subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({parentPath: "testElement", elementPosition: 1, element: "subTestElement", attribute: "testAttribute", equals: "test"}, 'POSITION', actualMessageXmlDocument));
      });

      it('should return undefined where parentpath is not the root element and the expected attribute does not exist for the element matched by elementPosition/element', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement testAttribute1="test">test</subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({parentPath: "testElement", elementPosition: 1, element: "subTestElement", attribute: "testAttribute", equals: "test"}, 'POSITION', actualMessageXmlDocument));
      });
    });

    describe('type is messageComponentType.REPEATING_GROUP', function () {

      it('should return undefined where "path" is the root element and the repeater element does not exist', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement>test</subTestElement>
              </testElement>
              <testElement>
                <subTestElement>test</subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({repeatingGroup: {path: 'testRootElement', repeater: 'testElement1', number: 1}, path: 'subTestElement', equals: 'test'}, 'REPEATING_GROUP', actualMessageXmlDocument));
      });

      it('should return undefined where "path" is the root element and the repeater\'s occurrence does not exist', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement>test</subTestElement>
              </testElement>
              <notTestElement>
                <subTestElement>test</subTestElement>
              </notTestElement>
              <testElement>
                <subTestElement>test</subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({repeatingGroup: {path: 'testRootElement', repeater: 'testElement', number: 3}, path: 'subTestElement', equals: 'test'}, 'REPEATING_GROUP', actualMessageXmlDocument));
      });

      it('should return undefined where "path" is the root element and the outer path does not exist', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement>test</subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({repeatingGroup: {path: 'testRootElement', repeater: 'testElement', number: 1}, path: 'notSubTestElement', equals: 'test'}, 'REPEATING_GROUP', actualMessageXmlDocument));
      });

      it('should return undefined where "path" is the root element and the attribute does not exist and there are no attributes', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement>test</subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({repeatingGroup: {path: 'testRootElement', repeater: 'testElement', number: 1}, path: 'subTestElement', attribute: 'doesNotExist', equals: 'test'}, 'REPEATING_GROUP', actualMessageXmlDocument));
      });

      it('should return undefined where "path" is the root element and the attribute does not exist and there are other attributes', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement notLookingForThisAttribute="test">test</subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({repeatingGroup: {path: 'testRootElement', repeater: 'testElement', number: 1}, path: 'subTestElement', attribute: 'doesNotExist', equals: 'test'}, 'REPEATING_GROUP', actualMessageXmlDocument));
      });

      it('should return an object where "path" is the root element and there is only 1 occurrence of the repeating element pattern', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <notTestElement>
                <subTestElement>test</subTestElement>
              </notTestElement>
              <testElement>
                <subTestElement>test</subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isDefined(getPathToElement({repeatingGroup: {path: 'testRootElement', repeater: 'testElement', number: 1}, path: 'subTestElement', equals: 'test'}, 'REPEATING_GROUP', actualMessageXmlDocument));
      });

      it('should return an object where "path" is the root element and there are multiple occurrences of the repeating element pattern and occurrence points to the last repeating pattern', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement>test</subTestElement>
              </testElement>
              <notTestElement>
                <subTestElement>test</subTestElement>
              </notTestElement>
              <testElement>
                <subTestElement>test</subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isDefined(getPathToElement({repeatingGroup: {path: 'testRootElement', repeater: 'testElement', number: 2}, path: 'subTestElement', equals: 'test'}, 'REPEATING_GROUP', actualMessageXmlDocument));
      });

      it('should return an object where "path" is the root element and the attribute exists at the repeating pattern position specified', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                  <subTestElement testAttribute1="test">test</subTestElement>
              </testElement>
              <testElement>
                  <subTestElement testAttribute2="test">test</subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isDefined(getPathToElement({repeatingGroup: {path: 'testRootElement', repeater: 'testElement', number: 1}, path: 'subTestElement', attribute: 'testAttribute1', equals: 'test'}, 'REPEATING_GROUP', actualMessageXmlDocument));
      });

      it('should return undefined where "path" is not the root element and the inner path does not exist', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement>
                  <subSubTestElement>test</subSubTestElement>
                </subTestElement>
                <subTestElement>
                  <subSubTestElement>test</subSubTestElement>
                </subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({repeatingGroup: {path: 'notTestElement', repeater: 'subTestElement', number: 1}, path: 'subSubTestElement', equals: 'test'}, 'REPEATING_GROUP', actualMessageXmlDocument));
      });

      it('should return undefined where "path" is not the root element and the repeater element does not exist', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement>
                  <subSubTestElement>test</subSubTestElement>
                </subTestElement>
                <subTestElement>
                  <subSubTestElement>test</subSubTestElement>
                </subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({repeatingGroup: {path: 'testElement', repeater: 'notSubTestElement', number: 1}, path: 'subSubTestElement', equals: 'test'}, 'REPEATING_GROUP', actualMessageXmlDocument));
      });

      it('should return undefined where "path" is not the root element and the repeater\'s occurrence does not exist', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement>
                  <subSubTestElement>test</subSubTestElement>
                </subTestElement>
                <subTestElement>
                  <subSubTestElement>test</subSubTestElement>
                </subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({repeatingGroup: {path: 'testElement', repeater: 'subTestElement', number: 3}, path: 'subSubTestElement', equals: 'test'}, 'REPEATING_GROUP', actualMessageXmlDocument));
      });

      it('should return undefined where "path" is not the root element and the outer path does not exist', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement>
                  <subSubTestElement>test</subSubTestElement>
                </subTestElement>
                <subTestElement>
                  <subSubTestElement>test</subSubTestElement>
                </subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({repeatingGroup: {path: 'testElement', repeater: 'subTestElement', number: 1}, path: 'notSubSubTestElement', equals: 'test'}, 'REPEATING_GROUP', actualMessageXmlDocument));
      });

      it('should return undefined where "path" is not the root element and the attribute does not exist and there are no attributes', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement>
                  <subSubTestElement>test</subSubTestElement>
                </subTestElement>
                <subTestElement>
                  <subSubTestElement>test</subSubTestElement>
                </subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({repeatingGroup: {path: 'testElement', repeater: 'subTestElement', number: 1}, path: 'subSubTestElement', attribute: 'doesNotExist', equals: 'test'}, 'REPEATING_GROUP', actualMessageXmlDocument));
      });

      it('should return undefined where "path" is not the root element and the attribute does not exist and there are other attributes', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement>
                  <subSubTestElement notLookingForThisAttribute="test">test</subSubTestElement>
                </subTestElement>
                <subTestElement>
                  <subSubTestElement>test</subSubTestElement>
                </subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isUndefined(getPathToElement({repeatingGroup: {path: 'testElement', repeater: 'subTestElement', number: 1}, path: 'subSubTestElement', attribute: 'doesNotExist', equals: 'test'}, 'REPEATING_GROUP', actualMessageXmlDocument));
      });

      it('should return an object where "path" is not the root element and there is only 1 occurrence of the repeating element pattern', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement>
                  <subSubTestElement>test</subSubTestElement>
                </subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isDefined(getPathToElement({repeatingGroup: {path: 'testElement', repeater: 'subTestElement', number: 1}, path: 'subSubTestElement', equals: 'test'}, 'REPEATING_GROUP', actualMessageXmlDocument));
      });

      it('should return an object where "path" is not the root element and there are multiple occurrences of the repeating element pattern and occurrence points to the last repeating pattern', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement>
                  <subSubTestElement>test</subSubTestElement>
                </subTestElement>
                <subTestElement>
                  <subSubTestElement>test</subSubTestElement>
                </subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isDefined(getPathToElement({repeatingGroup: {path: 'testElement', repeater: 'subTestElement', number: 2}, path: 'subSubTestElement', equals: 'test'}, 'REPEATING_GROUP', actualMessageXmlDocument));
      });

      it('should return an object where "path" is not the root element and the attribute exists at the repeating pattern position specified', function () {
        var xml =
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>
                <subTestElement>
                  <subSubTestElement testAttribute1="test">test</subSubTestElement>
                </subTestElement>
                <subTestElement>
                  <subSubTestElement testAttribute2="test">test</subSubTestElement>
                </subTestElement>
              </testElement>
            </testRootElement>`;
        var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
        assert.isDefined(getPathToElement({repeatingGroup: {path: 'testElement', repeater: 'subTestElement', number: 1}, path: 'subSubTestElement', attribute: 'testAttribute1', equals: 'test'}, 'REPEATING_GROUP', actualMessageXmlDocument));
      });
    });
    
    describe('type is not expected messageComponentType', function () {
      var xml =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
            <testRootElement xmlns="http://www.testing.com/integration/event">
              <testElement>12345</testElement>
            </testRootElement>`;
      var actualMessageXmlDocument = new xmldoc.XmlDocument(xml);
      assert.throw(() => getPathToElement({path: "testRootElement", attribute: "xmlns", equals: "test"}, 'UNEXPECTED', actualMessageXmlDocument), 'Unexpected messageComponentType');
    });
  });
});


