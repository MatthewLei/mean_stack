const http = require('http'),
  express = require('express'),
  path = require('path'),
  Db = require('mongodb').Db,
  MongoClient = require('mongodb').MongoClient,
  Server = require('mongodb').Server,
  pug = require('pug'),
  obj = require('./data');

var app = express();
const MAX_ITEM_PP = 10;
const MAX_DB_DOC = 100;
const ITEM_PP_DEFAULT = 10;

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//set up mongodb
var mongoHost = 'localHost'; //change if hosted elsewhere
var mongoPort = 27017;
var url = 'mongodb://' + mongoHost + ':' + mongoPort + '/PersonDatabase';
var collection;

var mongoClient = new MongoClient(new Server(mongoHost, mongoPort));
mongoClient.connect(url, function(err, db) {
  if (err) {
      console.error("Error! Exiting... Must start MongoDB first");
      process.exit(1);
  }

  db.collection('PersonCollection', {strict:true}, function(err, result){
    if (err) {
      db.createCollection('PersonCollection', {max:MAX_DB_DOC}, function(err, result){
        console.log('new collection created');
        collection = db.collection('PersonCollection');
        collection.insert(obj);
      });
    } else {
      console.log('using existing collection');
      collection = db.collection('PersonCollection');
    }
  });
});

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

  var upperBound = itemsPP * page;
  var lowerBound = upperBound - (itemsPP - 1);

  var query = {Number: {$gte: lowerBound, $lte: upperBound}};
  collection.find(query).toArray(function(err, result){
    if (err) {
      res.status(400).send(err);
    } else {
      //remove _id field
      result.forEach(function(item){
        delete item._id;
      });
      res.status(200).send(result);
    }
  });
});

app.use(function (req,res) {
  res.render('404', {url:req.url});
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'))
});
