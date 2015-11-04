var hg = require('mercury');

module.exports = state;

function state(options) {
  options = options || {};

  var atom = hg.state({

  });

  return atom;
}
