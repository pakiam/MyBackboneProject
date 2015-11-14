window.template = function (id) {
    return _.template($('#' + id).html());
};
App.Views.Book = Backbone.View.extend({
    tagName: 'li',
    className: 'bookItem',
    initialize: function () {

    },
    template: template('content'),
    render: function () {
        var template = this.template(this.model.toJSON());
        this.$el.html(template);
        return this;
    }
});

App.Views.Books = Backbone.View.extend({
    tagName: 'ul',
    className: 'booksList',
    initialize: function () {

    },
    render: function () {
        this.collection.each(this.addOne, this);
        return this;
    },
    addOne: function (book) {
        var bookView = new App.Views.Book({
            model: book
        });
        this.$el.append(bookView.render().el);
    }

});

App.Views.AddBook = Backbone.View.extend({
    el: '#content',
    initialize: function () {
        console.log(this.el.innerHTML);
    }
});


var booksView = new App.Views.Books({
    collection: booksCollection
});

$('#test').html(booksView.render().el);
var addBookView = new App.Views.AddBook({collection: booksCollection});