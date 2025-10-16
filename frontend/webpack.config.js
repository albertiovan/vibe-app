const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add proxy for API requests to bypass CORS issues
  if (config.devServer) {
    config.devServer.proxy = {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug'
      }
    };
  }
  
  return config;
};
