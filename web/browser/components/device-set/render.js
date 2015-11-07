var h = require('mercury').h;
var debug = require('debug')('reader:device-set');

module.exports = render;

function render(state, channels) {
  debug('render: %o', state);
  return h('.device-set');
}
