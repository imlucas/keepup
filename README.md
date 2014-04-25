# keepup

[![build status](https://secure.travis-ci.org/imlucas/keepup.png)](http://travis-ci.org/imlucas/keepup)

turns out it's too simple to just get the parts of up/nodemon/etc that i
actually want in about 100 lines.

## Example

```
var keepup = require('keepup'),
  gulp = require('gulp'),
  server;

gulp.task('server', function(){
  server = keepup('node server/index.js')
    .on('start', function(data){
      console.log('server started');
    })
    .on('crash', function(data){
      console.log('server crashed', data.captured);
    })
    .on('reload', function(){
      console.log('server is reloading');
    });
});

gulp.task('server reload', function(){
  server.reload();
});

gulp.task('watch', function(){
  gulp.watch(['server/{*,**/*}.js'], ['server reload']);
});
```

## Install

```
npm install keepup
```

## Test

```
npm test
```

## License

MIT
