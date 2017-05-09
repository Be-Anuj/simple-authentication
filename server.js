var express= require('express');//making express server
var app= express();
var path = require('path');
var bodyParser = require('body-parser');//to parse form data 
var session= require('express-session');//manage sessions
var  mongoose = require('mongoose');// odm for mongodb
 
mongoose.connect("mongodb://127.0.0.1:27017/myapp");// local mongodb server
var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
});

var User = mongoose.model('User', UserSchema);//creating model for database

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));// to serve our static files
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');// setting our view engine
app.use(session({secret:'bewithyou'}));// session secret

//////////////////////////ROUTES////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// index api
app.get("/", function (req, res) {

    if (req.session.user) {
    	console.log(req.session.user.username+" "+"logged in");
        res.send("Welcome " + req.session.user.username + "<br>" + "<a href='/logout'>logout</a>");
    } else {
        res.send("<a href='/login'> Login</a>" + "<br>" + "<a href='/signup'> Sign Up</a>");
    }
});
// login api
app.get("/login", function (req, res) {
    res.render("login");
});
//signup api
app.get("/signup", function (req, res) {
    if (req.session.user) {
        res.redirect("/");
    } else {
        res.render("signup");
    }
});
// api to check if user exist and to save signup data 
app.post('/signup',function(req,res){
	console.log("anuj");
 User.count({
 	
        username: req.body.username

    }, function (err, count) {
        if (count === 0) {
            var password = req.body.password;
            var username = req.body.username;
            var user = new User({
            	username:username,
            	password:password
            	  });
            	user.save(function(error){
            		console.log("user saved");
            		  req.session.regenerate(function(){
                        req.session.user = user;
                        req.session.success = 'Authenticated as ' + user.username + ' click to <a href="/logout">logout</a>. ' + ' You may now access <a href="/restricted">/restricted</a>.';
                        res.redirect('/');
                    });
            	});
         
     
            }
        else {
         
                  res.send("user exist , sign up with diffrent username");
        }
});
});

///api to login with form data and login checks
app.post('/login',function(req,res){
	if(req.body.username && req.body.password ){
 var pass = req.body.password;

  var name = req.body.username;
  User.findOne({'username':name,password:pass}, function (err, users) {
              if (err) {
                  //return console.log(err);
                  res.send("error");
              } else {
                  if(users== null){
              			res.send("check your username or password");
              			
              		}else{
              			
              			 req.session.regenerate(function () {

                req.session.user = users;
                req.session.success = 'Authenticated as ' + users.username + ' click to <a href="/logout">logout</a>. ' + ' You may now access <a href="/restricted">/restricted</a>.';
                res.redirect('/');
            });
              		}
              		
              	}
              }
          
          );
}else{
	res.send("username or password not provided");
}
       
});

//api to logout and end session
app.get('/logout', function (req, res) {
    req.session.destroy(function () {
        res.redirect('/');
    });
});

app.listen(4000,function(){
	console.log("app started");
});