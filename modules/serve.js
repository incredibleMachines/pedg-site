var async = require('async')

//a function to serve up our data model to our main pages - admin & index
module.exports = function(page,view){
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
        res.jsonp(502,{Error:_err})
      }else{
        res.render(page,{title:' PEDG '+page, data:_result})
      }
      //debug(inspect(_result))
    })

  }
}
