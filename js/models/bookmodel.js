App.Models.Book = Backbone.Model.extend({
    defaults:{
        title: 'Insert title',
        author: 'Insert Author',
        image: 'Insert Image',
        year: 'insert Year',
        source: 'Insert source'
    },
    validate: function (attrs) {
        if (!$.trim(attrs.title)) {
            return 'Имя задачи должно быть валидным!';
        }
    }
});

App.Collections.Books = Backbone.Collection.extend({
    model: App.Models.Book
});

window.booksCollection = new App.Collections.Books([
    {
        title: 'Insert title',
        author: 'Insert Author',
        image: 'Insert Image',
        year: 'insert Year',
        source: 'Insert source'
    },
    {
        title: 'Insert title',
        author: 'Insert Author',
        image: 'Insert Image',
        year: 'insert Year',
        source: 'Insert source'
    },
    {
        title: 'Insert title',
        author: 'Insert Author',
        image: 'Insert Image',
        year: 'insert Year',
        source: 'Insert source'
    }
]);