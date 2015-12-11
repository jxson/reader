
var configure = require('./configure');
var debug = require('debug')('setup');

module.exports = setup;

function setup(fn) {
  debug('initializing');

  return test;

  function test(t) {
    debug('running');

    configure(function(err, config) {
      if (err) {
        t.error(err);
        t.end();
        return;
      }

      debug('config %o', config);
    });
  }
}
