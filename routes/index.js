var express = require('express');
var router = express.Router();
var serve = require('../modules/serve')
var bcrypt = require('bcrypt')
var mongodb = null

/* GET home page. */
router.get('/', serve.main('index',''));
/* GET about page. */
router.get('/about', serve.main('index','| About','#about'));
/* GET portfolio page. */
router.get('/portfolio', serve.main('index','| Portfolio','#portfolio'));
/* GET clients page. */
router.get('/clients', serve.main('index','| Clients','#clients'));
/* GET contact page. */
router.get('/contact', serve.main('index','| Contact','#contact'));
router.get('/reel', serve.main('index','| Reel','#reel'));

/* Auth Setup & Login Routes */
router.get('/login',function(req,res){
  res.render('login',{user:req.user})
})

router.post('/login',function(req,res,next){
    console.log('Post on /login');
    console.log(req.body)
    return req.app.get('passport').authenticate('login', function(err, user, info){
        // PS: You can also inspect err/user here to see if everything else is working properly
        if(err) return next(err)
        if(!user) return res.redirect('/login')
        req.logIn(user,function(_err,user,info){
          if(_err) return next(_err)
          return res.redirect('/admin')
        })
        //console.log(info)
    })(req, res, next);
    //req.app.get('passport').authenticate('local',{successRedirect:'/admin',failureRedirect:'/admin/login'})
})

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.get('/setup',function(req,res){
  res.render('setup',{user:req.user})
})
router.post('/setup',function(req,res,next){
  mongodb =  mongodb || req.app.get('mongodb')
  var post = req.body
  console.log(post)
  var obj = {}
  bcrypt.genSalt(10,function(err,salt){
    bcrypt.hash(post.password,salt,function(_err,hash){
      obj.user = post.user
      obj.password = hash
      mongodb.add('users',obj,function(e,_doc){
        if(e) res.redirect(302,'/setup')
        else res.redirect('/admin')
      })

    })
  })


})

/*
function serve(page){
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
      // -- replaceme
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
        res.render('index',{title:' PEDG '+page, data:_result})
      }
      //debug(inspect(_result))
    })

  }
}
*/
module.exports = router;
