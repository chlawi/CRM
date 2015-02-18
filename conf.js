// Protractor configuration file: config.js
exports.config = {

  // Your test script communicates directly with Chrome Driver or Firefox Driver, bypassing any Selenium Server. If this is true, settings for
  // seleniumAddress and seleniumServerJar will be ignored. If you attempt to use a browser other than Chrome or Firefox an error will be thrown. The
  // advantage of directly connecting to browser drivers is that your test scripts may start up and run faster.
  directConnect: true,

  // The address of a running selenium server.
  seleniumAddress: 'http://localhost:4444/wd/hub',


  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome'
  },

  multiCapabilities: [ {
    'browserName': 'chrome'
  }],

  // Spec patterns are relative to the current working directly when
  // protractor is called.
  //specs: ['example_spec.js', 'index-spec.js'],
  specs: ['index-spec.js'],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  }
};
