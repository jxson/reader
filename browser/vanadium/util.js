// Copyright 2015 The Vanadium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.


module.exports = {
  timeout: timeout
};

function timeout(runtime, miliseconds) {
  var context = runtime.getContext();
  return context.withTimeout(miliseconds || 5000);
}
