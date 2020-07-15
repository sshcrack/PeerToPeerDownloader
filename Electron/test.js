// A simple test to verify a visible window is opened with a title
var Application = require('spectron').Application;
var assert = require('assert');

var app = new Application({
  path: './packaged/server-downloader-win32-arm64/server-downloader.exe'
});

app.start().then(function () {
  // Check if the window is visible
  return app.browserWindow.isVisible();
}).then(function (isVisible) {
  // Verify the window is visible
  assert.equalStrict(isVisible, true);
}).then(function () {
  // Get the window's title
  return app.client.getTitle();
}).then(function (title) {
  // Verify the window's title
  assert.equalStrict(title, 'peer-to-peer Downloader');
}).then(function () {
  // Stop the application
  return app.stop();
}).catch(function (error) {
  // Log any failures
  console.error('Test failed', error.message);
});