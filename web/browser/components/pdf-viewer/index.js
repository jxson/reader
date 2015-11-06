
var format = require('format');
var PDFWidget = require('./pdf-widget');
var read = require('./read-file');
var debug = require('debug')('reader:pdf-viewer');
var hg = require('mercury');
var h = require('mercury').h;
var insert = require('insert-css');
var css = require('./pdf-viewer.css');

module.exports = {
  state: state,
  render: render
};

function state(options) {
  options = options || {};

  var atom = hg.state({
    deviceSet: hg.value(options.deviceSet),
    pdf: hg.value(null),
    error: hg.value(null),
    progress: hg.value(0),
    pages: hg.varhash({
      total: 1,
      current: 1,
    })
  });

  atom.deviceSet(function (deviceSet) {
    load(atom, { blob: deviceSet.file.blob() });
  });

  return atom;
}

function render(state, channels) {
  insert(css);

  debug('=== render ===');
  debug('device-set %o', state.deviceSet());

  var children = [];

  if (state.progress < 100) {
    var node = h('.progress', [
      h('.progress-bar', {
        style: { width: state.progress + '%' }
      })
    ]);

    children.push(node);
  } else {
    children.push(hg.partial(controls, state, channels));
    children.push(h('.pdf', new PDFWidget(state)));
  }

  return h('.pdf-viewer', children);
}

function controls(state, channels) {
  return h('.pdf-controls', [
    h('a.back', {
      href: '/',
    }, [
      h('i.material-icons', 'arrow_back')
    ]),
    h('.title', 'File title'),
    h('.pager', [
      h('.meta', format('Page: %s of %s', 10, 20)),
      h('a.previous', {
        href: '#'
      }, [
        h('i.material-icons', 'chevron_left'),
      ]),
      h('a.next', {
        href: '#'
      }, [
        h('i.material-icons', 'chevron_right'),
      ])
    ]),
    h('a.menu', [
      h('i.material-icons', 'more_vert'),
    ])
  ]);
}

// SEE: https://jsfiddle.net/6wxnd9uu/6/
function load(state, data) {
  if (! data.blob) {
    return;
  }

  state.progress.set(0);

  debug('loading Blob into PDFJS: %o', data.blob);

  var blob = data.blob;
  var source = { length: blob.size };
  var transport = new PDFJS.PDFDataRangeTransport();

  transport.count = 0;
  transport.file = blob;
  transport.length = blob.size;
  transport.requestDataRange = requestDataRange;

  function requestDataRange(begin, end) {
    var chunk = blob.slice(begin, end);

    read(chunk, function onread(err, result) {
      transport.count += end - begin;
      transport.onDataRange(begin, new Uint8Array(result));
    });
  }

  PDFJS
  .getDocument(source, transport, password, progress)
  .then(success, error);

  function password() {
    var err = new Error('Password required');
    state.error.set(err);
  }

  function progress(update) {
    var float = (update.loaded/update.total) * 100;
    var value = Math.floor(float);

    if (value > 100) {
      value = 100;
    }

    state.progress.set(value);
  }

  function success(pdf) {
    state.pdf.set(pdf);
    state.pages.put('current', 1);
    state.pages.put('total', pdf.numPages);
  }

  function error(err) {
    state.error.set(err);
  }

}