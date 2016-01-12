var app = app || {};

app.BookView = Backbone.View.extend({
    tagName: 'div',
    className: 'bookContainer',
    template: _.template($('#bookTemplate').html()),
    /*initialize: function () {
      this.render();
    },*/
    events:{
      'click #delete':'deleteBook'
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON() ));
        return this;
    },
    deleteBook: function () {
        this.model.destroy();
        this.remove();
    }
});