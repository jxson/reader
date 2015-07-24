// Copyright 2015 The Vanadium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

module.exports = {
  toArray: toArray
};

// # toArray(obejct)
//
// Convert an object to an array.
function toArray(object) {
  var keys = Object.keys(object);
  var array = keys.map(toItem);

  return array;

  function toItem(key, index) {
    return object[key];
  }
}
