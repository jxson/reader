var event = require('synthetic-dom-events');
var window = require('global/window');
var raf = require('raf');
var hg = require('mercury');
var cuid = require('cuid');
var extend = require('xtend');
var debug = require('debug')('reader:devices');
var stash = require('../../local-stash');

module.exports = function state(options) {
  var atom = hg.state({
    collection: hg.varhash({}, device),
    current: hg.value(null)
  });

  // Get the current device information for this browser tab, use default values
  // if unavailable.
  var current = extend({
    id: cuid(),
    type: 'Browser',
    arch: window.navigator.platform,
    screen: {
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }, stash('device'));

  atom.collection.put(current.id, current);
  atom.current.set(current.id);

  // Store current device info so it can be retrieved on reload.
  var deviceAtom = atom.collection.get(current.id);
  deviceAtom(function devicechange(value) {
    debug('update detected, saving for later: %o', value);
    stash('device', value);
  });

  window.addEventListener('resize', resize(atom));
  // Fire the resize event just in case the size has changed since a previous
  // value was stashed.
  window.dispatchEvent(event('resize'));

  return atom;
};

function device(options, key) {
  options = extend({ screen: {} }, options || {});
  key = key || cuid();

  return hg.struct({
    id: hg.value(key),
    type: hg.value(options.type),
    alias: hg.value(options.alias),
    arch: hg.value(options.arch),
    screen: hg.struct({
      width: hg.value(options.screen.width),
      height: hg.value(options.screen.height)
    })
  });
}

// HACK(jasoncampbell): I couldn't get this event plumbed into to
// state.devices.channels.resize handler. This is a quick way to get an
// optimized resize listener around window resize events.
// SEE: https://developer.mozilla.org/en-US/docs/Web/Events/resize
//
// TODO(jasoncampbell): Make it so only the last resize event trigers the state
// update.
function resize(state) {
  var running = false;

  return function listener(event) {
    if (! running) {
      running = true;
      raf(update);
    }
  };

  function update() {
    var id = state.current();
    var device = state.collection.get(id);
    var width = window.innerWidth;
    var height = window.innerHeight;

    if (device.screen.width() !== width) {
      device.screen.width.set(width);
    }

    if (device.screen.height() !== height) {
      device.screen.height.set(height);
    }

    running = false;
  }
}
