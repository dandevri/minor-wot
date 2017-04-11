var express = require('express');

var port = process.env.PORT || '3000';
var host = process.env.HOST || '0.0.0.0';

var app = express();

app.use(express.static('src'))
  .set('views', 'views');

app.listen(port, host, function () {
  console.log('Server running', host, ':', port);
});
