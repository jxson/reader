
var file = require('../file');
var format = require('format');
var cuid = require('cuid');
var hg = require('mercury');
var debug = require('debug')('reader:device-set');

module.exports = {
  render: require('./render'),
  state: state
};

function state(options, key) {
  options = options || {};

  debug('creating new set: %s => %o', key, options);

  options.id = options.id || key || cuid();

  var atom = hg.state({
    id: hg.value(options.id),
    file: file.state(options.file),
    pdf: hg.value(null),
  });

  return atom;
}
