const http = require('http'),
  express = require('express'),
  path = require('path'),
  pug = require('pug'),
  items = require('./data');

var app = express();
const MAX_ITEM_PP = 10;
const MAX_DB_DOC = 100;
const ITEM_PP_DEFAULT = 10;

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/prod/load/:page/:itemsPerPage?', function(req, res) {
  var params = req.params;
  var page = params.page;
  var itemsPP = params.itemsPerPage;

  if (itemsPP > MAX_ITEM_PP) {
    return res.status(400).send('Too many items requested per page: ' + itemsPP);
  } else if (itemsPP == undefined) {
    itemsPP = ITEM_PP_DEFAULT;
  }

  if (page < 1 || page % 3 == 0 || page % 5 == 0) {
    return res.status(400).send('Invalid page number requested: ' + page);
  }

  //bound indices, not value of Number in json obj
  var upperBound = (itemsPP * page);
  var lowerBound = upperBound - (itemsPP);

  var req_items = items.slice(lowerBound, upperBound);
  res.status(200).send(req_items);
});

app.use(function (req,res) {
  res.render('404', {url:req.url});
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'))
});
