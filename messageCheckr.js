var _ = require('lodash'),
  convertToXmlDocumentType = require('./libs/convertToXmlDocumentType'),
  validateParams = require('./libs/validateParams.js'),
  validateExpectedMsg = require('./libs/validateExpectedMsg'),
  cleanRawSoapMessage = require('./libs/cleanRawSoapMessage'),
  cleanRawXmlMessage = require('./libs/cleanRawXmlMessage'),
  verificationResults = require('./libs/verificationResults'),
  assertions = require('./libs/assertions'),
  store = require('./libs/store');

function checkAllExpectedMsgComponents(actualMsgAsXmlDocument, expectedMsg, rootElement) {
  expectedMsg.forEach(function (expectedMsgComponent) {
    // TODO: what if the root element name matches a child element?
    assertions.checkExpectedMsgComponent(actualMsgAsXmlDocument, expectedMsgComponent, rootElement === expectedMsgComponent.path)
  });
}

var messageCheckr = function messageCheckr(params) {
  var type, actualMsg, expectedMsg, expectedRootElement, cleansedMessage, xmlDocument;

  validateParams(params);
  validateExpectedMsg(params.expectedMsg);
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
    checkAllExpectedMsgComponents(xmlDocument, expectedMsg, 'SOAP-ENV:Envelope');
  } else if (type === 'jms') {
    cleansedMessage = cleanRawXmlMessage(actualMsg);
    xmlDocument = convertToXmlDocumentType(cleansedMessage);
    assertions.checkRootElement(xmlDocument, expectedRootElement);
    checkAllExpectedMsgComponents(xmlDocument, expectedMsg, xmlDocument.name);
  } else {
    throw new Error('type ' + type + ' is not handled');
  }

  return ({allChecksPassed: verificationResults.getOverallResult(), checks: verificationResults.getAllChecks()});
};

module.exports = messageCheckr;