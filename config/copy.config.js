
// https://ionicacademy.com/ionic-include-css-files-from-npm/
// https://github.com/ionic-team/ionic-app-scripts/blob/master/config/copy.config.js
// 
// this is a custom dictionary to make it easy to extend/override
// provide a name for an entry, it can be anything such as 'copyAssets' or 'copyFonts'
// then provide an object with a `src` array of globs and a `dest` string
module.exports = {
  copyAssets: {
    src: ['{{SRC}}/assets/**/*'],
    dest: '{{WWW}}/assets'
  },
  copyIndexContent: {
    src: ['{{SRC}}/index.html', '{{SRC}}/manifest.json', '{{SRC}}/service-worker.js'],
    dest: '{{WWW}}'
  },
  copyFonts: {
    src: ['{{ROOT}}/node_modules/ionicons/dist/fonts/**/*', '{{ROOT}}/node_modules/ionic-angular/fonts/**/*'],
    dest: '{{WWW}}/assets/fonts'
  },
  copyPolyfills: {
    src: [`{{ROOT}}/node_modules/ionic-angular/polyfills/${process.env.IONIC_POLYFILL_FILE_NAME}`],
    dest: '{{BUILD}}'
  },
  copySwToolbox: {
    src: ['{{ROOT}}/node_modules/sw-toolbox/sw-toolbox.js'],
    dest: '{{BUILD}}'
  },
  copyLeafletCss: {
    src: '{{ROOT}}/node_modules/leaflet/dist/leaflet.css', 
    dest: '{{BUILD}}/leaflet'
  },
  copyLeafletImages: {
    src: '{{ROOT}}/node_modules/leaflet/dist/images/*',
    dest: '{{BUILD}}/leaflet/images'
  },
  copyLeafletRoutingCss: {
    src: '{{ROOT}}/node_modules/leaflet-routing-machine/dist/leaflet-routing-machine.css',
    dest: '{{BUILD}}/leaflet'
  },
  copyGeocoderCss: {
      src: '{{ROOT}}/node_modules/leaflet-control-geocoder/dist/Control.Geocoder.css',
      dest: '{{BUILD}}/leaflet/geocoder'
  },
  copyGeocoderImages: {
      src: '{{ROOT}}/node_modules/leaflet-control-geocoder/dist/images/*',
      dest: '{{BUILD}}/leaflet/geocoder/images'
  }
}
