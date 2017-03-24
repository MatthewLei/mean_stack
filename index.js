const http = require('http'),
  util = require('util'),
  express = require('express'),
  path = require('path'),
  MongoClient = require('mongodb').MongoClient,
  Server = require('mongodb').Server,
  pug = require('pug'),
  CollectionDriver = require('./collectionDriver').CollectionDriver;

var obj = require('./data');
console.log(obj);


var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//set up mongodb
var mongoHost = 'localHost'; //change if hosted elsewhere
var mongoPort = 27017;
var url = 'mongodb://' + mongoHost + ':' + mongoPort + '/MyDatabase';
var collectionDriver;

var mongoClient = new MongoClient(new Server(mongoHost, mongoPort));
mongoClient.connect(url, function(err, db) {
  if (err) {
      console.error("Error! Exiting... Must start MongoDB first");
      process.exit(1);
  }
  collectionDriver = new CollectionDriver(db);
});

app.use(express.static(path.join(__dirname, 'public')));

// app.get('/prod/load/:page', function(req, res) {
//   var params = req.params;
//   console.log('req.params: ' + params);
//
//   collectionDriver.findAll(req.params.collection, function(error, objs) {
//     if (error) {
//       res.status(400).send(error);
//     } else if (objs == '') {
//       res.status(204).send('No objects obtained');
//     } else {
//       console.log('req.get("Accept"): ' + req.get('Accept'));
//       if (req.accepts('*/*') || req.accepts('application/json')) {
//         res.set('Content-Type','application/json');
//         res.status(200).send(objs);
//         // res.render('data',{objects: objs, collection: req.params.collection});
//       } else if (req.accepts('application/xml')) {
//         objs.forEach(function(item) {
//           //wonky _id invalid char bug
//           item._id = item._id.toString();
//         });
//         res.set('Content-Type', 'application/xml');
//         var xmlObjs = xmlParser.parse('Documents', objs);
//         res.status(200).send(xmlObjs + '\n');
//       } else {
//         res.status(406).send('Not acceptable Accept type');
//       }
//     }
//   });
// });

app.get('/prod/load/:page/:itemsPerPage?', function(req, res) {
  var params = req.params;
  var page = params.page;
  var itemsPP = params.itemsPerPage;
  console.log('page: ' + page);
  console.log('itemsPP: ' + itemsPP);

  if (itemsPP == undefined) {
    itemsPP = 10;
  }

  // if (entity) {
  //   collectionDriver.get(collection, entity, function(error, objs) {
  //     if (error) { res.status(400).send(error); }
  //     else { res.send(200, objs); }
  //   });
  // } else {
  //   res.send(400, {error: 'bad url', url: req.url});
  // }
  res.status(400).send('Temp error');
});


app.use(function (req,res) {
  console.log('catchall error');
  res.render('404', {url:req.url});
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'))
});
