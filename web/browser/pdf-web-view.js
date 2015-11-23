// Copyright 2015 The Vanadium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var format = require('format');
var document = require('global/document');
var domready = require('domready');
var struct = require('observ-struct');
var value = require('observ');
var window = require('global/window');

var atom = struct({
  debug: value(true),
  href: value(null),
  pdf: struct({
    document: value(null),
    page: value(null)
  }),
  pages: struct({
    current: value(1),
    total: value(0),
  }),
  scale: value(1),
  progress: value(0),
  canvas: struct({
    ratio: value(window.devicePixelRatio || 1),
    element: value(null),
    context: value(null),
    height: value(0),
  })

});

window.atom = atom;

// Allow debugging in a normal browser.
window.android = window.android || {
  setPageCount: noop
};

domready(function ondomready() {
  debug('domready');

  // Initial DOM Node setup.
  var canvas = document.createElement('canvas');
  canvas.setAttribute('class','pdf-canvas');
  // https://coderwall.com/p/vmkk6a/how-to-make-the-canvas-not-look-like-crap-on-retina
  // To manage high density screens the canvas size needs to be multiplied by
  canvas.width = window.innerWidth * atom.canvas.ratio();
  canvas.style.width = window.innerWidth + 'px';
  atom.canvas.element.set(canvas);
  // PREVENT REFLOWS NY ONLY SETTING HEIGHT ON THE FIRST PDF PAGE RENDER< OR
  // IF IT CHANGED.
  atom.canvas.height(function heightchange(height) {
    debug('height change: %s', height);
    var el = atom.canvas.element();
    var h = height * atom.canvas.ratio();
    el.height = h;

    if (atom.canvas.ratio() > 1) {
      el.style.height = h + 'px';
    }

    // canvas.height = viewport.height * ratio;
    // canvas.style.height = window.innerHeight + 'px';
  });

  var context = canvas.getContext('2d');
  context.scale(2, 2);
  atom.canvas.context.set(context);

  document.body.style.margin = '0px';
  document.body.style.padding = '0px';
  document.body.appendChild(canvas);

  // Watch for changes on the atom.href value, when it updates load the PDF file
  // located at that location.
  // Trigger with: atom.href.set(value)
  atom.href(function hrefchange(href) {
    debug('loading pdf file: %s', href);
    PDFJS
      .getDocument(href, null, password, progress)
      .then(setPDF, error);
  });

  // Watch for page number changes and asyncronosly load the page from PDF.js
  // APIs.
  // Trigger with: atom.pages.current.set(value)
  atom.pages.current(function pagechange(current) {
    var total = atom.pages.total();

    // Skip invalid operations.
    if (current === 0 || !atom.pdf.document() || current > total) {
      return;
    }

    debug('loading page: %s of %s', current, total);

    var pdf = atom.pdf.document();
    var success = atom.pdf.page.set.bind(null);
    pdf.getPage(current).then(success, error);
  });

  // Watch for the total page number changes and give the new value to the
  // Android client.
  atom.pages.total(function totalchange(current) {
    window.android.setPageCount(current);
  });

  // Watch for changes on the PDF.js page object. When it is updated trigger a
  // render.
  // TODO(jasoncampbell): To prevent rendering errors with frequent state
  // updates renders should be queued in a raf.
  atom.pdf.page(function pagechange(page) {
    debug('rendering page');

    var width = page.getViewport(1).width;
    var scale = window.innerWidth / width;
    var viewport = page.getViewport(scale);

    if (atom.canvas.height() !== viewport.height) {
      atom.canvas.height.set(viewport.height);
    }

    page.render({
      canvasContext: atom.canvas.context(),
      viewport: viewport
    }).promise.then(noop, error);
  });
});

function setPDF(pdf) {
  atom.pdf.document.set(pdf);
  atom.pages.total.set(pdf.numPages);
  atom.pages.current.set(1);
}

function progress(update) {
  var float = (update.loaded/update.total) * 100;
  var value = Math.floor(float);

  // For some reason the update.loaded value above can be higher than the
  // update.total value, in that case we can assume the progress is 100%.
  if (value > 100) {
    value = 100;
  }

  atom.progress.set(value);
}

function password() {
  debug('password required');
}

// TODO(jasoncampbell): Add better error reporting and exception capturing.
function error(err) {
  debug('error: %s', err.stack);
}

function noop() {}

function debug(template, args) {
  // Noop if debugging is disabled.
  if (!atom.debug()) {
    return;
  }

  // The logging in Android Studio only shows the template string when calling
  // console.log directly, pre-fromatting allows the logs to show the correct
  // information.
  template = 'pdf-viewer: ' + template;
  var message = format.apply(null, arguments);
  console.log(message);
}
