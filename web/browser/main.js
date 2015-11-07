// Copyright 2015 The Vanadium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var stash = require('./local-stash');
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
var deviceSets = require('./components/device-sets');
var deviceSet = require('./components/device-set');


// Expose globals for debugging.
window.debug = require('debug');
window.require = require;
global.require = require;

var routes = {
  INDEX: '#!/',
  SHOW: '#!/:id',
  NOT_FOUND: '*',
};

function state(dehydrated) {
  dehydrated = dehydrated || {};
  debug('reyhdrating from %o', dehydrated);
  return hg.state({
    router: router.state({ routes: routes }),
    deviceSets: deviceSets.state(dehydrated.deviceSets),
  });
}

domready(function ondomready() {
  debug('domready');

  var stored = stash('state');
  var atom = state(stored);

  atom(function change(value) {
    debug('storing: %o', value);
    stash('state', value);
  });

  // // Top level state.
  // var state = hg.state({
  //   // store: hg.value(null),
  //   router: router.state({
  //     '#!/': index,
  //     '#!/mover': showMover,
  //     '#!/:id': show,
  //     '*': notfound
  //   }),
  //   sets: sets.state()
  //   // files: files.state(),
  //   // devices: devices.state(),
  //   // sets: sets.state(),
  //   // pdf: pdf.state(),
  //
  //
  //   // mover: mover.state({}),
  // });

  // state.router(function routechange(data) {
  //   var pattern = data.route.route;
  //   var id = data.route.params.id;
  //
  //   if (pattern === '#!/:id') {
  //     var ds = state.sets.collection.get(id);
  //     state.pdf.deviceSet.set(ds);
  //   }
  // });
  //
  // files.on('add', function onFileAdd(file) {
  //   debug('add file: %o', file);
  //
  //   var ds = set.state({
  //     file: file,
  //   });
  //
  //   debug('ds: %o', ds());
  //
  //   var device = state.devices.collection.get(state.devices.current());
  //
  //   ds.devices.put(device.id(), device);
  //   state.sets.collection.put(ds.id(), ds);
  // });
  //
  // // TODO(jasoncampbell): Can there be a dynamic error listener which maps
  // // errors to the top error component?
  // state.files.error(function (err) {
  //   console.error('err', err);
  // });

  hg.app(document.body, atom, render);
});

function render(state) {
  debug('render: %o', state);
  insert(css);

  var children = [];

  switch (state.router.route) {
    case routes.INDEX:
      children = [
        hg.partial(header.render, state),
        hg.partial(deviceSets.render,
          state.deviceSets,
          state.deviceSets.channels)
      ];
      break;
    case routes.SHOW:
      var key = state.router.params.id;
      var value = state.deviceSets.collection[key];
      children = [
        hg.partial(deviceSet.render, value, value.channels)
      ];
      break;
    case routes.NOT_FOUND:
      children = [
        hg.partial(notfound, state)
      ];
      break;
  }

  return h('.reader-app', children);
}

function notfound(state) {
  var href = state.router.href;
  console.error('TODO: not found error - %s', href);

  return h('.notfound', [
    h('h1', 'Not Found.'),
    h('p', format('The page "%s" does not exisit.', state.router.href))
  ]);
}
