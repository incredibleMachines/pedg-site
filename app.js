var express = require('express'),
    session = require('express-session')
    path = require('path'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt')


var Database = require('./modules/database')

var routes = require('./routes/index');
var portfolio = require('./routes/portfolio');
var admin = require('./routes/admin')

//known data collections
var collections = { projects:null,
                    testimonials:null,
                    featured:null,
                    process:null,
                    clients:null,
                    hero:null,
                    users:null }


/*

SETUP PASSPORT

*/
passport.use('login',new LocalStrategy(
    function(username,password,done){
        //console.log("-----here----")
        getUser(username,function(err,user){
          console.log(user)
          if(err) return done(err)
          if(!user) return done(null,false)
          bcrypt.compare(password,user.password,function(err,res){
            console.log(err)
            console.log(res)
            if(res == false) return done(null,false)
            else return done(null,user)
          })
          // if(user.password != password)
          // return done(null,user)
        })
    }
))
passport.serializeUser(function(user, done) {
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {
  getUserByID(id, function (err, user) {
    done(err, user);
  });
});


/* Express Setup */
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('collections',collections)
//give express access to our DB Object
app.set('mongodb',new Database({database:'PEDG', collections:collections}))


app.use(favicon());
app.use(logger('dev'));
//app.use(busboy({ immediate: true, limits:{ fileSize: 10*1024*1024 } }))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(session({
  secret: '___________',
  //cookie: { maxAge: 600000 },
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.set('passport',passport)
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', routes);
app.use('/portfolio', portfolio);
app.use('/admin',admin);


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

/* PASSPORT HELPERS */
var mongodb = null
function getUser(username,cb){
  //console.log('-------------GET USER-------------')
  mongodb = mongodb || app.get('mongodb')
  console.log('loogin')
  mongodb.queryCollection('users',{user:username},{limit:1},function(err,user){
    //console.log(user)
    if(err) return cb(new Error('DB Error: '+err))
    if(user[0].user===username) return cb(null,user[0])
    return cb(null,null)

  })

}

function getUserByID(id,cb){
  //console.log('-------------GET USER BY ID-------------')
  mongodb = mongodb || app.get('mongodb')

  mongodb.getDocumentByID('users',id,function(err,user){
    //console.log(user)
    if(err) return cb(new Error('DB Error: '+err))
    if(!user) return cb(new Error('User ' + id + ' does not exist'))

    return cb(null,user)
  })
}
