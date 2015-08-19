// Copyright 2015 The Vanadium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

var leveljs = require('level-js');
var debug = require('debug')('reader:pdf-store');
var db = leveljs('pdf-store');
var series = require('run-series');
var IteratorStream = require('level-iterator-stream');
var eos = require('end-of-stream');
var options = { raw: true };
var format = require('format');
var EventEmitter = require('events').EventEmitter;
var ee = new EventEmitter();

module.exports = {
  all: all,
  get: get,
  put: put,
  del: del,
  on: ee.on.bind(null)
};

function emit(name) {
  ee.apply(ee, arguments);
}

// TODO(jasoncampbell): It might be better to stream the records in and take
// cursor options so the UI can update quicker and provide controls for
// pagination.
function all(callback) {
  db.open(onopen);

  function onopen(err) {
    if (err) {
      debug('open error: %s\ns', err.message, err.stack);
      return callback(err);
    }

    var records = [];
    var stream = new IteratorStream(db.iterator());

    stream.on('data', function push(data) {
      records.push(data);
    });

    eos(stream, function done(err) {
      if (err) {
        debug('iterator stream error: %s\ns', err.message, err.stack);
        return callback(err);
      }

      callback(null, records);
    });
  }
}

function get(key, callback) {
  debug('get: %s', key);

  var tasks = [
    db.open.bind(db),
    db.get.bind(db, key, options)
  ];

  series(tasks, function done(err, results) {
    if (err) {
      debug('get error: %s\ns', err.message, err.stack);
      return callback(err);
    }

    // The value is the result of the last task.
    var last = results.length - 1;
    var value = results[last];

    if (value.size === 0) {
      // TODO(jasoncampbell): figure out why blobs from indexedDB will randomly
      // have a size === 0
      var message = format('PDF: %s has a zero size', key);
      return callback(new Error(message));
    }

    debug('get success: %o', value);
    callback(null, value);
  });
}

function put(key, value, callback) {
  var tasks = [
    db.open.bind(db),
    db.put.bind(db, key, value, options),
    db.get.bind(db, key, options)
  ];

  series(tasks, function done(err, results){
    if (err) {
      debug('put error: %s\ns', err.message, err.stack);
      return callback(err);
    }

    var last = results.length - 1;
    var value = results[last];
    var record = {
      key: key,
      value: value
    };

    debug('get success: %o', value);
    emit('put', record);
    callback(null, record);
  });
}

function del(key, callback) {
  var tasks = [
    db.del.bind(db, key, options, callback),
  ];

  series(tasks, function done(err, results) {
    if (err) {
      debug('del error: %s\n%s', err.message, err.stack);
      return callback(err);
    } else {
      return callback();
    }
  });
}
