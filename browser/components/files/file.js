// Copyright 2015 The Vanadium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var h = require('mercury').h;
var debug = require('debug')('reader:file');
var anchor = require('../../router/anchor');
var format = require('format');
var click = require('../../events/click');

module.exports = {
  state: state,
  render: render
};

function state(blob, key) {
  debug('creating file: %o', arguments);

  // NOTE: blob is a File object
  // SEE: https://developer.mozilla.org/en-US/docs/Web/API/File
  // NOTE: blob.lastModifiedDate will always be the last db access time, we will
  // need to track and modify update times manually.
  return {
    hash: key,
    // TODO: Make title editable.
    title: blob.name,
    blob: blob
  };
}

// Assumes it's being called as an array iterator with the thisArg set to this
// component's parent channels attribute.
// SEE: https://goo.gl/tu7srT
function render(file, index, collection) {
  var channels = this;

  return h('.file', [
    h('h2', [
      anchor({
        href: format('/%s', file.hash)
      }, file.title)
    ]),
    h('p', [
      h('span', format('%s - %s ', file.blob.type, file.hash)),
      h('a.delete', {
        href: '#',
        'ev-click': click(channels.remove, { hash: file.hash })
      }, 'DELETE')
    ]),
  ]);
}
