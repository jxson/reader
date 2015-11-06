// Copyright 2015 The Vanadium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var cuid = require('cuid');
var debug = require('debug')('reader:file');
var extend = require('xtend');
var hash = require('./hash-blob');
var hg = require('mercury');
var window = require('global/window');

module.exports = {
  state: state
};

function state(options, key) {
  options = extend({
    id: key || cuid()
  }, options);

  debug('init: %o', options);

  // If the blob was created in this application instance it will be a File
  // object and have a name attribute. If it was created by a peer it will
  // manifest locally as a Blob object (Files can't be directly constructed).
  //
  // SEE: https://developer.mozilla.org/en-US/docs/Web/API/File
  var blob = options.blob || {};

  var atom = hg.state({
    id: hg.value(options.id),
    ref: hg.value(options.ref || ''),
    title: hg.value(options.title || blob.name || ''),
    size: hg.value(options.size || blob.size),
    type: hg.value(options.type || blob.type),
    blob: hg.value(blob || null),
    hash: hg.value(options.hash || ''),
    error: hg.value(null)
  });

  if (blob instanceof window.Blob) {
    hash(blob, function onhash(err, digest) {
      if (err) {
        return atom.error.set(err);
      }

      atom.hash.set(digest);
    });
  }

  return atom;
}
