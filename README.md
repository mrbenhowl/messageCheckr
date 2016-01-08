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
        {path: 'testRootElement', attribute: 'xmlns', equals: 'http://www.testing.com/integration/event'},
        {path: 'elementOne', equals: 'hello'},
        {path: 'anotherElement.elementTwo', equals: '{integer}'},
    ];

Notice above that except in the case of checking something about the root element, the root element is not required when specifying a path to an element within it.

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

The object returned by messageCheckr also has an attribute called `checks`, which in the case of above will contain:

    [
      {
        "passedCheck": true,
        "actual": "testRootElement",
        "expected": "testRootElement",
        "description": "Check actual root element testRootElement is equal to expected root element testRootElement"
      },
      {
        "passedCheck": true,
        "description": "Check existence of path: testRootElement"
      },
      {
        "passedCheck": true,
        "actual": "http://www.testing.com/integration/event",
        "expected": "http://www.testing.com/integration/event",
        "description": "Check actual value http://www.testing.com/integration/event is equal to http://www.testing.com/integration/event"
      },
      {
        "passedCheck": true,
        "description": "Check existence of path: elementOne"
      },
      {
        "passedCheck": true,
        "actual": "hello",
        "expected": "hello",
        "description": "Check actual value hello is equal to hello"
      },
      {
        "passedCheck": true,
        "description": "Check existence of path: anotherElement.elementTwo"
      },
      {
        "passedCheck": true,
        "description": "Check actual value 123 is an integer"
      }
     ]

The attribute `checks` is an array of all checks that were specified in `expectedMessage`. For each check there will be 2 objects in the array, the first detailing the result of checking that the path existed, the second detailing the result of the check specified. Each object contains the attribute `passedCheck`, which is set to true if the test passed, otherwise false. In a future release the structure of `checks` will change so that there will only be one object for each path specified.

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
        {path: 'SOAP-ENV:Body.elementOne', equals: 'hello'}
    ];

Then make a call to messageCheckr. Notice in the case of specifying the path for elementOne we have excluded the 'm' namespace, messageCheckr removes all non-SOAP namespaces. The decision for this again was related to differences I noticed when testing messageCheckr on different environments.

expectedMessage types
---------------------

The following is a list of all possible types that you can use to construct an `expectedMessage`

- **{path: 'path.to.element', equals: operator - see section Operators}**
- **{path: 'path.to.element', equals: /regex containing utc-timezone or local-timezone/, dateFormat: 'see section Date Format'}**
- **{path: 'path.to.element', contains: 'string' or integer}**
- **{path: 'path.to.element', attribute: 'attribute name', equals: operator - see section Operators}**
- **{path: 'path.to.element', attribute: 'attribute name', equals: /regex containing utc-timezone or local-timezone/, dateFormat: 'see section Date Format'}**
- **{path: 'path.to.element', attribute: 'attribute name', contains: 'string' or integer}**
- **{path: 'path.to.element', pathShouldNotExist: true}**
- **{repeatingGroup: {path: 'path to element containing repeating group', repeater: 'repeating group name', number: integer - occurrence}, path: 'element name', equals: operator - see section Operators}**
- **{repeatingGroup: {path: 'path to element containing repeating group', repeater: 'repeating group name', number: integer - occurrence}, path: 'element name', contains: 'string' or integer}**

### {path: 'path.to.element', equals: operator - see section Operators}

Example:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne>hello</elementOne>
    </testRootElement>

    var expectedMessage = [
        {path: 'elementOne', equals: 'hello'}
    ];

    var expectedMessage = [
        {path: 'elementOne', equals: /^hel/}
    ];

### {path: 'path.to.element', equals: /regex containing utc-timezone or local-timezone/, dateFormat: 'see section Date Format'}

Example (local timezone):

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne>YYYY-MM-DDT18:39:00.896+11:00</elementOne>
    </testRootElement>
    // where YYYY-MM-DD is today's date

    var expectedMessage = [
        {path: 'elementOne', equals: /local-timezoneT\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d/, dateFormat: 'YYYY-MM-DD'}
    ];
    // local-time will be translated to the local date in the format specified in dateFormat.

Example (UTC time):

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne>T18:39:00.896+11:00 MMMM YYYY</elementOne>
    </testRootElement>
    // where MMMM is the current month (e.g. January) and YYYY is the current year

    var expectedMessage = [
        {path: 'elementOne', equals: /T\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d utc-timezone/, dateFormat: 'MMMM YYYY'}
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
        {path: 'elementOne', contains: 'howl'}
    ];

    var expectedMessage = [
        {path: 'elementOne', contains: 3}
    ];

### {path: 'path.to.element', attribute: 'attribute name', equals: operator - see section Operators}

Example:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne attribute1="123456">hello</elementOne>
    </testRootElement>

    var expectedMessage = [
        {path: 'elementOne', attribute: 'attribute1', equals: '{integer}'}
    ];

    var expectedMessage = [
        {path: 'elementOne', attribute: 'attribute1', equals: 123456}
    ];

    var expectedMessage = [
        {path: 'elementOne', attribute: 'attribute1', equals: '123456'}
    ];

### {path: 'path.to.element', attribute: 'attribute name', equals: /regex containing utc-timezone or local-timezone/, dateFormat: 'see section Date Format'}

Example (local timezone):

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne attributeContainingDateTimestamp="YYYY-MM-DDT18:39:00.896+11:00">hello</elementOne>
    </testRootElement>
    // where YYYY-MM-DD is today's date

    var expectedMessage = [
        {path: 'elementOne', attribute: 'attributeContainingDateTimestamp', equals: /local-timezoneT\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d/, dateFormat: 'YYYY-MM-DD'}
    ];
    // local-time will be translated to the local date in the format specified in dateFormat.

Example (UTC time):

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne attributeContainingDateTimestamp="T18:39:00.896+11:00 MMMM YYYY">hello</elementOne>
    </testRootElement>
    // where MMMM is the current month (e.g. January) and YYYY is the current year

    var expectedMessage = [
        {path: 'elementOne', attribute: 'attributeContainingDateTimestamp', equals: /T\d\d:\d\d:\d\d\.\d\d\d\+\d\d:\d\d utc-timezone/, dateFormat: 'MMMM YYYY'}
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
        {path: 'elementOne', attribute: 'attribute1', contains: 'brilliant'}
    ];

    var expectedMessage = [
        {path: 'elementOne', attribute: 'attribute2', contains: 34}
    ];

### {path: 'path.to.element', pathShouldNotExist: true}

Example:

    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <testRootElement xmlns="http://www.testing.com/integration/event">
       <elementOne attribute1="brilliant name for an attribute" attribute2="123456">hello</elementOne>
    </testRootElement>

    var expectedMessage = [
        {path: 'elementTwo', pathShouldNotExist: true}
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
       {repeatingGroup: {path: 'elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldOneOfRepeatingGroup', equals: 10002},
       {repeatingGroup: {path: 'elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldTwoOfRepeatingGroup', equals: 'hello'},
       {repeatingGroup: {path: 'elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldOneOfRepeatingGroup', equals: '{integer}'},
       {repeatingGroup: {path: 'elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldTwoOfRepeatingGroup', equals: '{alpha}'}
    ];

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
       {repeatingGroup: {path: 'elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 1}, path: 'fieldOneOfRepeatingGroup', contains: 100},
       {repeatingGroup: {path: 'elementOne.thingContainingRepeatingGroups', repeater: 'RepeatingGroup', number: 2}, path: 'fieldOneOfRepeatingGroup', equals: 'howl'},
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
        {path: 'elementOne', equals: '{store(whatever)}'}
        {path: 'elementTwo', equals: '{matches(whatever)}'}
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

    git clone https://github.com/benhowl/messageCheckr
    cd messageCheckr
    nvm use (optional - use if you use node version manager)
    npm install

To run tests:

    npm test

TODO
----

I am planning to work on the following tasks/features in the near future:

- Refactor messageCheckr to be more modular - there are far too many functions in one file (#1 priority).
- The ability to check current date in a repeating group
- The ability to check attributes in a repeating group
- I'm not happy with how you have to specifiy a repeating group, so this will probably be reworked in the future
- The ability to check an element by position within another element rather than by name
- Currently every time a path is specified the existence is checked, which means if you need to perform more than one check on the same path the path is checked more than once, which is inefficient.
- Change the structure of the output, so that the key is the path being checked. That key will point to an object containing all checks
- Support for position delimited messages
- The ability to check floating point numbers
- Actual and expected values are not always present in the output, this needs to change and be present
- Converter for Cucumber.js datatable to enable use in cucumber tests (separate repo)
- Improve unit tests - more coverage (e.g. errors) and more stubbing
- Add unit test code coverage reports
- The ability to check <?xml version="1.0" encoding="UTF-8" standalone="yes"?> for JMS messages
- Migrate the above to become 'Issues'
