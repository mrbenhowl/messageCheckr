var convertToXmlDocumentType = require('./libs/convertToXmlDocumentType'),
  validateParams = require('./libs/validateParams.js'),
  cleanRawSoapMessage = require('./libs/cleanRawSoapMessage'),
  cleanRawXmlMessage = require('./libs/cleanRawXmlMessage'),
  verificationResults = require('./libs/verificationResults'),
  assertions = require('./libs/assertions'),
  store = require('./libs/store'),
  messageComponent = require('./libs/messageComponent'),
  messageComponentType = require('./libs/messageComponentType');

var messageCheckr = function messageCheckr(params) {
  var type, actualMsg, expectedMsg, expectedRootElement, cleansedMessage, xmlDocument, results;

  validateParams(params);
  results = verificationResults.initialise();
  store.initialise();

  type = params.type;
  actualMsg = params.actualMsg;
  expectedMsg = params.expectedMsg;
  expectedRootElement = params.expectedRootElement;

  if (type === 'soap') {
    cleansedMessage = cleanRawSoapMessage(actualMsg);
    xmlDocument = convertToXmlDocumentType(cleansedMessage);
    assertions.checkRootElement(results, xmlDocument, 'SOAP-ENV:Envelope');
    checkAllMessageComponents('xml', xmlDocument, expectedMsg, results);
  } else if (type === 'jms') {
    cleansedMessage = cleanRawXmlMessage(actualMsg);
    xmlDocument = convertToXmlDocumentType(cleansedMessage);
    assertions.checkRootElement(results, xmlDocument, expectedRootElement);
    checkAllMessageComponents('xml', xmlDocument, expectedMsg, results);
  } else if (type === 'position') {
    if (!_.isString(actualMsg)) throw new Error('actualMsg should be a string when type is "position"');
    checkAllMessageComponents('position', actualMsg, expectedMsg, results)
  } else {
    throw new Error('type "' + type + '" is not handled');
  }

  return ({ allChecksPassed: results.getOverallResult(), checks: results.getAllChecks(params.verbose) });
};

function checkAllMessageComponents(messageType, actualMsg, expectedMsg, results) {
  expectedMsg.forEach(function (expectedMsgComponent) {
    var msgComponent = messageComponent(messageType, expectedMsgComponent, actualMsg);

    if (msgComponent.getType() != messageComponentType.XML_REPEATING_GROUP_HAS_ELEMENTS) {
      assertions.verifyMessageComponent(results, msgComponent);
    } else {

      var tempVerificationResults;
      for (var group of msgComponent.groupsWithAllElementsPresent) {
        tempVerificationResults = verificationResults.initialise();

        for (var component in group) {
          assertions.verifyMessageComponent(tempVerificationResults, group[component]);
        }

        if (tempVerificationResults.allChecksPassed) {
          break;
        }
      }

      var result = {
        target: msgComponent.getPrintablePath(),
        description: 'Check for repeating group containing all specified elements and their corresponding values.'
      };

      if (msgComponent.groupsWithAllElementsPresent.length > 0 && tempVerificationResults.allChecksPassed) {
        result.pass = true;
      } else {
        result.pass = false;
        result.expected = 'No repeating groups match the expected.';
      }

      results.add(result);
    }
  });
}

module.exports = messageCheckr;