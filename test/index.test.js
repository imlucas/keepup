var keepup = require('../');

describe('keepup', function(){
  it('should work', function(done){
    var app, started = false, reloaded = false;

    app = keepup('node ' + __dirname + '/child.js')
      .on('start', function(data){
        if(reloaded && started) return done();
        app.reload();
        started = true;
      })
      .on('error', function(err){done(err);})
      .on('reload', function(){reloaded = true;});
  });

  it('should be able to reload after a crash', function(done){
    var app, crashed = false, reloaded = false;

    app = keepup('node ' + __dirname + '/crashy.js')
      .on('start', function(data){
        if(crashed && started) return done();
        started = true;
      })
      .on('crash', function(data){
        app.reload();
        crashed = true;
      })
      .on('reload', function(){
        reloaded = true;
      });
  });
});
