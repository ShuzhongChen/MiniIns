var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var formidable = require('formidable');
var fs = require('fs');
var ObjectId   = require('mongodb').ObjectID;

//router.use(bodyParser());

router.use(bodyParser({
      keepExtensions:true,
      limit:10000000,// 10M limit
      defer:true
}));

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
    var db = req.db;
    var logged = false;
    
    if (req.session.user) {
        logged = true;
    }
    
    // get recent posts
    var collection = db.get('posts');
    collection.find({ }, { limit : 9, sort : {$natural: -1} }, 
    function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            res.render('index', { logged: logged, posts: doc });
        }
    });
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
    var slogan = req.body.slogan;
    var userPw = req.body.password;
    var userEmail = req.body.txtEmail;
    var userBdate = req.body.bdate;
    var userTel = req.body.tel;
    
    // Set our collection
    var collection = db.get('user');
    
    // Submit to the DB
    collection.insert({"username" : userName, "slogan" : slogan, 
        "password" : userPw, "email" : userEmail, "birthday" : userBdate, 
        "phone" : userTel},
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
               req.session.destroy(function()
                {
                    console.log(uname + " delete account.");
                });
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
               req.session.destroy(function()
                {
                    console.log(uname + " delete account.");
                });
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
        //var userName = req.params.uname;
        //var passWord = req.params.psw;
        
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
        res.render("logout", { name: name });
        //res.send(name + " is now logged out.");
    }
    else
    {
        console.log("Nobody is currently logged in!");
        //res.render("logout");
        res.send("Nobody is currently logged in!");
    }
});

/* GET protected page. */
router.get('/myaccount', loggedIn, function(req, res) {
    var userName = req.session.user;
    var db = req.db;
    var userslogan;
    var userprofile;
    var follower = 0;
    var following = 0;
    var post = 0;
    
    // get user's profile
    var collection = db.get('user');
    collection.find( { username: userName }, { _id: 0, slogan: 1, profile: 1},
    function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            userslogan = doc[0].slogan;
            userprofile = doc[0].profile;
        }
    });
    
    collection = db.get('follows');
    // get users' follow info
    collection.find( { follower: userName},
    function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            try {
                console.log(doc[0].following);
                doc.forEach(function(onedoc) {
                    following++;
                });
            } catch(err) {
                console.log(err);
            }
        }
    });
    collection.find( { following: userName},
    function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            try {
                console.log(doc[0].following);
                doc.forEach(function(onedoc) {
                    follower++;
                });
            } catch(err) {
                console.log(err);
            }
        }
    });
    
    // get user's posts
    collection = db.get('posts');
    collection.find( { username: userName }, {sort : {$natural: -1}},
    function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            doc.forEach(function(onedoc) {
                post++;
            });
            res.render("myaccount", { name: req.session.user, 
            slogan: userslogan, profile: userprofile, follower: follower, 
            following: following, post: post, posts: doc });
        }
    });
});

// upload new post
router.post('/fileupload', function(req, res) {
    var form = new formidable.IncomingForm();
    //console.log("form: " + form);
    var db = req.db;
    var userName = req.session.user;
    
    form.parse(req, function (err, fields, files) {
      var oldpath = files.filetoupload.path;
      var newpath = 'public/userimage/' + files.filetoupload.name;
      var filepath = newpath.substr(7);
      var description = fields["imgtext"];
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        
        // Set our collection
        var collection = db.get('posts');
        
        // Submit to the DB
        collection.insert({"username" : userName, "text" : description, 
        "img" : filepath},
            function (err, doc) {
            if (err) {
                res.send("Server error. Sorry! Please try later.");
            }
            else
            {
                res.redirect("/myaccount");
            }
          });
        });
    });
});

// upload new profile pic
router.post('/profileupdate', function(req, res) {
    var form = new formidable.IncomingForm();
    //console.log("form: " + form);
    var db = req.db;
    var userName = req.session.user;
    
    form.parse(req, function (err, fields, files) {
      var oldpath = files.profileupdate.path;
      var newpath = 'public/userimage/' + files.profileupdate.name;
      var filepath = newpath.substr(7);
      //var description = fields["imgtext"];
      fs.rename(oldpath, newpath, function (err) {
        if (err) {
            throw err;
        }
        
        // Set our collection
        var collection = db.get('user');
        
        // Submit to the DB
        collection.update({username: userName}, {$set: {profile: filepath}},
            function (err, doc) {
            if (err) {
                res.send("Server error. Sorry! Please try later.");
            }
            else
            {
                res.redirect("/myaccount");
            }
          });
        });
    });
});

// display user detail page
router.get('/userdetail', function(req, res) {
    var user = req.param('username');
    if (req.session.user != null && user == req.session.user)
    {
        res.redirect("/myaccount");
    }
    else
    {
        var db = req.db;
        var userslogan;
        var userprofile;
        var followed = false;
        var follower = 0;
        var following = 0;
        var post = 0;
        var logged = false;
        
        if (req.session.user) {
            logged = true;
        }
        
        // get user's profile
        var collection = db.get('user');
        collection.find( { username: user }, { _id: 0, slogan: 1, profile: 1},
        function(err, doc) {
            if (err) {
                console.log(err);
            } else {
                userslogan = doc[0].slogan;
                userprofile = doc[0].profile;
            }
        });
        
        collection = db.get('follows');
        // get users' follow info
        collection.find( { follower: user},
        function(err, doc) {
            if (err) {
                console.log(err);
            } else {
                try {
                    console.log(doc[0].following);
                    doc.forEach(function(onedoc) {
                        following++;
                    });
                } catch(err) {
                    console.log(err);
                }
            }
        });
        collection.find( { following: user},
        function(err, doc) {
            if (err) {
                console.log(err);
            } else {
                try {
                    console.log(doc[0].following);
                    doc.forEach(function(onedoc) {
                        follower++;
                    });
                } catch(err) {
                    console.log(err);
                }
            }
        });
        
        // check if the logged in user is following the user
        collection.find( { follower: req.session.user, following: user },
        function(err, doc) {
            if (err) {
                console.log(err);
            } else {
                try {
                    console.log(doc[0].following);
                    followed = true;
                } catch(err) {
                    console.log(err);
                }
            }
        });
        
        // get user's posts
        collection = db.get('posts');
        collection.find( { username: user }, {sort : {$natural: -1}},
        function(err, doc) {
            if (err) {
                console.log(err);
            } else {
                doc.forEach(function(onedoc) {
                    post++;
                });
                res.render("userdetail", { name: user, slogan: userslogan, 
                profile: userprofile, followed: followed, follower: follower, 
                following: following, post: post, logged: logged, posts: doc });
            }
        });
    }
});

// follow user
router.get('/follow', function(req, res) {
    var user = req.param('username');
    if (req.session.user == null)
    {
        res.redirect("login.html");
    }
    else
    {
        var db = req.db;
        var collection = db.get('follows');

        collection.insert( { "follower": req.session.user, "following": user},
        function(err, doc) {
            if (err) {
                console.log(err);
            } else {
                res.redirect("/userdetail?username=" + user);
            }
        });
    }
});

// unfollow user
router.get('/unfollow', function(req, res) {
    var user = req.param('username');
    
    var db = req.db;
    var collection = db.get('follows');

    collection.remove( { "follower": req.session.user, "following": user},
    function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/userdetail?username=" + user);
        }
    });
});

// search user
router.get('/search', function(req, res) {
    var userName = req.param('searchUser');
    var db = req.db;
    var collection = db.get('user');

    collection.find( { username: userName},
    { _id: 0, username: 1}, function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            try {
                console.log(doc[0].username);
                res.redirect("/userdetail?username=" + userName);
            } catch(err) {
                res.render("nouser");
            }
        }
    });
});

// display post detail page
router.get('/postdetail', function(req, res) {
    var postid = req.param('postid');
    var postuser = req.param('postuser');
    var logged = false;
    var userimg;
    
    if (req.session.user) {
        logged = true;
    }
    
    var db = req.db;
    
    // get user profile image
    var collection = db.get('user');
    collection.find( { username: postuser },
    function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            //console.log(doc[0].profile);
            userimg = doc[0].profile;
        }
    }).then( function(collection) {
        // get post details
        collection = db.get('posts');
        collection.find( { _id: ObjectId(postid) },
        function(err, doc) {
            if (err) {
                console.log(err);
            } else {
                console.log(userimg);
                res.render("postdetail", {userimg: userimg, logged: logged, posts: doc[0]});
            }
        });
    });
    
    
});

router.post('/modifyinfo', function(req, res) {
    var userName = req.session.user;
    // Set our internal DB variable
    var db = req.db;
    
    // Get our form values. These rely on the "name" attributes
    var userTel = req.body.telephone;
    var userMail = req.body.email;
    var userSlogan = req.body.slogan;
    
    // Set our collection
    var collection = db.get('user');
    
    // Submit to the DB
    collection.update({"username" : userName}, {$set: {phone: userTel, 
        email: userMail, slogan: userSlogan}},
    function (err, doc) {
        if (err) {
            // If it failed, return error
            //res.send("There was a problem.");
            res.send("Please enter vaild phone number!");
        }
        else
        {
            // And forward to success page
            res.redirect('/myaccount'); // should redirect to user account page later
        }
    });
});

module.exports = router;