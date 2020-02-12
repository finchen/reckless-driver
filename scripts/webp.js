const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');

imagemin(['src/assets/img/*.{jpg,png}'], 'src/assets/img2/', {
    use: [
        imageminWebp({ quality: 60 })
    ]
}).then(() => {
    console.log('Images optimized');
});
