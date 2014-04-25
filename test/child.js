var http = require('http');

var srv = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('hello');
});
srv.listen(5555, function(){
  console.log('listening on 5555');
});
