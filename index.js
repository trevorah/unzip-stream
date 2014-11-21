var fs = require('fs');
var temp = require('temp');
var DecompressZip = require('decompress-zip');

module.exports = function(cb) {
  var stream = temp.createWriteStream();
  cleanFileStreamWhenDone(stream);

  stream.on('error', cb);
  stream.on('finish', function() {
      var zipFilePath = stream.path;
      temp.mkdir('zip_contents', function(err, zipContentsPath) {
        if (err) return cb(err);

        var unzipper = new DecompressZip(zipFilePath);
        var extraction = unzipper.extract({ path: zipContentsPath });
        extraction.on('error', cb);
        extraction.on('extract', function(log) {
          var fileStreams = log.map(function(logEntry) {
            var file = zipContentsPath + '/' + logEntry.deflated;
            var fileStream = fs.createReadStream(file);
            cleanFileStreamWhenDone(fileStream);

            return fileStream;
          });

          cb(null, fileStreams);
        });
      });
    });

  return stream;
};

function cleanFileStreamWhenDone(stream) {
  var tempFile = stream.path;

  var removeTempFile = function() {
    fs.exists(tempFile, function(exists) {
      if (!exists) return;

      fs.unlink(tempFile, function(err) {
        if (err) return console.error(err);
      });
    });
  };

  stream.on('close', removeTempFile);
}
