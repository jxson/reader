
var format = require('format');
var cuid = require('cuid');
var hg = require('mercury');
var debug = require('debug')('reader:device-set');
var h = require('mercury').h;
var anchor = require('../router/anchor');
var format = require('format');
var click = require('../../events/click');
var css = require('./device-set.css');
var insert = require('insert-css');
var map = require('../../util').map;
var properties = require('../properties');

module.exports = {
  render: render,
  state: state
};

function state(options, key) {
  key = key || cuid();
  debug('creating new set: %s => %o', key, options);

  var atom = hg.state({
    id: hg.value(key),
    file: options.file,
    devices: hg.varhash({}, meta)
  });

  return atom;
}

function meta(options, key) {
  key = key || cuid();

  var atom = hg.state({
    id: hg.value(key),
    page: hg.value(1),
    zoom: hg.value(null),
    linked: hg.value(false),
    channels: {}
  });

  return atom;
}

function render(state, channels) {
  insert(css);

  debug('render: %o', state);

  return h('.device-set', [
    h('.header', [
      h('.title', state.file.title),
      h('.subhead', format('file-id: %s', state.file.id))
    ]),
    h('.support', [
      h('.devices', [
        h('.title', 'Devices'),
        map(state.devices, properties.render)
      ])
    ]),
    h('.actions', [
      h('a.delete', {
        href: '#',
        'ev-click': click(channels.remove, { id: state.id })
      }, 'Delete'),
      anchor({
        className: 'read',
        href: format('/%s', state.id)
      }, 'Read')
    ])
  ]);
}
