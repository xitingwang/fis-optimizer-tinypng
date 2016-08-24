# fis-optimizer-tinypng

A optimizer for fis to compress JPG,PNG by using tinypng.

## settings

Application for key
https://tinypng.com/developers

```javascript
//file : path/to/project/fis-conf.js
fis.match('/img/(*.{jpg,png})', {
    optimizer: fis.plugin('tinypng', {
        to: '../output/img',
        key: 'xxxxxxxxxxxxxxxxxxxxxx'
    })
});
```
