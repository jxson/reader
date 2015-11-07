var format = require('format');
var window = require('global/window');
var show = require('../device-set/render');
var file = require('../../events/file');
var hg = require('mercury');
var map = require('../../util').map;
var renderListItem = require('../device-set/render-list-item');
var css = require('./device-set.css');
var h = require('mercury').h;
var hg = require('mercury');
var insert = require('insert-css');
var debug = require('debug')('reader:device-sets');
var click = require('../../events/click');

module.exports = render;

var page = require('page')

function render(state, channels) {
  debug('render list-item: %o', state);
  insert(css);

  return h('.device-set', [
    h('.header', [
      h('.title', state.file.title),
      h('.subhead', format('file-hash: %s', state.file.hash))
    ]),
    // h('.support', [
    //   h('.devices', [
    //     h('.title', 'Devices'),
    //     map(state.devices, properties.render)
    //   ])
    // ]),
    h('.actions', [
      h('a.delete', {
        href: '#',
        'ev-click': click(channels.remove, { id: state.id })
      }, 'Delete'),
      // anchor({
      //   className: 'read',
      //   href: '/' + state.id
      // }, 'Read')
      h('a.read', {
        href: '/#!/' + state.id,
      }, 'Read')
    ])
  ]);
}
