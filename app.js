var bodyParser = require('body-parser');
var express    = require('express');
var lineReader = require('line-reader');
var path       = require('path');
var fs         = require('fs');


var index = require('./routes/index');

var loginResponse = 'login-response';
var registerResponse = 'register-response';

// Create the app.
var app = express();

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/Users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// Make the database accessible to the router
app.use(function(req, res, next)
{ 
    req.db = db; 
    next(); 
});

app.use('/', index);



// Use the bodyParser() middleware for all routes.
app.use(bodyParser());
// Set public directory as static directory.
app.use(express.static(path.join('public')));



// Read and send the HTML file.
app.get('/:pathname', function(req, res) {
    var html = '';
    lineReader.eachLine(req.params.pathname,
        function(line, last) {
            html += line + '\n';
            if (last) { 
                res.send(html);
                return false; 
            } else {
                return true;
            }
        }
    );
});

// Process the form data and send a response.
app.post('/' + loginResponse, 
    function(req, res) {
        var userName = req.param('uname');
        var passWord = req.param('psw');
        var userFound = false;
        var wrongInfo = false;
        var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
        html += '<title>Login</title><link rel="stylesheet" href="stylesheets/login.css?1.1" />';
        html += '</head><body><p>';
        
        var text = fs.readFileSync("users.txt", "utf8");
    	var array = text.split("\n");
    	var arrayLength = array.length;
        for (var i = 0; i < arrayLength; i++) {
            var temp = array[i].split(" ");
    		if (userName == temp[0] && passWord == temp[1]) {
    			userFound = true;
    			wrongInfo = false;
    			break;
    		} else if ((userName == temp[0] && passWord != temp[1]) 
    		|| (userName != temp[0] && passWord == temp[1])) {
    		    wrongInfo = true;
    		} 
        }
    	if (userFound) html += 'Hello, <a href="./homepage.html">' + userName + '</a>!';
    	else if (wrongInfo) html += 'Invaild username or password!';
        else html += 'Please register first!';
        html += '</p></body></html>';
        res.send(html);
    }
);

app.post('/' + registerResponse, 
    function(req, res) {
        var userName = req.param('txtName');
        console.log(userName);
        var email = req.param('txtEmail');
        var birthday = req.param('date');
        var phone = req.param('tel');
        var passWord = req.param('psw');
        
        var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
        html += '<title>Login</title><link rel="stylesheet" href="stylesheets/login.css?1.1" />';
        html += '</head><body><p>';
        
        // store to database
        
        html += 'Welcome to Fantasy, ' + userName + '!';
        html += '</p></body></html>';
        res.send(html);
    }
);

//app.listen(process.env.PORT);

module.exports = app;