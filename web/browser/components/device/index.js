var raf = require('raf');
var event = require('synthetic-dom-events');
var window = require('global/window');
var hg = require('mercury');
var debug = require('debug')('reader:device');
var extend = require('xtend');
var cuid = require('cuid');

module.exports = {
  state: state
};

function state(options, key) {
  options = extend({
    id: key || cuid(),
    screen: {}
  }, options);
  debug('init: %o', options);

  var atom = hg.state({
    id: hg.value(options.id),
    current: hg.value(options.current || false),
    type: hg.value(options.type),
    alias: hg.value(options.alias),
    arch: hg.value(options.arch),
    screen: hg.struct({
      width: hg.value(options.screen.width),
      height: hg.value(options.screen.height)
    })
  });

  if (atom.current()) {
    // Fire the resize event just in case the size has changed since a previous
    // value was stashed.
    window.addEventListener('resize', resize(atom));
    window.dispatchEvent(event('resize'));
  }

  return atom;
}

// HACK(jasoncampbell): I couldn't get this event plumbed into to
// state.channels.resize handler. This is a quick way to get an
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
    var width = window.innerWidth;
    var height = window.innerHeight;

    if (state.screen.width() !== width) {
      state.screen.width.set(width);
    }

    if (state.screen.height() !== height) {
      state.screen.height.set(height);
    }

    running = false;
  }
}
