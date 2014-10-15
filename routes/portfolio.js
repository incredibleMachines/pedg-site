var debug = require('debug')('Portfolio'),
    express = require('express'),
    router = express.Router(),
    mongodb = null,
    inspect = require('util').inspect

/* GET Portfolio*/
router.get('/', function(req, res) {
  res.send('respond with a resource');
});


router.get('/:slug', function(req, res) {
  res.send('respond :slug with a resource');
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

module.exports = router;
