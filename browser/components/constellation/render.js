// Copyright 2015 The Vanadium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var h = require('mercury').h;
var toArray = require('../../util').toArray;

module.exports = render;

function render(state, channels) {
  return h('.constellation', [
    h('ul.peers', toArray(state.peers).sort(sort).map(map))
  ]);
}

function map(peer) {
  var chunks = peer.id.split('/');
  var uuid =  chunks[chunks.length - 1];

  return h('li.peer', [
    h('strong', peer.status + ': '),
    h('span', uuid)
  ]);
}

function sort(peer) {
  return peer.status === 'self' ? -1 : 1;
}
