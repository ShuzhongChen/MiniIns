var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

router.use(bodyParser());

var loginResponse = 'login-response';

function loggedIn(req, res, next) {
    console.log("Checking if logged in:");
    if (req.session.user)
    {
        // Proceed if the user is logged in.
        console.log("Logged in: "); console.log(req.session.user);
        next();  
    } 
    else 
    {
        console.log("Not logged in");
        res.send("You must first log in.");
    }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET hello world page*/
router.get('/helloworld', function(req, res) {
  res.render('index', { title: 'Hello, World!' });
});

/* GET Userlist page. */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('user');
    collection.find({}, {}, function(e, docs)
    {
        res.render('userlist', 
        {
           "userlist" : docs
        });
    });
});

// Read (show) a single user
router.get('/userlist/:username', function(req, res) {
    var uname = req.params.username;
    var db = req.db;
    var collection = db.get('user');
    
    collection.find( { username : uname }, 
        { _id: 0, email: 1, birthday: 1, phone: 1},
        function(err, doc) {
            if (err) {
                res.send("Find failed.");
            } else {
                res.render('showuser', 
                { title: 'Show User: ' + uname, mail: doc[0].email, 
                    bdate: doc[0].birthday, phone: doc[0].phone });
            }
        }
    );
});

/* POST to Add User Service */
router.post('/adduser', function(req, res) {
    // Set our internal DB variable
    var db = req.db;
    
    // Get our form values. These rely on the "name" attributes
    var userName = req.body.username;
    var userPw = req.body.password;
    var userEmail = req.body.txtEmail;
    var userBdate = req.body.bdate;
    var userTel = req.body.tel;
    
    // Set our collection
    var collection = db.get('user');
    
    // Submit to the DB
    collection.insert({"username" : userName, "password" : userPw, 
        "email" : userEmail, "birthday" : userBdate, "phone" : userTel},
    function (err, doc) {
        if (err) {
            // If it failed, return error
            //res.send("There was a problem.");
            res.send("Please select a different username!");
        }
        else
        {
            // And forward to success page
            res.redirect("login.html"); // should redirect to user account page later
        }
    });
});

// Update a single user
router.get('/updateuser/:username,:newphone', function(req, res) {
    var uname = req.params.username;
    var nphone = req.params.newphone;
    var db = req.db;
    var collection = db.get('user');
    
    collection.update( { username : uname }, 
        { $set: { phone: nphone} },
        function(err, doc) {
            if (err) {
                res.send("Find failed.");
            } else {
                res.redirect('/userlist');
            }
        }
    );
});

/* GET to Delete User REST API */
router.get('/deleteuser/:username', function(req, res) {
    var uname = req.params.username;
    var db = req.db;
    var collection = db.get('user');

    // Submit to the DB
    collection.remove( { "username" : uname },
       function (err, doc) 
       {
           if (err) {
               res.send("Delete failed.");
           }
           else {
               //res.send("Successfully deleted " + uname);
               res.redirect('/userlist');
           }
       }
    );
});

router.get('/deleteuser', function(req, res) {
    var uname = req.session.user;
    var db = req.db;
    var collection = db.get('user');

    // Submit to the DB
    collection.remove( { "username" : uname },
       function (err, doc) 
       {
           if (err) {
               res.send("Delete failed.");
           }
           else {
               //res.send("Successfully deleted " + uname);
               res.redirect('/userlist');
           }
       }
    );
});

/* GET registration page. */
// handled in app.js

/* POST login page. */
router.post('/' + loginResponse, function(req, res) {
        var userName = req.param('uname');
        var passWord = req.param('psw');
        
        var db = req.db;
        var collection = db.get('user');
        
        collection.find( { username: userName, password: passWord },
        { _id: 0, username: 1}, function(err, doc) {
            if (err) {
                console.log(err);
                res.send("Incorrect username or password");
            } else {
                req.session.user = doc[0].username;
                res.redirect("/myaccount");
            }
        });
    }
);

/* GET logout page. */
router.get('/logout', function(req, res) {
    console.log("Logging out:");
    
    if (req.session.user)
    {
        var name = req.session.user;
        console.log(name);
        
        req.session.destroy(function()
        {
            console.log(name + " logged out.");
        });
        
        res.send(name + " is now logged out.");
    }
    else
    {
        console.log("Nobody is currently logged in!");
        res.send("Nobody is currently logged in!");
    }
});

/* GET protected page. */
router.get('/myaccount', loggedIn, function(req, res) {
        var userName = req.session.user;
        var db = req.db;
        var collection = db.get('posts');
        
        collection.find( { username: userName },
        function(err, doc) {
            if (err) {
                console.log(err);
                //res.send("Incorrect username or password");
            } else {
                res.render("myaccount", { name: req.session.user, posts: doc });
            }
        });
        //res.render("myaccount", { name: req.session.user });
});

module.exports = router;