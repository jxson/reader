
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

module.exports = {
  render: require('./render'),
  state: state
};

function state(options) {
  options = options || {};

  debug('init: %o', options);

  var atom = hg.state({
    error: hg.value(null),
    current: hg.value(null),
    collection: hg.varhash(options.collection || {}, deviceSet.state),
    channels: {
      add: add,
      remove: remove,
      show: show
    }
  });

  return atom;
}

function add(state, data) {
  if (! data.blob) {
    return;
  }

  var blob = data.blob;


  debug('adding new device set for file: %o', blob);

  if (blob.type !== 'application/pdf') {
    var message = format('The file "%s" is not a PDF.', blob.name);
    var err = new Error(message);
    return state.error.set(err);
  }

  var value = deviceSet.state({
    file: { blob: data.blob }
  });

  state.collection.put(value.id(), value);
}

function remove(state, data) {
  state.collection.delete(data.id);
}

function show(state, data) {
  state.current.set(data.id);
}
