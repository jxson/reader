// Copyright 2015 The Vanadium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var pdf = require('./components/pdf-viewer');
var css = require('./components/base/index.css');
var debug = require('debug')('reader:main');
var document = require('global/document');
var domready = require('domready');
var files = require('./components/files');
var format = require('format');
var h = require('mercury').h;
var header = require('./components/header');
var hg = require('mercury');
var insert = require('insert-css');
var mover = require('./components/mover');
var router = require('./components/router');
var window = require('global/window');
var devices = require('./components/devices');
var sets = require('./components/device-sets');
var set = require('./components/device-set');

// Expose globals for debugging.
window.debug = require('debug');
window.require = require;
global.require = require;

domready(function ondomready() {
  debug('domready');

  // Top level state.
  var state = hg.state({
    store: hg.value(null),
    router: router.state({
      '#!/': index,
      '#!/mover': showMover,
      '#!/:id': show,
      '*': notfound
    }),
    files: files.state(),
    devices: devices.state(),
    sets: sets.state(),
    pdf: pdf.state(),


    // mover: mover.state({}),
  });

  state.router(function routechange(data) {
    var pattern = data.route.route;
    var id = data.route.params.id;

    if (pattern === '#!/:id') {
      var ds = state.sets.collection.get(id);
      state.pdf.deviceSet.set(ds);
    }
  });

  files.on('add', function onFileAdd(file) {
    debug('add file: %o', file);

    var ds = set.state({
      file: file,
    });

    debug('ds: %o', ds());

    var device = state.devices.collection.get(state.devices.current());

    ds.devices.put(device.id(), device);
    state.sets.collection.put(ds.id(), ds);
  });

  // TODO(jasoncampbell): Can there be a dynamic error listener which maps
  // errors to the top error component?
  state.files.error(function (err) {
    console.error('err', err);
  });

  hg.app(document.body, state, render);
});

function render(state) {
  debug('render: %o', state);
  insert(css);

  return h('.reader-app', [
    hg.partial(header.render, state),
    hg.partial(router.render, state.router, state),
  ]);
}

function index(state, params, route) {
  debug('index route: %o', route);
  debug('=== list view ===');

  return h('main', [
    hg.partial(sets.render, state.sets, state.sets.channels),
    hg.partial(files.render, state.files, state.files.channels)
  ]);
}

function show(state, params, route) {
  debug('=== PDF view ===');
  debug('show: %s', params.id, state);

  return h('main', [
    hg.partial(pdf.render, state.pdf, state.pdf.channels)
  ]);
}

function showMover(state, params, route) {
  debug('show mover');
  return h('main', [
    hg.partial(mover.render, state.mover, state.mover.channels),
  ]);
}

function notfound(state) {
  var href = state.router.href;
  console.error('TODO: not found error - %s', href);

  return h('.notfound', [
    h('Not Found.'),
    h('p', format('The page "%s" does not exisit.', state.router.href))
  ]);
}
