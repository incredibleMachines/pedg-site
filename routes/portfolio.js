var debug = require('debug')('Portfolio'),
    express = require('express'),
    router = express.Router(),
    mongodb = null,
    inspect = require('util').inspect,
    serve = require('../modules/serve')

/* GET Portfolio*/

router.get('/:slug', function(req, res, next) {
  //res.send('respond :slug with a resource');
  mongodb = mongodb || req.app.get('mongodb')
  collections = collections || req.app.get('collections')

  var slug = req.params.slug

  mongodb.queryCollection('projects',{slug:slug},function(_e,_doc){
    if(_doc == null) return next()
    if(_e) return next()
    else serve.async(mongodb,collections,function(err,_data){
      if(err) return res.jsonp(502,{Error: inspect(_e)})
      else return res.render('index',{title: _doc[0].title,data:_data,page:null,project:_doc[0]})
    })
  })

});


router.post('/:slug',function(req,res){
  mongodb =  mongodb || req.app.get('mongodb')
  collections = collections || req.app.get('collections')
  var slug = req.params.slug;

  mongodb.queryCollection('projects',{slug:slug},function(_e,_doc){
      if(_e) res.jsonp(502,{Error: inspect(_e)})
      else res.jsonp(200,_doc[0])
  })

})

router.get('/', function(req, res) {
  res.send('respond with a resource');
});

module.exports = router;
