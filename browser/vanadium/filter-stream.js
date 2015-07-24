var through = require('through2');

module.exports = filter;

// Creates a filter stream for name or prexisting names in peers
function filter(peers) {
  return through(function write(data, enc, callback) {
    var name = data.toString();

    if (!! peers[name]) {
      return callback();
    } else {
      return callback(null, data);
    }
  });
}
