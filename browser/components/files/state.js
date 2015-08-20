// Copyright 2015 The Vanadium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var hg = require('mercury');
var debug = require('debug')('reader:files');
var file = require('./file');
var assert = require('assert');

module.exports = function create(options) {
  assert.ok(options, 'files.state(options) - options required');
  assert.ok(options.store, 'files.state(options) - options.store required');

  var store = options.store;
  var state = hg.state({
    error: hg.value(null),
    collection: hg.varhash({}, file.state),
    channels: {
      // Scope options.store to this state instance's channel.add.
      add: add.bind(null, store),
      remove: remove.bind(null, store)
    }
  });

  return state;
};

function add(store, state, data) {
  assert.ok(data.file, 'A File object must be passed into channel');

  store.put(data.file, function onput(err, key) {
    if (err) {
      state.error.set(err);
      return;
    }

    state.collection.put(key, data.file);
    debug('added file: %s', key);
  });
}

function remove(store, state, data) {
  assert.ok(data.hash, 'data.uuid required');
  debug('removing file: %s', data.hash);
  store.del(data.hash, function ondel(err) {
    if (err) {
      state.error.set(err);
      return;
    }

    state.collection.delete(data.hash);
  });
}
