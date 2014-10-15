var debug = require('debug')('Database');
var MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    BSON = require('mongodb').BSONPure,
    _ = require('underscore')



var database, collection = {}

var _this=null

function MongoConnect(opts,cb){

    _this = this

    this.collections = opts.collections || {test:null}
    this.database = opts.database || 'test'
    this.port = opts.port || 27017
    this.ip = opts.ip || 'localhost'

    this.mongo = new MongoClient(new Server(this.ip, this.port))

    debug('-------------------------')
    debug('Starting Mongo Connection')

    this.mongo.open(function(err,mongo){
      if(err) throw err
      _this.MongoDB = mongo.db(_this.database)
      debug('Success Connected to DB '+_this.database)
      //set up our collections
      for(var coll in _this.collections){
        //debug(coll)
        _this.collections[coll] = _this.MongoDB.collection(coll)

      }

      //debug(_this)
    })
}

//_doc = mongo document to add
//_type = collection name
//_cb = callback(err,db_document{})

//returns mongo Document inserted
MongoConnect.prototype.add = function(_type,_doc,_cb){

	this.collections[_type].insert(_doc,function(e){

		if(!e) _cb(null,_doc);
		else _cb(e);
	})
}
//returns all the results within a collection
//_type = collection name
//_cb = callback(err,collection[])
//returns mongodb Collection as an Array

MongoConnect.prototype.getAll = function(_type,_cb){

	this.collections[_type].find().toArray(function(e,_data){

		if(!e) _cb(null,_data);
		else _cb(e);
	})
}

//_type = collection name
//_query = your formatted mongodb query
//_cb = callback(err,collection[])
//returns mongodb Collection as an Array
MongoConnect.prototype.queryCollection = function(_type, _query,_opts, _cb){
  if(_.isFunction(_opts) || _.isNull(_cb)) {
    _cb = _opts
    _opts = {}
  }

  this.collections[_type].find(_query,_opts).toArray(function(e,_data){
		if(!e) _cb(null,_data);
		else _cb(e);
	})
}
//remove a document
//_type = collection name
//_what = collection query
//_cb = callback(e)
MongoConnect.prototype.remove = function(_type,_what,_cb){

	this.collections[_type].remove(_what,function(e){
		if(!e) _cb(null)
		else _cb(e)
	})
}
//update a document
//_type = collection name
//_what = collection query
//_updateObj = the update operation which needs to take place
MongoConnect.prototype.update=function(_type,_what,_updateObj,_cb){

	this.collections[_type].update(_what,_updateObj,{multi:true},function(e){
		if(!e) _cb(null);
		else _cb(e)
	});
}

//update a document by providing a mongodb ID string
//_type = collection name
//_id = string as mongo id
//_updateObj = the update operation which needs to take place
//_cb = callback(err)
MongoConnect.prototype.updateByID=function(_type,_id,_updateObj,_cb){

	this.collections[_type].update({_id: makeMongoID(_id)},_updateObj,{upsert:true,multi:true},function(e){
		if(!e) _cb(null);
		else _cb(e)
	})
}

//get a mongo document by collection and string id
//_type = collection type
//_id = mongodb id as string
//_cb = callback(err,_document)
MongoConnect.prototype.getDocumentByID=function(_type,__id,_cb){
	this.collections[_type].findOne({_id:makeMongoID(__id)},function(e,_doc){
		if(!e) _cb(null,_doc)
		else _cb(e);
	})

}

/* FUNCTIONS */

function makeMongoID(__id){

	if(typeof __id == "object") return __id;
	if(typeof __id == "string" && __id.length == 24) return new BSON.ObjectID(__id.toString());
	else return '';
}

module.exports = MongoConnect
