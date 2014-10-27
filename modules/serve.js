var async = require('async')

//a function to serve up our data model to our main pages - admin & index
module.exports.main = function(page,view,section){
  return function(req, res) {
    mongodb =  mongodb || req.app.get('mongodb')
    collections = collections || req.app.get('collections')
    var data = {}
    //iterate through our known collections
    //compile a function for async parallel for each collection
    //returning a result of the data for each element in the DB Collection

    for(var coll in collections){
      /*in order to retain or current collection (_coll) we create a anonymous function
        which returns the function async wants we pass coll to our anon function inline
      */
      data[coll] = function(_coll){
        return function(callback){
          //debug("RUNNING ASYNC: "+_coll)
          mongodb.getAll(_coll,function(err,_data){
            if(err) callback(err)
            else callback(null,_data)
          })
        }
      }(coll)
    }

    //run the functions for each coll we compiled
    //on completion function(_err,result) is called
    //_result contains all our DB data to pass to the admin page

    async.parallel(data,function(_err,_result){
      //debug(_err)

      if(_err){
        debug(_err)
        return res.jsonp(502,{Error:_err})
      }else{
        if(section!=null) return res.render(page,{title:' PEDG '+page, data:_result, project: null,page:section})
        else  return res.render(page,{title:' PEDG '+page, data:_result, project: null, page:null})

      }
      //debug(inspect(_result))
    })

  }
}

module.exports.async = function(mongodb,collections,callback){

  var data = {}
  for(var coll in collections){
    /*in order to retain or current collection (_coll) we create a anonymous function
      which returns the function async wants we pass coll to our anon function inline
    */
    data[coll] = function(_coll){
      return function(callback){
        //debug("RUNNING ASYNC: "+_coll)
        mongodb.getAll(_coll,function(err,_data){
          if(err) callback(err)
          else callback(null,_data)
        })
      }
    }(coll)
  }
  //run the functions for each coll we compiled
  //on completion function(_err,result) is called
  //_result contains all our DB data to pass to the admin page

  async.parallel(data,function(_err,_result){
    //debug(_err)

    if(_err){
      debug(_err)
      //res.jsonp(502,{Error:_err})
      return callback(_err,null)
    }else{
      return callback(null,_result)
      //res.render(page,{title:' PEDG '+page, data:_result, project: null})
    }
    //debug(inspect(_result))
  })

}
