# fis-optimizer-tinypng

A optimizer for fis to compress JPG,PNG by using tinypng.

## settings

```javascript
//file : path/to/project/fis-conf.js
fis.match('/img/(*.{jpg,png,gif})', {
    optimizer: fis.plugin('tinypng', {
        to: '../output/img',
        key: 'xxxxxxxxxxxxxxxxxxxxxx'
    })
});
```
