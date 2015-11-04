// Copyright 2015 The Vanadium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var h = require('mercury').h;
var file = require('../../events/file');
var insert = require('insert-css');
var css = require('./files.css');

module.exports = render;

function render(state, channels) {
  insert(css);

  return h('.files', [
    h('footer', [
      h('.spacer'),
      h('label.fab', [
        h('i.material-icons', 'add'),
        h('input.hidden', {
          type: 'file',
          'ev-event': file(channels.add)
        })
      ])
    ])
  ]);
}
