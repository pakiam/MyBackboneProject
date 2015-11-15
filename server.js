var application_root = __dirname,
    express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    mongoose = require('mongoose');

//Create server
var app = express();

//Connect to database
mongoose.connect('mongodb://127.0.0.1/library_database');

//Schemas
var Book = new mongoose.Schema({
    title: String,
    author: String,
    releaseDate: Date,
    keywords: [Keywords]
});
var Keywords=new mongoose.Schema({
   keyword: String
});
//Models
var BookModel = mongoose.model('Book', Book);

//Configure Server
app.configure(function () {
    //parses request body and populates request.body
    app.use(express.bodyParser());
    //checks request.body for HTTP method overrides
    app.use(express.methodOverride());
    //perform route lookup based on url and HTTP method
    app.use(app.router);
    //Where to serve static content
    app.use(express.static(path.join(application_root, 'site')));
    //Show all errors in dev
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

//Routes
app.get('/api', function (request, response) {
    response.send('Library API is running');
});

//Get a single book by id
app.get('/api/books/:id', function (request, response) {
    return BookModel.findById(request.params.id, function (err, book) {
        if (!err) {
            return response.send(book);
        } else {
            return console.log(err);
        }
    });
});

//Get a list of all books
app.get('/api/books', function (requset, response) {
    return BookModel.find(function (err, books) {
        if (!err) {
            return response.send(books);
        } else {
            return console.log(err);
        }
    });
});

//Insert a new book
app.post('/api/books', function (request, respond) {
    var book = new BookModel({
        title: request.body.title,
        author: request.body.author,
        releaseDate: request.body.releaseDate,
        keywords: request.body.keywords
    });
    return book.save(function (err) {
        if (!err) {
            console.log('created');
            return respond.send(book);
        } else {
            console.log(err);
        }
    });
});

//Update a book
app.put( '/api/books/:id', function( request, response ) {
    console.log( 'Updating book ' + request.body.title );
    return BookModel.findById( request.params.id, function( err, book ) {
        book.title = request.body.title;
        book.author = request.body.author;
        book.releaseDate = request.body.releaseDate;
        book.keywords = request.body.keywords;

        return book.save( function( err ) {
            if( !err ) {
                console.log( 'book updated' );
            } else {
                console.log( err );
            }
            return response.send( book );
        });
    });
});
//564893eff67258042a000001
//Delete a book
app.delete( '/api/books/:id', function( request, response ) {
    console.log( 'Deleting book with id: ' + request.params.id );
    return BookModel.findById( request.params.id, function( err, book ) {
        return book.remove( function( err ) {
            if( !err ) {
                console.log( 'Book removed' );
                return response.send( '' );
            } else {
                console.log( err );
            }
        });
    });
});

//Start server
var port = 3000;

app.listen(port, function () {
    console.log('Express server listening on port %d in %s mode', port, app.settings.env);
});
