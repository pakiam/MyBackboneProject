var app=app || {};

$(function () {
    $('#releaseDate').datepicker();

    new app.LibraryView();

    $.dateMonthAndYear= function (dateObject) {
        var d=new Date(dateObject);
        return d.getMonth() + d.getFullYear();
    };

    status('Choose a file :)');

    // Check to see when a user has selected a file
    var timerId;
    timerId = setInterval(function() {
        if($('#coverImage').val() !== '') {
            clearInterval(timerId);

            $('#addBook').submit();
        }
    }, 500);

    $('#addBook').submit(function() {
        status('uploading the file ...');

        $(this).ajaxSubmit({

            error: function(xhr) {
                status('Error: ' + xhr.status);
            },

            success: function(response) {
                var imageUrlOnServer=response.path;
                var str='img'+imageUrlOnServer.split('img')[1];
                status('Uploaded to: '+str);
                $('#coverImagePreShow').attr('src',str);
                $('#coverImagePath').val(str);
            }
        });

        // Have to stop the form from submitting and causing
        // a page refresh - don't forget this
        return false;
    });

    function status(message) {
        $('#status').text(message);
    }
});