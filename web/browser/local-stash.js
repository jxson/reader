
var window = require('global/window');

module.exports = stash;
module.exports.get = get;
module.exports.set = set;
module.exports.del = del;

function stash(key, value){
  if (! value) {
    return get(key);
  } else {
    return set(key, value);
  }
}

function get(key){
  var local = window.localStorage.getItem(key);

  return JSON.parse(local);
}

function set(key, value){
  value = JSON.stringify(value);

  window.localStorage.setItem(key, value);
}

function del(key){
  window.localStorage.removeItem(key);
}
