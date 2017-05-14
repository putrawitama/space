module.exports = {
  staticFileGlobs: [
    'style/**.css',
    '**.html',
    'sounds/**.*',
    'scripts/**.js'
  ],
  stripPrefix: '/',
  verbose: true,
  runtimeCaching: [{
    urlPattern: /this\\.is\\.a\\.regex/,
    handler: 'networkFirst'
  }]
};
