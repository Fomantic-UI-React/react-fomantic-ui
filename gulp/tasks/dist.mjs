import gulp from 'gulp'
import rimraf from 'rimraf'

import sh from '../sh.mjs'
import config from '../../config.js'

const { dest, task, series, src, parallel } = gulp
const { paths } = config

// ----------------------------------------
// Clean
// ----------------------------------------

task('clean:dist', (cb) => {
  rimraf(`${paths.dist()}/*`, cb)
})

// ----------------------------------------
// Build
// ----------------------------------------

task('build:dist:commonjs:js', (cb) => {
  sh(`yarn cross-env NODE_ENV=build babel ${paths.src()} -d ${paths.dist('commonjs')}`, cb)
})

task('build:dist:commonjs:tsd', () =>
  src(paths.src('**/*.d.ts')).pipe(dest(paths.dist('commonjs'))),
)

task('build:dist:commonjs', parallel('build:dist:commonjs:js', 'build:dist:commonjs:tsd'))

task('build:dist:es', (cb) => {
  sh(`yarn cross-env NODE_ENV=build-es babel ${paths.src()} -d ${paths.dist('es')}`, cb)
})

task('build:dist:umd', (cb) => {
  sh(
    // --openssl-legacy-provider: webpack 4 hashes with MD4, which OpenSSL 3
    // (Node 17+) refuses. Removable once the bundler is replaced.
    `yarn cross-env NODE_ENV=build-umd NODE_OPTIONS=--openssl-legacy-provider webpack --config ${paths.base(
      'webpack.umd.config.js',
    )}`,
    cb,
  )
})

task('build:dist', parallel('build:dist:commonjs', 'build:dist:es', 'build:dist:umd'))

// ----------------------------------------
// Default
// ----------------------------------------

task('dist', series('clean:dist', 'build:dist'))
