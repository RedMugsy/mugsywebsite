var page = require('webpage').create();
page.settings.resourceTimeout = 60000;
page.onConsoleMessage = function(msg, lineNum, sourceId) {
  console.log('PAGE LOG:', msg);
};
page.onError = function(msg, trace) {
  console.log('PAGE ERROR:', msg);
  trace.forEach(function(item) {
    console.log('  ', item.file, ':', item.line);
  });
};
page.open('https://redmugsy.com/#/treasure-hunt/register', function(status) {
  console.log('STATUS:', status);
  if (status !== 'success') {
    phantom.exit(1);
    return;
  }
  window.setTimeout(function() {
    phantom.exit();
  }, 5000);
});
