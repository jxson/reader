var format = require('format');
var window = require('global/window');
var file = require('../../events/file');
var hg = require('mercury');
var map = require('../../util').map;
var deviceSet = require('./device-set');
var css = require('./device-sets.css');
var h = require('mercury').h;
var hg = require('mercury');
var insert = require('insert-css');
var debug = require('debug')('reader:device-sets');

module.exports = render;

function render(state, channels) {
  insert(css);

  if (state.current) {
    debug('=== SHOW %s ===', state.current);
  } else {
    debug('=== LIST ===');
  }

  debug('render: %o', state.collection);

  var children = map(state.collection, deviceSet.render, channels);
  if (children.length === 0) {
    children = [ hg.partial(blank) ];
  }

  var footer = h('footer', [
    h('.spacer'),
    h('label.fab', [
      h('i.material-icons', 'add'),
      h('input.hidden', {
        type: 'file',
        'ev-event': file(channels.add)
      })
    ])
  ]);

  children.push(footer);

  return h('.device-sets', children);
}

function blank() {
  return h('.blank-slate', 'Add a new PDF file below to get started.');
}
