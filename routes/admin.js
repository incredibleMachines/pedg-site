var debug = require('debug')('Admin')
    inspect = require('util').inspect,
    fs = require('fs'),
    multiparty = require('multiparty'),
    _ = require('underscore'),
    async = require('async'),
    express = require('express'),
    bcrypt = require('bcrypt'),
    helper = require('../modules/helper'),
    serve = require('../modules/serve'),
    router = express.Router(),
    projects=[],
    page = 'admin',
    mongodb = null,
    collections = null
    //passport = null

router.all('*',ensureAuthenticated)
function ensureAuthenticated(req, res, next) {
  mongodb =  mongodb || req.app.get('mongodb')
  mongodb.getAll('users',function(e,doc){
    if(doc.length == 0 ) return res.redirect('/setup')
    else if(req.isAuthenticated()) return next()
    else return res.redirect('/login')
  })
}

/*Check for valid types only*/
router.use('/:type',function(req, res, next) {
    collections = collections || req.app.get('collections')
    if(collections.hasOwnProperty(req.params.type)|| req.params.type == 'login') next()
    else res.jsonp(502,{Error:'Unknown Type', Reference: req.params.type})
  }
 )

/* GET Admin Page*/
/* Serve Login Serve Page*/
router.get('/', serve.main('admin',' | Admin'));


/* GET Admin Page - Single Project*/
/* Serve Login Serve Page*/
router.get('/:type/:slug', function(req, res,next) {
  mongodb =  mongodb || req.app.get('mongodb')
  var type = req.params.type
  var slug = req.params.slug
  mongodb.queryCollection(type,{slug:slug},function(e,_doc){
    if(e) return res.jsonp(502,{Error:'DB Query Error: ', Reference: inspect(e)})
    if(_doc.length == 0 ) return next()
    return res.render('single',{title: 'PEDG | Admin - '+type+' '+slug, type: type, doc:_doc[0]})
  })
  //res.jsonp({TODO:'view-project',req:{type:type,slug:slug}})
});

/* GET Admin Page - Single Project*/
/* Serve Login Serve Page*/
router.get('/:type/:slug/delete', function(req, res) {
  mongodb =  mongodb || req.app.get('mongodb')
  var type = req.params.type
  var slug = req.params.slug
  mongodb.queryCollection(type,{slug:slug},function(e,doc){
    //delete file uploads from the server
    if(e) res.jsonp({'Error':inspect(e)})
    else{
      //make sure doc[0] exists
      if(doc.length>0){
        for(var key in doc[0]){
          if(key == 'logo'||
             key == 'images'||
             key == 'image' ||
             key == 'background'||
             key == 'icon'||
             key == 'thumbnail'){
               if(key == 'images') for(var index in doc[0][key]) deleteFile(process.env.SYS_PATH+'/public'+doc[0][key][index])
               else deleteFile(process.env.SYS_PATH+'/public'+doc[0][key])
             }
        }
      }
      if(doc.length>0){
        mongodb.remove(type,{slug:slug},function(_e){
          if(_e) res.jsonp(502,{Error: inspect(_e)})
          else res.redirect(303,'/admin')
        })
      }
      else res.redirect(303,'/admin')
    }

  })

  //res.jsonp({TODO:'delete-project',req:{type:type,slug:slug}})
});

/* POST Admin Page - Single Project ReOrder */
/* !!INPROGRESS!! */

router.get('/:type/:slug/:order',function(req,res){
  mongodb = mongodb || req.app.get('mongodb')
  var type  = req.params.type,
      slug  = req.params.slug,
      order = req.params.order

  debug('GET /'+type+'/'+slug+'/'+order)

  //get all of our collection
  //so that we can figure out what needs to be updated
  mongodb.queryCollection(type,{},{sort:{index:1}},function(err,results){


    if(order < 0){
      order = 0
      return res.redirect(303,'/admin')
    }
    if(order > results.length-1){
      order = results.length-1
      return res.redirect(303,'/admin')
    }

    debug("Normalized Order: "+order)
    //debug(inspect(results))
    //find the slug we are looking for
    var _this = _.findWhere(results,{slug:slug})
    var _that = _.findWhere(results,{index:parseInt(order)})
    //debug(inspect(_this))
    //debug(inspect(_that))

    var _thisNew = parseInt(_this.index),
        _order = parseInt(order)


    async.parallel([function(cb){
      mongodb.updateByID(type,_this._id,{$set:{index:_order}},function(err){
        if(err) return cb(err)
        return cb()
      })
    },function(cb){
      mongodb.updateByID(type,_that._id,{$set:{index:_thisNew}},function(err){
        if(err) return cb(err)
        return cb()
      })
    }],function(err,results){
      if(err) return res.redirect(303,'/admin')
      return res.redirect(303,'/admin')
    })

  })

})

/* POST Admin Page - Single Project Update */
/* Serve Login Serve Page */
router.post('/:type/:slug',function(req,res){
  mongodb =  mongodb || req.app.get('mongodb')
  var type = req.params.type
  var slug = req.params.slug

  var post = req.body

  var form = new multiparty.Form({uploadDir:process.env.SYS_PATH+'/tmp'});
  form.parse(req, function(err, fields, files) {
      if(err) debug(err)
      var obj = {fields: fields, files: files}
      debug(inspect(obj))

      async.waterfall([ processFile(files),
                        function(_fields){
                            return function(_files,_cb){
                            //clean up files
                            for(var key in _files) fields[key] = _files[key]
                            for(var key in fields) if(_.isArray(fields[key]) && fields[key].length == 1) fields[key] = fields[key][0]
                            debug(inspect(_files))
                            debug(inspect(_fields))

                            var updateObject = {}

                            for(var key in fields){
                              switch (key){
                                case 'images-deleted':
                                  updateObject.$pullAll = updateObject.$pullAll || {}
                                  updateObject.$pullAll['images'] = []
                                  if(_.isArray(fields[key])) updateObject.$pullAll['images'] = fields[key]
                                  else updateObject.$pullAll['images'].push(fields[key])

                                  break;
                                case 'images':
                                  updateObject.$pushAll = updateObject.$pushAll || {}
                                  updateObject.$pushAll[key] = updateObject.$pushAll[key] || []
                                  if(_.isArray(fields[key])) updateObject.$pushAll[key] = fields[key]
                                  else updateObject.$pushAll[key].push(fields[key])

                                  break;
                                case 'title':
                                  updateObject.$set = updateObject.$set || {}
                                  updateObject.$set[key] = fields[key]
                                  updateObject.$set['slug'] = helper.makeSlug(fields[key])
                                  break;
                                default:
                                  updateObject.$set = updateObject.$set || {}
                                  debug(key)
                                  updateObject.$set[key] = fields[key]
                                  break;
                              }
                            }
                            debug(inspect(updateObject))

                            _cb(null,updateObject)
                          }
                        }(fields)
                      ],
      function(_err,_results){
        //debug(_results)
        var bPull = false;

        if(_results.hasOwnProperty('$pullAll')){
          //debug(inspect(_results['$pull']))

          var updateObj = {'$pullAll':_results['$pullAll']}
          delete _results['$pullAll']

          //debug(inspect(updateObj))
          //debug(inspect(_results))
          bPull = true;
        }
        debug(inspect(_results))
        mongodb.update(type,{slug:slug},_results,function(e){
          if(e)  return res.jsonp(502,{TODO:'update-project-error',Error:inspect(e)})
          if(bPull){
            mongodb.update(type,{slug:_results.$set.slug},updateObj,function(_e){
              debug('$pullAll')
              if(_e) return res.jsonp(502,{TODO:'update-project-error $pull',Error:inspect(_e)})
              else return res.redirect(302,'/admin/'+type+'/'+_results.$set.slug) //res.jsonp({'results':_results,'updateObj':updateObj})
            })
          }
          else return res.redirect(302,'/admin/'+type+'/'+_results.$set.slug) //res.jsonp(_results)//
        })
      })
  })



})

router.get('/:type',function(req,res){
  var type = req.params.type
  //res.jsonp({RES:'get'})
  if(type == 'users') return res.render('setup')
  else return res.redirect(302,'/admin')
})

//add new type to the DB
router.post('/:type',function(req,res){
  mongodb =  mongodb || req.app.get('mongodb')
  var type = req.params.type
  var slug = req.params.slug

  var post = req.body
  //check if the body parser is empty
  //if so we have a multipart form
  //
  if(!_.isEmpty(post)){
    debug('Body Parser Has Form')

    debug(inspect(post))

    mongodb.add(type,post,function(e,_doc){
      if(e) res.redirect('/'+type)
      else res.redirect('/admin')
    })
  }else{
    debug('Multiparty Has Form')
    var form = new multiparty.Form({uploadDir:process.env.SYS_PATH+'/tmp'});
    form.parse(req, function(err, fields, files) {
        if(err) debug(err)
        var obj = {fields: fields, files: files}
        debug(inspect(fields))
        debug(inspect(obj))
        //handle files
        //handle fields
        async.waterfall([processFile(files),
          function(_files,_cb){
            //process fields
            //debug('Waterfall 2')
            //merge files into fields
            for(var key in _files) fields[key] = _files[key]
            for(var key in fields) if(_.isArray(fields[key])&& fields[key].length == 1) fields[key] = fields[key][0]

            _cb(null,fields)
          }
          ],function(_err,_fields){
            debug(inspect(_fields))
            debug('Waterfall Complete')
            //do the slug check
            //make slug
            _fields.slug = helper.makeSlug(_fields.title)
            var regexSlug = new RegExp(_fields.slug)

            mongodb.queryCollection(type,{slug:{$regex:regexSlug}},function(e,_data){
              if(e) debug("ERROR FOUND: "+inspect(e))
              //debug("SlugCheck :"+inspect(_data))
              if(_data != null){
                if(_data.length != 0 ) _fields.slug += ('-'+_data.length)
              }

              mongodb.add(type,_fields,function(_e,_doc){
                if(_e) debug("DATABASE Write Error: "+_e)
                res.redirect(303,'/admin')

              })
            })
          })

        });
    }//end else
})

function processFile(files){
  return function(_cb){
  //process Files
    debug('Process File')
    //debug(inspect(files))
    var data = {}
    //iterate through our files
    for(var name in files){

      //see if we have images
      var size = 0
      for(var i in files[name]) size+= files[name][i].size


      //here we run an async parallel inside of an async
      //parallel to account for nested arrays of files
      //the result of our final parallel is passed to our waterfall's next function
      //we only populate the first parallel's fields if we have images

      if(size>0)
      data[name]=function(files,name){
        return function(callback){

          var imgs = []
          for(var i in files){

            //make sure this file has info
            if(files[i].size > 0)
            imgs.push(function(_img){
              return function(_callback){
                saveFile(_img,function(er,newPath){
                  if(er) debug(er)
                  else _callback(null,newPath)
                })
              }
            }(files[i]))

          }//for(var i in files)
          async.parallel(imgs,function(__err,__results){

            if(__err) callback(__err)
            else callback(null,__results)
          })//async.parallel
        }//return function(callback)
      }(files[name],name)//data[name]=function(f,name){}(files[name],name)
    }//for(var name in files)
    for(var name in files){
      debug(files[name].length)
    }
    async.parallel(data,function(__err,__files){
      //debug(inspect(data))
      //debug(inspect(__files))
      if(__err) _cb(__err)
      else _cb(null,__files)
    })

    //_cb(null,'')
}
}

function saveFile(file,cb){
  var newPath = process.env.SYS_PATH+'/public/uploads/'+new Date().toISOString()+'.'+file.originalFilename
  newPath = newPath.replace(/\:/g,'-')
  newPath = newPath.replace(/\s/g,'_')
  //debug(newPath)
  fs.rename(file.path, newPath , function(e){
    newPath = newPath.replace(process.env.SYS_PATH+'/public','')
    if(e) cb(e)
    else cb(null,newPath)
  })

}

function deleteFile(file){
  fs.exists(file,function(exists){
    if(exists) fs.unlinkSync(file)
  })
}

module.exports = router;
