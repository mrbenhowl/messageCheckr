var convertToXmlDocumentType = require('./libs/convertToXmlDocumentType'),
  validateParams = require('./libs/validateParams.js'),
  cleanRawSoapMessage = require('./libs/cleanRawSoapMessage'),
  cleanRawXmlMessage = require('./libs/cleanRawXmlMessage'),
  verificationResults = require('./libs/verificationResults'),
  assertions = require('./libs/assertions'),
  store = require('./libs/store'),
  messageComponent = require('./libs/messageComponent');

var messageCheckr = function messageCheckr(params) {
  var type, actualMsg, expectedMsg, expectedRootElement, cleansedMessage, xmlDocument;

  validateParams(params);
  verificationResults.initialise();
  store.initialise();

  type = params.type;
  actualMsg = params.actualMsg;
  expectedMsg = params.expectedMsg;
  expectedRootElement = params.expectedRootElement;

  if (type === 'soap') {
    cleansedMessage = cleanRawSoapMessage(actualMsg);
    xmlDocument = convertToXmlDocumentType(cleansedMessage);
    assertions.checkRootElement(xmlDocument, 'SOAP-ENV:Envelope');
    checkAllMessageComponents(xmlDocument, expectedMsg);
  } else if (type === 'jms') {
    cleansedMessage = cleanRawXmlMessage(actualMsg);
    xmlDocument = convertToXmlDocumentType(cleansedMessage);
    assertions.checkRootElement(xmlDocument, expectedRootElement);
    checkAllMessageComponents(xmlDocument, expectedMsg);
  } else {
    throw new Error('type ' + type + ' is not handled');
  }

  return ({allChecksPassed: verificationResults.getOverallResult(), checks: verificationResults.getAllChecks()});
};

function checkAllMessageComponents(actualMsgAsXmlDocument, expectedMsg) {
  expectedMsg.forEach(function (expectedMsgComponent) {
    var msgComponent = messageComponent(expectedMsgComponent, actualMsgAsXmlDocument);
    assertions.verifyMessageComponent(msgComponent);
  });
}

module.exports = messageCheckr;