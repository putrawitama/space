module.exports = {
  staticFileGlobs: [
    'style/**.css',
    'image/cover.png',
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
