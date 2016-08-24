# fis-optimizer-tinypng

A optimizer for fis to compress JPG,PNG by using tinypng.
## use
```node
npm install --save fis-optimizer-tinypng
```
Application for key
https://tinypng.com/developers

## settings
```javascript
//file : path/to/project/fis-conf.js
fis.match('/img/(*.{jpg,png})', {
    optimizer: fis.plugin('tinypng', {
        to: '../output/img',
        key: 'xxxxxxxxxxxxxxxxxxxxxx'
    })
});
```
