var application_root = __dirname;
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorhandler = require('errorhandler');
var formidable=require('formidable');
var util =require('util');
var fs=require('fs');

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(application_root, 'site')));
app.use(errorhandler({dumpExceptions: true, showStack: true}));

//mongoDBConnect
mongoose.connect('mongodb://localhost/library_database');
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
//routes here
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
    form.uploadDir = application_root+ "/site/img";
    form.keepExtensions = true;
    form.multiples = true;
    form.parse(request, function (err, fields, files) {
        if (err) {
            response.status(500);
            response.json({'success': false});
        } else {
            response.send({path:files.coverImage.path});
            //respond.status(200);
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