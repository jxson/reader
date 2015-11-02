// Copyright 2015 The Vanadium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var anchor = require('../router/anchor');
var format = require('format');
var click = require('../../events/click');
var css = require('./index.css');
var h = require('mercury').h;
var hg = require('mercury');
var insert = require('insert-css');

module.exports = render;

function render(state, channels) {
  insert(css);

  var children = map(state.collection, file, channels);
  if (children.length === 0) {
    children = [ hg.partial(blank) ];
  }

  return h('.files', children);
}

function file(state, channels) {
  return h('.file', [
    h('.header', [
      h('.title', state.title),
      h('.subhead', state.id)
    ]),
    h('.support', [

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

function blank() {
  return h('.blank-slate', 'Add a new PDF file below to get started.');
}

function map(object, callback, channels) {
  var array = [];
  var keys = Object.keys(object);
  var length = keys.length;

  for (var i = 0; i < length; i++) {
    var key = keys[i];
    var value = object[key];
    var item = callback(value, channels);

    array.push(item);
  }

  return array;
}
