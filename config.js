const path = require('path')

const env = process.env.NODE_ENV || 'development'

const envConfig = {
  env,
  path_base: __dirname,
  dir_src: 'src',
  dir_dist: 'dist',
}

const base = (...args) => path.resolve(...[envConfig.path_base, ...args])

const paths = {
  base,
  src: base.bind(null, envConfig.dir_src),
  dist: base.bind(null, envConfig.dir_dist),
}

module.exports = {
  ...envConfig,
  paths,
}
