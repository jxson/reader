// Copyright 2015 The Vanadium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var h = require('mercury').h;
var insert = require('insert-css');
var css = require('./index.css');
var anchor = require('../router/anchor');

module.exports = {
  render: render
};

function render(state, channels) {
  insert(css);

  return h('header', [
    h('a.title', {
      href: '/'
    }, 'PDF Reader')
  ]);
}
