
var format = require('format');
var h = require('mercury').h;
var debug = require('debug')('reader:properties');

module.exports = {
  render: render
};

// Helper method for rendering a list of properties on a state object. The
// render happens recursively if a property's value is an object.
function render(state) {
  debug('render: %o', state);

  var keys = Object.keys(state);
  var childern = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = state[key];
    var node;

    debug('key: %s\nvalue: %s', key, value);

    if (typeof value === 'object' && value !== null) {
      node = h('li.nested', [
        h('.title', key + ':'),
        render(value)
      ]);
    } else {
      node = h('li.property', format('%s: %s', key, value));
    }

    childern.push(node);
  }

  return h('ul.properties', childern);
}
