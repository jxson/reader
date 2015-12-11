var test = require('tape');
var wd = require('wd');
var config = require('./config');
var debug = require('debug')('simple-test');
var path = require('path');
var ms = require('ms');
var waterfall = require('run-waterfall');


// NOTE: install the account manager app as part of the test
// http://appium.io/slate/en/master/?javascript#current-context
// Activity switching:
// https://discuss.appium.io/t/how-to-maintain-context-switching-between-two-activity/4864/8
// https://discuss.appium.io/t/the-new-start-activity-feature-in-appium-1-2-3/396
// NOTE: between runs the blessing chooser activity needs to be closed

test('simple', function(t) {
  var driver = wd.remote({
    host: 'localhost',
    port: 4723
  });

  t.on('end', function end() {
    debug('test ending, closing driver');
    driver.quit(function onclose(err) {
      if (err) {
        debug('error: %o', err);
        throw err;
      }
    });
  });

  log(driver);

  var tasks = [
    init,
    wait(ms('2m')),
    getCurrentActivity,
    contexts,
    wait(ms('4s')),
    selectBlessing,
    wait(ms('12s')),
  ];

  waterfall(tasks, function done(err, res) {
    if (err) {
      t.end(err);
      return;
    }

    debug('res: %o', res);

    t.ok(true);
    t.end();
  });

  function init(callback) {
    driver.init({
      browserName: '',
      'appium-version': '1.4.13',
      platformName: 'Android',
      platformVersion: '6.0',
      // platformVersion: '5.1.1',
      // adb devices
      deviceName: '8XV5T15A23006055',
      // deviceName: 'ZX1G22TXNH',
      app: path.resolve(__dirname, '../app/build/outputs/apk/app-debug.apk')
    }, done);

    function done(err) {
      if (err) {
        return callback(err);
      }

      callback(null, {});
    }
  }

  function wait(miliseconds) {
    miliseconds = miliseconds || 60;
    return task;

    function task(res, callback) {
      setTimeout(function timeout() {
        callback(null, res);
      }, miliseconds);
    }
  }

  function getCurrentActivity(res, callback) {
    driver.getCurrentActivity(function done(err, activity) {
      if (err) {
        return callback(err);
      }

      res.activity = activity;
      callback(null, res);
    });
  }

  function contexts(res, callback) {
    driver.contexts(function done(err, contexts) {
      if (err) {
        return callback(err);
      }

      res.contexts = contexts;
      callback(null, res);
    });
  }

  function selectBlessing(res, callback) {
    var selector = [
      'new UiSelector()',
      '.className("android.widget.CheckedTextView")',
      '.text("io.v.android.apps.account_manager/")'
    ].join('');

    driver.elementByAndroidUIAutomator(selector, function(err, element) {
      if (err) {
        return callback(err);
      }

      t.ok(element, 'Blessing selection UI should exist');

      element.click(function(err) {
        if (err) {
          return callback(err);
        }

        res['check-box'] = element;

        var selector = [
          'new UiSelector()',
          '.className("android.widget.Button")',
          '.text("OK")'
        ].join('');

        driver.elementByAndroidUIAutomator(selector, function(err, element) {
          if (err) {
            return callback(err);
          }

          element.click(function(err) {
            if (err) {
              return callback(err);
            }

            var selector = [
              'new UiSelector()',
              '.className("android.widget.Button")',
              '.text("Bless")'
            ].join('');

            driver.elementByAndroidUIAutomator(selector, function(err, element) {
              if (err) {
                return callback(err);
              }

              element.click(function(err) {
                if (err) {
                  return callback(err);
                }

                callback(null, res);
              });
            });


          });
        });
      });
    });
  }
});

function log(driver) {
  driver.on('status', onstatus);
  driver.on('command', oncommand);
  driver.on('http', onhttp);

  function onstatus(info) {
    debug('wd-status: %s', info);
  }

  function oncommand(method, path, data) {
    debug('wd-command: %s "%s" => %o', method, path, data);
  }

  function onhttp(method, path, data) {
    debug('wd-http: %s "%s" => %o', method, path, data);
  }
}

function worker(fn, param) {
  return job;

  function job(callback) {

  }
}

var setup = require('./helpers/setup');

test.skip('bless application', setup(function(t, devices) {
  devices.bless(function onbless(err) {
    if (err) {
      return t.error(err);
    }

    t.end();
  });
}));