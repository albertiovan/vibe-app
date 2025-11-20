const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable writing IP address file during build
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Skip IP file writing
      if (req.url && req.url.includes('ip.txt')) {
        res.end('');
        return;
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
