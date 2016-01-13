var application_root = __dirname;
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore=require('connect-mongo')(session);
var async = require('async');
var methodOverride = require('method-override');
var errorhandler = require('errorhandler');
var crypto = require('crypto');
var formidable = require('formidable');
var util = require('util');
var fs = require('fs');

var app = express();

//mongoDBConnect
mongoose.connect('mongodb://localhost/library_database');

var sessionConfig={
    secret: "KillerIsJim", // подпись для куков с сессией
    cookie: {
        path: "/",
        maxAge: 14400000, // 4h max inactivity for session
        httpOnly: true // hide from attackers
    },
    key: "sid",
    // take connection settings from mongoose
    store: new MongoStore({url: 'mongodb://localhost/library_database'})
};

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(application_root, 'site')));
app.use(errorhandler({dumpExceptions: true, showStack: true}));
app.use(session(sessionConfig));


//mongo Schemas
var Keywords = new mongoose.Schema({
    keyword: String
});
var Book = new mongoose.Schema({
    coverImage: String,
    title: String,
    author: String,
    releaseDate: Date,
    keywords: [Keywords]
});
var BookModel = mongoose.model('Book', Book);
/////////////////////////////////
function Signer(secret) {
    this.secret = secret;
}

Signer.prototype.sign = function(stringOrBuffer) {

    return stringOrBuffer + '.' +

        crypto
            .createHmac('sha256', this.secret)
            .update(stringOrBuffer)
            .digest('base64')
            .replace(/\=+$/, '');
};

Signer.prototype.unsign = function(value) {
    var str = value.slice(0, value.lastIndexOf('.'));
    return this.sign(str) == value ? str : false;
};
////////////////////////////////
var User = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

User.methods.encryptPassword = function (password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

User.virtual('password').set(function (password) {
        this._plainPassword = password;
        this.salt = Math.random() + '';
        this.hashedPassword = this.encryptPassword(password);
    }).get(function () {
        return this._plainPassword;
    });

User.methods.checkPassword = function (password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

User.methods.getPublicFields = function () {
    return {
        username: this.username,
        created: this.created,
        id: this.id
    };
};

var UserModel = mongoose.model('User', User);

function restrict(req,res,next){
    if(req.session.user==='56966103843ed38c16c3c191'){
        next();
    }else{
        console.log(req.session.user);
        req.session.error='Access denied';
        res.redirect('/')
    }
}
/*app.use(function(req, res, next){
    // all the stuff from the example
    if (req.session.user) {
        res.locals.user = req.session.user
    }
    next();
});*/
//routes here
app.get('/', function (req, res) {
    console.log('GET request to the homepage');
});

//login
app.post('/login', function (req, res, next) {
    console.log(req.body.loginName);
    console.log(req.body.loginPassword);
    console.log(req.body);
    async.waterfall([
            function (callback) {
                UserModel.findOne({username: req.body.loginName}).exec(callback);
            },
            function (user, callback) {
                if (!user) {
                    user = new UserModel({
                        username: req.body.loginName,
                        password: req.body.loginPassword
                    });
                    user.save(function (err, user, affected) {
                        callback(err, user);
                    });
                } else {
                    if (user.checkPassword(req.body.loginPassword)) {
                        callback(null, user);
                    } else {
                        res.status(403).send('Логин или пароль неверен.');
                    }
                }
            }
        ],
        function (err, user) {
            if (err) {
                return console.log(err);
            }
            console.log('User with name: ' + user.username + ' id: '+user.id +' login');
            req.session.user = user._id;
            res.locals.session = req.session;
            res.locals.user = req.user;
            res.redirect('/');

        });

});

app.get('/logout', function (req, res) {
    console.log(req.session.user+' logged out');
    req.session.destroy(function () {
        res.redirect('/');
    });
});
app.get('/restricted', restrict, function(req, res){
    res.send(req.session +' Wahoo! restricted area, click to <a href="/logout">logout</a>');
});
app.get('/api', function (request, response) {
    response.send('Library API is running.');
});
//getting all books
app.get('/api/books', function (request, response) {
    return BookModel.find(function (err, books) {
        if (!err) {
            return response.send(books);
        } else {
            return console.log(err);
        }
    });
});
//post photo
app.post('/api/photos', function (request, response) {
    var form = new formidable.IncomingForm();
    form.uploadDir = application_root + "/site/img";
    form.keepExtensions = true;
    form.multiples = true;
    form.parse(request, function (err, fields, files) {
        if (err) {
            response.status(500);
            response.json({'success': false});
        } else {
            response.status(200).send({path: files.coverImage.path});
            //console.log(respond.json({'success': true}));
            console.log(files.coverImage.path);

            //return ImagePath=files.coverImage.path;
            //console.log(respond.send(files));
            //return respond.write(files.coverImage.path);
        }
        console.log('SEND');
    });
});


//post new book
app.post('/api/books', function (request, response) {
    console.log(request.body);
    var book = new BookModel({
        coverImage: request.body.coverImage,
        title: request.body.title,
        author: request.body.author,
        releaseDate: request.body.releaseDate,
        keywords: request.body.keywords
    });
    book.save(function (err) {
        if (!err) {
            console.log('created');
            return response.send(book);
        } else {
            return console.log(err);
        }
    });
});
//568ba3368568a8b40cddeee3
//get book by id
app.get('/api/books/:id', function (request, response) {
    return BookModel.findById(request.params.id, function (err, book) {
        if (!err) {
            return response.send(book);
        } else {
            return console.log(err)
        }
    });
});

//update book
app.put('/api/books/:id', function (request, response) {
    console.log('Updating book ' + request.body.title);
    return BookModel.findById(request.params.id, function (err, book) {
        book.title = request.body.title;
        book.author = request.body.author;
        book.releaseDate = request.body.releaseDate;
        book.keywords = request.body.keywords;
        return book.save(function (err) {
            if (!err) {
                console.log('book updated');
            } else {
                console.log(err);
            }
            return response.send(book);
        });
    });
});

//delete book
app.delete('/api/books/:id', function (request, response) {
    console.log('Deleting book with id: ' + request.params.id);
    return BookModel.findById(request.params.id, function (err, book) {
        return book.remove(function (err) {
            if (!err) {
                console.log('Book removed');
                return response.send('');
            } else {
                console.log(err);
            }
        });
    });
});

var port = 3000;

app.listen(port, function () {
    console.log('Express server listening on port %d in %s mode', port, app.settings.env);
});