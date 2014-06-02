var  child_process = require('child_process'),
  spawn = child_process.spawn,
  tty = require('tty'),
  util = require('util'),
  EventEmitter = require('events').EventEmitter,
  debug = require('debug')('keepup');

function Worker(command){
  this.id = command;
  this.args = command.split(' ');
  this.executable = this.args.shift();
  this.revivals = 0;
  this.crashed = false;
  this.child = null;
  this.keybindings();
  this.spawn();

  process.on('exit', this.cleanup.bind(this));
}
util.inherits(Worker, EventEmitter);

Worker.prototype.spawn = function(){
  process.nextTick(function(){
    debug('spawning');
    this.crashed = false;

    this.child = spawn(this.executable, this.args)
      .on('error', this.onError.bind(this))
      .on('message', this.onMessage.bind(this))
      .on('exit', this.onExit.bind(this));
    debug('sending start', {pid: this.child.pid});
    this.emit('start', {pid: this.child.pid});

    this.child.stdout.on('data', this.onStdout.bind(this));
    this.child.stderr.on('data', this.onStderr.bind(this));
  }.bind(this));
  return this;
};

Worker.prototype.onStderr = function(buf){
  debug(this.id, 'stderr: ' + buf.toString('utf-8'));
  this.emit('data', buf);
};

Worker.prototype.onStdout = function(buf){
  debug(this.id, 'stdout: ' + buf.toString('utf-8'));
  this.emit('data', buf);
};

Worker.prototype.onError = function(err){
  debug('error', err);
  this.emit('error', err);
};

Worker.prototype.onExit = function(code, signal){
  debug('exit', code, signal);
  if(signal === 'SIGUSR2'){
    this.emit('reload');
    return this.spawn();
  }
  else {
    this.crashed = true;
    this.emit('crash', {code: code});
  }
};

Worker.prototype.keybindings = function(){
  if(!tty.isatty(0)){
    debug('keybindings not available');
    return this;
  }
  // this.on('reload', function(){
  //   this.child.stdin.end();
  // }.bind(this));

  // this.on('crash', function(){
  //   this.child.stdin.end();
  // }.bind(this));

  // this.on('start', function(){
  //   process.stdin.resume();
  //   process.stdin.setRawMode(true);
  //   process.stdin.on('data', this.onKeydown.bind(this));
  //   debug('ctl+r → reload');
  //   debug('ctl+c → quit');
  // }.bind(this));
};

Worker.prototype.onKeydown = function(buf){
  var key = buf.toString('utf8');
  switch (key) {
    case '\u0003': // Ctrl+C
      process.exit();
      break;

    case '\u0012': // Ctrl+R
      this.reload();
      break;
  }
};

Worker.prototype.onMessage = function(data){
  debug('message', data);
  this.emit('message', data);
};

Worker.prototype.reload = function(){
  if(!this.crashed){
    debug('sending reload signal to child');
    this.child.kill('SIGUSR2');
  }
  else{
    setTimeout(function(){
      this.revivals++;
      debug('respawning');
      this.spawn();
    }.bind(this), 500);
  }
  return this;
};

Worker.prototype.stop = function(){
  this.child.kill('SIGTERM');
  return this;
};

Worker.prototype.cleanup = function(){
  debug('killing child so they are not left behind');
  this.stop();
};

module.exports = function(command){
  return new Worker(command);
};
