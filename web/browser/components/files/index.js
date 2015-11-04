// Copyright 2015 The Vanadium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var hg = require('mercury');
var debug = require('debug')('reader:files');
var assert = require('assert');
var cuid = require('cuid');
var format = require('format');
var hash = require('./hash-blob');
var EventEmitter = require('events').EventEmitter;

// Singleton EventEmitter, state.channels are for DOM events only.
// SEE: https://github.com/Raynos/mercury/issues/132
var component = module.exports = new EventEmitter();
module.exports.state = state;
module.exports.render = require('./render');

function state(options) {
  options = options || {};

  var atom = hg.state({
    error: hg.value(null),
    store: hg.value(null),
    collection: hg.varhash({}, createFile),
    channels: {
      add: add,
      remove: remove
    }
  });

  return atom;
}

function add(state, data) {
  if (!data.file) {
    return;
  }

  if (data.file.type !== 'application/pdf') {
    var message = format('The file "%s" is not a PDF.', data.file.name);
    var err = new Error(message);
    return state.error.set(err);
  }

  debug('adding file: %o', data.file);

  // TODO(jasoncampbell): Add validation for blob.type === "application/pdf"
  var key = cuid();

  state.collection.put(key, {
    blob: data.file
  });

  // Async hash
  hash(data.file, function onhash(err, digest) {
    if (err) {
      return state.error.set(err);
    }

    var file = state.collection.get(key);
    if (file) {
      file.hash.set(digest);
    }

    component.emit('add', file);
  });
}

function remove(state, data) {
  assert.ok(data.id, 'data.id required');
  state.collection.delete(data.id);
}

function createFile(options, key) {
  key = key || cuid();

  // If the blob was created in this application instance it will be a File
  // object and have a name attribute. If it was created by a peer it will
  // manifest locally as a Blob object (Files can't be directly constructed).
  //
  // SEE: https://developer.mozilla.org/en-US/docs/Web/API/File
  var blob = options.blob;

  return hg.struct({
    id: hg.value(key),
    ref: hg.value(options.ref || ''),
    title: hg.value(options.title || blob.name || ''),
    size: hg.value(options.size || blob.size),
    type: hg.value(options.type || blob.type),
    blob: hg.value(blob || null),
    hash: hg.value(options.hash || '')
  });
}
