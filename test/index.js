var fs = require('fs');
var concat = require('concat-stream');
var assert = require('assert');
var unzipStream = require('..');

describe('unzip-stream', function() {
  it('extracts the contents of a zip with a single file inside', function(done) {
    fs.createReadStream(__dirname + '/example.zip')
      .pipe(unzipStream(function(err, fileStreams) {
        if (err) done(err);

        fileStreams[0].pipe(concat({ encoding: 'string'}, function(data) {
          assert.equal(data, 'hey there!');
          done();
        }));
      }));
  });

  it('cleans up after extracting', function(done) {
    fs.createReadStream(__dirname + '/example.zip')
      .pipe(unzipStream(function(err, fileStreams) {
        if (err) done(err);

        var fileStream = fileStreams[0];
        fileStream.pipe(concat({ encoding: 'string'}, function(data) {
          setTimeout(function() {
            // all temp files should be gone by now
            fs.exists(fileStream.path, function(exists) {
              assert(!exists, 'Temp file still exists at ' + fileStream.path);
              done();
            });
          }, 10);
        }));
      }));
  });
});
