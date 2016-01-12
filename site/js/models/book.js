var app = app || {};

app.Book=Backbone.Model.extend({
    defaults:{
        coverImage: 'img/placeholder.png',
        title: 'No title',
        author: 'No author',
        releaseDate: 'Unknown',
        keywords: 'None'
    },
    parse: function (response) {
        response.id=response._id;
        return response;
    }
});