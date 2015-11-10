// Copyright 2015 The Vanadium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var document = require('global/document');

module.exports = PDFWidget;

// TODO(jasoncampebll): add verification for pdf object
function PDFWidget(state) {
  if (!(this instanceof PDFWidget)) {
    return new PDFWidget(state);
  }

  this.state = state;
}

PDFWidget.prototype.type = 'Widget';

PDFWidget.prototype.init = function init() {
  var widget = this;
  var element = document.createElement('canvas');
  element.setAttribute('class','pdf-canvas');
  widget.update(null, element);
  return element;
};

PDFWidget.prototype.update = function update(previous, element) {
  var widget = this;
  var state = widget.state;
  var pdf = state.pdf;

  if (!pdf && state.progress < 100) {
    return;
  }

  var device;
  var keys = Object.keys(state.devices);
  var length = keys.length;
  for (var i = 0; i < length; i++) {
    var key = keys[i];
    var value = state.devices[key];
    if (value.current) {
      device = value;
      break;
    }
  }

  var width = device ? device.screen.width : element.width;

  // TODO(jasoncampbell): It would be better to have this operation in a
  // different place and only have this widget handle the render aspect of the
  // page.
  rendering = true;
  pdf.getPage(state.pages.current).then(success, error);

  function success(page) {
    var scale = width/page.getViewport(1.0).width;
    var viewport = page.getViewport(scale);
    var context = element.getContext('2d');

    element.height = viewport.height;
    element.width = viewport.width;

    page.render({
      canvasContext: context,
      viewport: viewport
    });
  }

  function error(err) {
    process.nextTick(function() {
      throw err;
    });
  }
};
