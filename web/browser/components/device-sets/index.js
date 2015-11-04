var hg = require('mercury');
var map = require('../../util').map;
var set = require('../device-set');
var css = require('./device-sets.css');
var h = require('mercury').h;
var hg = require('mercury');
var insert = require('insert-css');
var debug = require('debug')('reader:device-sets');

module.exports = {
  render: render,
  state: state
};

function state(options) {
  var atom = hg.state({
    collection: hg.varhash({}, set.state),
    channels: {
      remove: remove
    }
  });

  return atom;
}

function remove(state, data) {
  state.collection.delete(data.id);
}

function render(state, channels) {
  insert(css);

  var children = map(state.collection, set.render, channels);
  if (children.length === 0) {
    children = [ hg.partial(blank) ];
  }

  return h('.device-sets', children);
}

function blank() {
  return h('.blank-slate', 'Add a new PDF file below to get started.');
}

