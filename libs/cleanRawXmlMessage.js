var cleanRawXmlMessage = function cleanRawXmlMessage(rawMessage) {
  var scanMessageFromPosition, cleansedMessage;

  scanMessageFromPosition = rawMessage.toLowerCase().indexOf('<?xml');
  if (scanMessageFromPosition === -1) throw new Error('message does contain the initial <?xml attribute.');

  cleansedMessage =
    rawMessage.substr(scanMessageFromPosition)
      .replace(/(<\?xml)/gi, '<?XML')
      .replace(/<([a-z0-9\-]+):/gi, function (str) {
        if (str != '<?XML:') {
          return '<';
        } else {
          return str;
        }
      })
      .replace(/<\/([a-z0-9\-]+):/gi, '</');

  return cleansedMessage;
};

module.exports = cleanRawXmlMessage;
