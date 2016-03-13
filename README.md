messageCheckr [![Build Status](https://travis-ci.org/mrbenhowl/messageCheckr.svg)](https://travis-ci.org/mrbenhowl/messageCheckr)
=============

messageChecker allows the checking of SOAP and Java Message Service (JMS) xml messages at a path level using Node.js

Contents
--------
* [Compatibility](#compatibility)
* [Getting Started](#getting-started)
* [Usage](#usage)
  * [JMS messages](#jms-messages)
  * [SOAP messages](#soap-messages)
* [expectedMessage types](#expectedmessage-types)
* [Operators](#operators)
* [Date Format (dateFormat)](#date-format-dateformat)
* [For Contributors](#for-contributors)
* [TODO](#todo)

Compatibility
------------

Works with Node.js v0.12.* and higher

Getting Started
---------------

`npm install messagecheckr` to install from the [NPM registry](https://www.npmjs.com/package/messagecheckr).

Usage
-----

`var messageCheckr = require('messagecheckr');`

###JMS messages
Let's say we have the following JMS message

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
     <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne>hello</elementOne>
       <anotherElement>
        <elementTwo>123</elementTwo>
       </anotherElement>
    </testRootElement>

and we want to check the following:

* `<testRootElement>` has the attribute `xmlns` with the value `http://www.testing.com/integration/event`
* `<elementOne>` has the value `hello`
* `<elementTwo>` has an integer as a value

First create the expected message as follows:

    var expectedMessage = [
        {path: 'testRootElement.testRootElement', attribute: 'xmlns', equals: 'http://www.testing.com/integration/event'},
        {path: 'testRootElement.elementOne', equals: 'hello'},
        {path: 'testRootElement.anotherElement.elementTwo', equals: '{integer}'},
    ];

To check the above message we need to make a call to messageCheckr as follows:

    var result = messageCheckr({
      type: 'jms',
      actualMsg: actualMessage,
      expectedMsg: expectedMessage,
      expectedRootElement: 'testRootElement'
    });
    // actualMessage is a string of the message you want to check.

messageCheckr returns an object with the attribute `allChecksPassed` which will be true if all checks (those in `expectedMessage`) have passed otherwise false, thus allowing you to do an assertion like the following:

    assert.equal(result.allChecksPassed, true);
    // this is using chai.js, any assertion library can be used.

The object returned by messageCheckr also has an attribute called `checks`. In the case above the `checks` object will be empty because there are no failing checks. By default only failing checks are present. If you wish to see all checks provide the parameter `verbose` to messageCheckr(). If `verbose` was supplied (and set to true) checks would contain the following:

    [
        {
            "pass":true,
            "target":"testRootElement",
            "actual":"testRootElement",
            "expected":"testRootElement",
            "description":"Check actual root element testRootElement is equal to expected root element testRootElement"
        },
        {
            "pass":true,
            "target":{"path":"testRootElement","attribute":"xmlns"},
            "actual":"http://www.testing.com/integration/event",
            "expected":"http://www.testing.com/integration/event",
            "description":"Check actual value http://www.testing.com/integration/event is equal to http://www.testing.com/integration/event"},
        {
            "pass":true,
            "target":{"path":"testRootElement.elementOne"},
            "actual":"hello",
            "expected":"hello",
            "description":"Check actual value hello is equal to hello"},
        {
            "pass":true,
            "target":{"path":"testRootElement.anotherElement.elementTwo"},
            "actual":"123",
            "expected":"{integer}",
            "description":"Check actual value 123 is an integer"
        }
    ]

In projects where I use messageCheckr I assert its result as follows, which will print out failing checks if there are any.

    assert.equal(result.allChecksPassed, true, JSON.stringify(result));


###SOAP messages

To check a SOAP message make a call to messageCheckr as follows:

    var result = messageCheckr({
      type: 'soap',
      actualMsg: actualMessage,
      expectedMsg: expectedMessage
    });

In the case of SOAP messages you don't need to specify the `expectedRootElement`, this is because it will automatically check the root element is `SOAP-ENV:Envelope`.

When creating an `expectedMessage` for checking a SOAP message you need to specify the path using uppercase SOAP-ENV regardless of whether the actual message is using soap-env or soapenv - both of these get converted to SOAP-ENV. When creating messageCheckr for a Java project I noticed when the app was deployed to Apache Tomcat the character case of SOAP-ENV was the opposite to what it was when deployed to IBM WebSphere. As the retrieval of a path is case sensitive there was a need to convert all references to SOAP-ENV to one character case.

Example SOAP message

    <soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
      <soap-env:Header/>
      <soap-env:Body>
        <m:elementOne>hello</m:elementOne>
      </soap-env:Body>
    </soap-env:Envelope>`


Let's say we want to check the following for the above SOAP message:

* \<soap-env:Envelope\> has the attribute `xmlns:soap-env` with the value `http://schemas.xmlsoap.org/soap/envelope/`
* \<m:elementOne\> has the value `hello`

Create the expected message as follows:

    var expectedMessage = [
        {path: 'SOAP-ENV:Envelope', attribute: 'xmlns:SOAP-ENV', equals: 'http://schemas.xmlsoap.org/soap/envelope/'},
        {path: 'SOAP-ENV:Envelope.SOAP-ENV:Body.elementOne', equals: 'hello'}
    ];

Then make a call to messageCheckr. Notice in the case of specifying the path for elementOne we have excluded the 'm' namespace, messageCheckr removes all non-SOAP namespaces. The decision for this again was related to differences I noticed when testing messageCheckr on different environments.

expectedMessage types
---------------------

The following is a list of all possible types that you can use to construct an `expectedMessage`

### Element by name
- **{path: 'path.to.element', OPTIONS}**
where **OPTIONS** can be one of the following:

    - equals: operator - see section Operators
    - equals: /regex containing utc-timezone or local-timezone/, dateFormat: 'see section Date Format'
    - contains: 'string' or integer
    - attribute: 'attribute name', equals: operator - see section Operators
    - attribute: 'attribute name', equals: /regex containing utc-timezone or local-timezone/, dateFormat: 'see section Date Format'
    - attribute: 'attribute name', contains: 'string' or integer
    - pathShouldNotExist: true

### Element by position
- **{parentPath: 'path to parent of child element', element: 'name of element', elementPosition: integer > 0, OPTIONS}**
where **OPTIONS** can be one of the following:

    - equals: operator - see section Operators
    - equals: /regex containing utc-timezone or local-timezone/, dateFormat: 'see section Date Format'
    - contains: 'string' or integer
    - attribute: 'attribute name', equals: operator - see section Operators
    - attribute: 'attribute name', equals: /regex containing utc-timezone or local-timezone/, dateFormat: 'see section Date Format'
    - attribute: 'attribute name', contains: 'string' or integer
    - pathShouldNotExist: true

### Repeating groups of elements
- **{repeatingGroup: {path: 'path to element containing repeating group', repeater: 'repeating group name', number: integer - occurrence}, path: 'element name', OPTIONS}**
where **OPTIONS** can be one of the following:

    - equals: operator - see section Operators
    - equals: /regex containing utc-timezone or local-timezone/, dateFormat: 'see section Date Format'
    - contains: 'string' or integer
    - attribute: 'attribute name', equals: operator - see section Operators
    - attribute: 'attribute name', equals: /regex containing utc-timezone or local-timezone/, dateFormat: 'see section Date Format'
    - attribute: 'attribute name', contains: 'string' or integer
    - pathShouldNotExist: true

### {path: 'path.to.element', equals: operator - see section Operators}

Example:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne>hello</elementOne>
    </testRootElement>

    var expectedMessage = [
        {path: 'testRootElement.elementOne', equals: 'hello'}
    ];

    var expectedMessage = [
        {path: 'testRootElement.elementOne', equals: /^hel/}
    ];

### {path: 'path.to.element', equals: /regex containing utc-timezone or local-timezone/, dateFormat: 'see section Date Format'}

Example (local timezone):

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne>YYYY-MM-DDT18:39:00.896+11:00</elementOne>
    </testRootElement>
    // where YYYY-MM-DD is today's date

    var expectedMessage = [
        {path: 'testRootElement.elementOne', equals: /local-timezoneT\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d/, dateFormat: 'YYYY-MM-DD'}
    ];
    // local-timezone will be translated to the local date in the format specified in dateFormat.

Example (UTC time):

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne>T18:39:00.896+11:00 MMMM YYYY</elementOne>
    </testRootElement>
    // where MMMM is the current month (e.g. January) and YYYY is the current year

    var expectedMessage = [
        {path: 'testRootElement.elementOne', equals: /T\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d utc-timezone/, dateFormat: 'MMMM YYYY'}
    ];
    // utc-timezone will be translated to the utc date in the format specified in dateFormat.


The `dateFormat` uses [Moment.js](http://momentjs.com/docs/) tokens (more on this under Date Format).

### {path: 'path.to.element', contains: 'string' or integer}

Example:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne>h3llo mr howl</elementOne>
    </testRootElement>

    var expectedMessage = [
        {path: 'testRootElement.elementOne', contains: 'howl'}
    ];

    var expectedMessage = [
        {path: 'testRootElement.elementOne', contains: 3}
    ];

### {path: 'path.to.element', attribute: 'attribute name', equals: operator - see section Operators}

Example:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne attribute1="123456">hello</elementOne>
    </testRootElement>

    var expectedMessage = [
        {path: 'testRootElement.elementOne', attribute: 'attribute1', equals: '{integer}'}
    ];

    var expectedMessage = [
        {path: 'testRootElement.elementOne', attribute: 'attribute1', equals: 123456}
    ];

    var expectedMessage = [
        {path: 'testRootElement.elementOne', attribute: 'attribute1', equals: '123456'}
    ];

### {path: 'path.to.element', attribute: 'attribute name', equals: /regex containing utc-timezone or local-timezone/, dateFormat: 'see section Date Format'}

Example (local timezone):

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne attributeContainingDateTimestamp="YYYY-MM-DDT18:39:00.896+11:00">hello</elementOne>
    </testRootElement>
    // where YYYY-MM-DD is today's date

    var expectedMessage = [
        {path: 'testRootElement.elementOne', attribute: 'attributeContainingDateTimestamp', equals: /local-timezoneT\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d/, dateFormat: 'YYYY-MM-DD'}
    ];
    // local-timezone will be translated to the local date in the format specified in dateFormat.

Example (UTC time):

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne attributeContainingDateTimestamp="T18:39:00.896+11:00 MMMM YYYY">hello</elementOne>
    </testRootElement>
    // where MMMM is the current month (e.g. January) and YYYY is the current year

    var expectedMessage = [
        {path: 'testRootElement.elementOne', attribute: 'attributeContainingDateTimestamp', equals: /T\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d utc-timezone/, dateFormat: 'MMMM YYYY'}
    ];
    // utc-timezone will be translated to the utc date in the format specified in dateFormat.


The `dateFormat` uses [Moment.js](http://momentjs.com/docs/) tokens (more on this under Date Format).

### {path: 'path.to.element', attribute: 'attribute name', contains: 'string' or integer}

Example:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne attribute1="brilliant name for an attribute" attribute2="123456">hello</elementOne>
    </testRootElement>

    var expectedMessage = [
        {path: 'testRootElement.elementOne', attribute: 'attribute1', contains: 'brilliant'}
    ];

    var expectedMessage = [
        {path: 'testRootElement.elementOne', attribute: 'attribute2', contains: 34}
    ];

### {path: 'path.to.element', pathShouldNotExist: true}

Example:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne attribute1="brilliant name for an attribute" attribute2="123456">hello</elementOne>
    </testRootElement>

    var expectedMessage = [
        {path: 'testRootElement.elementTwo', pathShouldNotExist: true}
    ];

### {parentPath: 'path to parent of child element', element: 'element name', elementPosition: integer > 0, equals: operator - see section Operators}

Example:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne>hello</elementOne>
       <elementTwo>its</elementTwo>
       <elementOne>me</elementOne>
       <elementTwo>ben</elementTwo>
    </testRootElement>

    var expectedMessage = [
        {parentPath: 'testRootElement', element: 'elementOne', elementPosition: 3,  equals: 'me'}
    ];

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
       <testRootElement xmlns="http://www.testing.com/integration/event">
          <anotherElement>
             <elementOne>hello</elementOne>
             <elementTwo>its</elementTwo>
             <elementOne>me</elementOne>
             <elementTwo>ben</elementTwo>
          <anotherElement>
       </testRootElement>

    var expectedMessage = [
        {parentPath: 'testRootElement.anotherElement', element: 'elementOne', elementPosition: 3,  equals: 'me'}
    ];

### {parentPath: 'path to parent of child element', element: 'element name', elementPosition: integer > 0, equals: /regex containing utc-timezone or local-timezone/, dateFormat: 'see section Date Format'}

Example:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne>YYYY-MM-DDT18:39:00.896+11:00</elementOne>
       <elementTwo>YYYY-MM-DDT18:39:00.896+11:00</elementTwo>
       <elementOne>DD-MM-YYYYT18:39:00.896+11:00</elementOne>
       <elementTwo>YYYY-MM-DDT18:39:00.896+11:00</elementTwo>
    </testRootElement>

    var expectedMessage = [
        {parentPath: 'testRootElement', element: 'elementOne', elementPosition: 3,  equals: /local-timezoneT\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d/, dateFormat: 'DD-MM-YYYY'}
    ];

    // where DD-MM-YYYY is today's date
    // local-timezone will be translated to the local date in the format specified in dateFormat. Specify utc-timezone if the date is UTC.

The `dateFormat` uses [Moment.js](http://momentjs.com/docs/) tokens (more on this under Date Format).

### {parentPath: 'path to parent of child element', element: 'element name', elementPosition: integer > 0, contains: 'string' or integer}

Example:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne>hello</elementOne>
       <elementTwo>its</elementTwo>
       <elementOne>me</elementOne>
       <elementTwo>ben</elementTwo>
    </testRootElement>

    var expectedMessage = [
        {parentPath: 'testRootElement', element: 'elementOne', elementPosition: 3,  contains: 'me'},
        {parentPath: 'testRootElement', element: 'elementTwo', elementPosition: 4,  contains: 'be'}
    ];

### {parentPath: 'path to parent of child element', element: 'element name', elementPosition: integer > 0, attribute: 'attribute name', equals: operator - see section Operators}

Example:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne attribute1="123">not interested in this value</elementOne>
       <elementTwo attribute1="1234">not interested in this value</elementTwo>
       <elementOne attribute1="12345">not interested in this value</elementOne>
       <elementTwo attribute1="123456">not interested in this value</elementTwo>
    </testRootElement>

    var expectedMessage = [
        {parentPath: 'testRootElement', element: 'elementOne', elementPosition: 3, attribute: 'attribute1', equals: 12345}
    ];

### {parentPath: 'path to parent of child element', element: 'element name', elementPosition: integer > 0, attribute: 'attribute name', equals: /regex containing utc-timezone or local-timezone/, dateFormat: 'see section Date Format'}

Example:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne attribute1="YYYY-MM-DDT18:39:00.896+11:00">not interested in this value</elementOne>
       <elementTwo attribute1="YYYY-MM-DDT18:39:00.896+11:00">not interested in this value</elementTwo>
       <elementOne attribute1="DD-MM-YYYYT18:39:00.896+11:00">not interested in this value</elementOne>
       <elementTwo attribute1="YYYY-MM-DDT18:39:00.896+11:00">not interested in this value</elementTwo>
    </testRootElement>

    var expectedMessage = [
        {parentPath: 'testRootElement', element: 'elementOne', elementPosition: 3,  attribute: 'attribute1', equals: /local-timezoneT\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d/, dateFormat: 'DD-MM-YYYY'}
    ];

    // where DD-MM-YYYY is today's date
    // local-timezone will be translated to the local date in the format specified in dateFormat. Specify utc-timezone if the date is UTC.

The `dateFormat` uses [Moment.js](http://momentjs.com/docs/) tokens (more on this under Date Format).

### {parentPath: 'path to parent of child element', element: 'element name', elementPosition: integer > 0, attribute: 'attribute name', contains: 'string' or integer}

Example:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne attribute1="123">not interested in this value</elementOne>
       <elementTwo attribute1="1234">not interested in this value</elementTwo>
       <elementOne attribute1="12345">not interested in this value</elementOne>
       <elementTwo attribute1="123456">not interested in this value</elementTwo>
    </testRootElement>

    var expectedMessage = [
        {parentPath: 'testRootElement', element: 'elementOne', elementPosition: 3, attribute: 'attribute1', contains: 2345}
    ];

### {repeatingGroup: {path: 'path to element containing repeating group', repeater: 'repeating group name', number: integer - occurrence}, path: 'element name', equals: operator - see section Operators}

Example:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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
    </testRootElement>

    var expectedMessage = [
       {repeatingGroup: {path: 'testRootElement.elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldOneOfRepeatingGroup', equals: 10002},
       {repeatingGroup: {path: 'testRootElement.elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldTwoOfRepeatingGroup', equals: 'hello'},
       {repeatingGroup: {path: 'testRootElement.elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldOneOfRepeatingGroup', equals: '{integer}'},
       {repeatingGroup: {path: 'testRootElement.elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldTwoOfRepeatingGroup', equals: '{alpha}'}
    ];


### {repeatingGroup: {path: 'path to element containing repeating group', repeater: 'repeating group name', number: integer - occurrence}, path: 'element name', equals: /regex containing utc-timezone or local-timezone/, dateFormat: 'see section Date Format'}**

Example:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
      <elementOne>
        <thingContainingRepeatingGroups>
          <RepeatingGroup>
              <fieldOneOfRepeatingGroup>YYYY-MM-DDT18:39:00.896+11:00</fieldOneOfRepeatingGroup>
          </RepeatingGroup>
          <RepeatingGroup>
              <fieldOneOfRepeatingGroup>T18:39:00.896+11:00 DD-MM-YYYY</fieldOneOfRepeatingGroup>
          </RepeatingGroup>
        </thingContainingRepeatingGroups>
      </elementOne>
    </testRootElement>

    // where YYYY-MM-DD is today's date (local) and DD-MM-YYYY is today's date (UTC)

    var expectedMessage = [
       {repeatingGroup: {path: 'testRootElement.elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldOneOfRepeatingGroup', equals: /local-timezoneT\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d/, dateFormat: 'YYYY-MM-DD'},
       {repeatingGroup: {path: 'testRootElement.elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldOneOfRepeatingGroup', equals: /T\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d utc-timezone/, dateFormat: 'DD-MM-YYYY'},
    ];

    // local-timezone and utc-timezone will be translated to the local date and utc date respectively in the format specified in the dateFormat attributes.

### {repeatingGroup: {path: 'path to element containing repeating group', repeater: 'repeating group name', number: integer - occurrence}, path: 'element name', contains: 'string' or integer}

Example:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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
    </testRootElement>

    var expectedMessage = [
       {repeatingGroup: {path: 'testRootElement.elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldOneOfRepeatingGroup', contains: 100},
       {repeatingGroup: {path: 'testRootElement.elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldOneOfRepeatingGroup', equals: 'howl'},
    ];


### {repeatingGroup: {path: 'path to element containing repeating group', repeater: 'repeating group name', number: integer - occurrence}, path: 'element name', attribute: 'attribute name', equals: operator - see section Operators}

Example:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
      <elementOne>
        <thingContainingRepeatingGroups>
          <RepeatingGroup>
              <fieldOneOfRepeatingGroup testAttribute1="toffee">not interested in this value</fieldOneOfRepeatingGroup>
              <fieldTwoOfRepeatingGroup testAttribute2="chocolate">not interested in this value</fieldTwoOfRepeatingGroup>
          </RepeatingGroup>
          <RepeatingGroup>
              <fieldOneOfRepeatingGroup testAttribute1="tea">not interested in this value</fieldOneOfRepeatingGroup>
              <fieldTwoOfRepeatingGroup testAttribute2="coffee">not interested in this value</fieldTwoOfRepeatingGroup>
          </RepeatingGroup>
        </thingContainingRepeatingGroups>
      </elementOne>
    </testRootElement>

    var expectedMessage = [
       {repeatingGroup: {path: 'testRootElement.elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldOneOfRepeatingGroup', attribute: 'attribute1', equals: 'toffee'},
       {repeatingGroup: {path: 'testRootElement.elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldTwoOfRepeatingGroup', attribute: 'attribute2', equals: 'chocolate'},
       {repeatingGroup: {path: 'testRootElement.elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldOneOfRepeatingGroup', attribute: 'attribute1', equals: 'tea'},
       {repeatingGroup: {path: 'testRootElement.elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldTwoOfRepeatingGroup', attribute: 'attribute2', equals: 'coffee'}
    ];

### {repeatingGroup: {path: 'path to element containing repeating group', repeater: 'repeating group name', number: integer - occurrence}, path: 'element name', attribute: 'attribute name', equals: /regex containing utc-timezone or local-timezone/, dateFormat: 'see section Date Format'}

Example:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
      <elementOne>
        <thingContainingRepeatingGroups>
          <RepeatingGroup>
              <fieldOneOfRepeatingGroup testAttribute1="YYYY-MM-DDT18:39:00.896+11:00">not interested in this value</fieldOneOfRepeatingGroup>
          </RepeatingGroup>
          <RepeatingGroup>
              <fieldOneOfRepeatingGroup testAttribute1="T18:39:00.896+11:00 DD-MM-YYYY">not interested in this value</fieldOneOfRepeatingGroup>
          </RepeatingGroup>
        </thingContainingRepeatingGroups>
      </elementOne>
    </testRootElement>

    // where YYYY-MM-DD is today's date (local) and DD-MM-YYYY is today's date (UTC)

    var expectedMessage = [
       {repeatingGroup: {path: 'testRootElement.elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldOneOfRepeatingGroup', attribute: 'attribute1', equals: /local-timezoneT\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d/, dateFormat:'YYYY-MM-DD'},
       {repeatingGroup: {path: 'testRootElement.elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldOneOfRepeatingGroup', attribute: 'attribute1', equals: /T\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d utc-timezone/, dateFormat:'DD-MM-YYYY'}
    ];

    // local-timezone and utc-timezone will be translated to the local date and utc date respectively in the format specified in the dateFormat attributes.
    
### {repeatingGroup: {path: 'path to element containing repeating group', repeater: 'repeating group name', number: integer - occurrence}, path: 'element name', attribute: 'attribute name', contains: 'string' or integer}

Example:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
      <elementOne>
        <thingContainingRepeatingGroups>
          <RepeatingGroup>
              <fieldOneOfRepeatingGroup testAttribute1="toffee">not interested in this value</fieldOneOfRepeatingGroup>
              <fieldTwoOfRepeatingGroup testAttribute2="123">not interested in this value</fieldTwoOfRepeatingGroup>
          </RepeatingGroup>
          <RepeatingGroup>
              <fieldOneOfRepeatingGroup testAttribute1="tea">not interested in this value</fieldOneOfRepeatingGroup>
              <fieldTwoOfRepeatingGroup testAttribute2="123">not interested in this value</fieldTwoOfRepeatingGroup>
          </RepeatingGroup>
        </thingContainingRepeatingGroups>
      </elementOne>
    </testRootElement>

    var expectedMessage = [
       {repeatingGroup: {path: 'testRootElement.elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldOneOfRepeatingGroup', attribute: 'attribute1', contains: 'toffee'},
       {repeatingGroup: {path: 'testRootElement.elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldTwoOfRepeatingGroup', attribute: 'attribute2', contains: 123},
       {repeatingGroup: {path: 'testRootElement.elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldOneOfRepeatingGroup', attribute: 'attribute1', contains: 'ea'},
       {repeatingGroup: {path: 'testRootElement.elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldTwoOfRepeatingGroup', attribute: 'attribute2', contains: 2}
    ];


### {repeatingGroup: {path: 'path to element containing repeating group', repeater: 'repeating group name', number: integer - occurrence}, path: 'element name', pathShouldNotExist: true}

Example:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
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
    </testRootElement>

    var expectedMessage = [
        {repeatingGroup: {path: 'testRootElement.elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldTwoOfRepeatingGroup', pathShouldNotExist: true}
    ];

Operators
---------

The following is a list of operators (i.e. assertions) which can be applied to a value retrieved from the path specified.

- **'string'**
- **integer**
- **'{integer}'**
- **'{alpha}'**
- **'{uuid}'**
- **'{alphanumeric}'**
- **'{length(<d)}' where d is an integer**
- **'{length(>d)}' where d is an integer**
- **'{length(d)}' where d is an integer**
- **/regex/**
- **/regex containing utc-timezone or local-timezone/**
- **'{store(nameOfStore)}' and '{matches(nameOfStore)}'**

### 'string'

Expect 'string' value to be present. Works with `contains` and `equals`.

Example:

    equals: 'check this string equals the value at the path specified'
    contains 'a string'

### integer

Expected the integer value to be present. Works with `contains` and `equals`.

Example:

    equals: 22
    contains: 2

### '{integer}'

Expect the value to be an integer. Use with `equals`.

Example:

    equals: '{integer}'

### '{alpha}'

Expect the value to be an alpha character or a sequence of alpha characters (A-Z a-z). Use with `equals`.

Example:

    equals: '{alpha}'
    // e.g. 'a' or 'hello' would pass the assertion

### '{uuid}'

Expect the value to be an universally unique identifier (uuid). Use with `equals`.

Example:

    equals: '{uuid}'

### '{alphanumeric}'

Expect the value to be alphanumeric (A-Z a-z 0-9). Use with `equals`.

Example:

    equals: '{alphanumeric}'
    // e.g. 'h3llo' would pass the assertion

### '{length(<d)}' where d is an integer

Expect the value to have a length less than d. Use with `equals`.

Example:

    equals: '{length(<6)}'
    // e.g. 'hello' would pass the assertion

### '{length(>d)}' where d is an integer

Expect the value to have a length greater than d. Use with `equals`.

Example:

    equals: '{length(>5)}'
    // e.g. 'hello' would pass the assertion

### '{length(d)}' where d is an integer

Expect the value to have a length equal to d. Use with `equals`.

Example:

    equals: '{length(5)}'
    // e.g. 'hello' would pass the assertion


### /regex/

Expect the value to match the regex pattern. Use with `equals`.

Example:

    equals: /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}\+[0-9]{2}:[0-9]{2}/
    // e.g. '2015-11-01T08:12:15.425+11:00' would pass the assertion

**Remember to escape any special characters as this is just a JavaScript regex literal**

### /regex containing utc-timezone or local-timezone/

Expect the value to the match regex pattern after utc-timezone or local-timezone references have been replaced with the current date (assuming `dateFormat` has been included)

Example:

    equals: /local-timezoneT\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d/, dateFormat: 'YYYY-MM-DD'
    // YYYY-MM-DDT18:39:00.896+11:00 would pass the assertion if YYYY-MM-DD is the current local date

**Remember to escape any special characters as this is just a JavaScript regex literal**

### '{store(nameOfStore)}' and '{matches(nameOfStore)}'

Use {store(nameOfStore)} to store the value specified by a path. Then use {matches(nameOfStore)} to check a different path value matches the value stored earlier. Use with `equals`.

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne>hello</elementOne>
       <elementTwo>hello</elementTwo>
    </testRootElement>

    var expectedMessage = [
        {path: 'testRootElement.elementOne', equals: '{store(whatever)}'}
        {path: 'testRootElement.elementTwo', equals: '{matches(whatever)}'}
    ];

    // in the example above we are asserting the value of <elementTwo> matches the value of <elementOne>


Date Format (dateFormat)
------------------------

Where a regex literal is used for `equals` and the attribute `dateFormat` is included then any reference to `local-timezone` or `utc-timezone` within the regex is replaced with the current local/utc date in the format specified in `dateFormat`. In the code Moment.js is used to format the current date as per the `dateFormat`. Refer to the following table for valid tokens:

| Day of Month  | Examples                               |
|---------------|----------------------------------------|
| D             | 1 2 ... 30 31                          |
| DD	        | 01 02 ... 30 31                        |
| Do	        | 1st 2nd ... 30th 31st                  |

| Month  | Examples                                            |
|--------|-----------------------------------------------------|
| M      | 1 2 ... 11 12                                       |
| MM     | 01 to 12                                            |
| Mo     | 1st 2nd ... 11th 12th, e.g January is the 1st month |
| MMM	 | Jan Feb ... Nov Dec                                 |
| MMMM	 | January February ... November December              |

| Year  | Examples |
|-------|----------|
| YY    | 15       |
| YYYY	| 2016     |


For Contributors
----------------

To run tests, node v4.0.0 or higher is required. I would recommend installing node version manager (nvm) if you haven't done so yet.

Clone the github repository:

    git clone https://github.com/mrbenhowl/messageCheckr
    cd messageCheckr
    nvm use (optional - use if you use node version manager)
    npm install

To run tests:

    npm test

TODO
----

I am planning to work on the following tasks/features in the near future:

* [Support for position delimited messages](https://github.com/mrbenhowl/messageCheckr/issues/6)
* [The ability to check floating point numbers](https://github.com/mrbenhowl/messageCheckr/issues/7)
* [Refactor - review any TODOs in the code](https://github.com/mrbenhowl/messageCheckr/issues/11)
* [Add unit test code coverage reports](https://github.com/mrbenhowl/messageCheckr/issues/10)