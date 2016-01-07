global.chai = require('chai');
global.assert = chai.assert;
global.expect = chai.expect;
global.sinonChai = require('sinon-chai');
global.sinon = require('sinon');
chai.use(require('chai-subset'));
chai.use(sinonChai);

global.winston = require('winston');
winston.level = 'info'; // options are 'info' or 'debug'
global.rewire = require('rewire');
global.messageCheckr = require('../messageCheckr.js');