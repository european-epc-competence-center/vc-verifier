const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production'
    ? '/' + process.env.PUBLIC_PATH + '/'
    : '/',
  configureWebpack: {
      devServer: {
        headers: { 'Access-Control-Allow-Origin': '*' }
      }
    }
})
