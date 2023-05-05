(function ($) {
 $('#submit-comment').click(function (e) {
        e.preventDefault();
        var commentText = $('#commentText').val();
        var usersId = $('#users').val();
        var newComments = $("#comment-area");

        if (commentText === '') {
            $('#empty-comment').html('Please enter a comment').show();
            return false;
        }

        $.ajax({
            type: 'POST',
            url: '/comments/' + usersId,
            data: {
                comment: commentText

            },
            success: function (response) {
                // add the new comment to the comments area
                var comment = $('<div class="comments"><div>' + response.userData.comment + '<br></div><div class="bold"> - ' + response.userData.username + '</div></div>')
                newComments.append(comment);
                // reset the comment input field
                $('#commentText').val('');
            },
            error: function (xhr, status, error) {
                $("#error-message").text(error.responseText);
            }
        });
    });
// })

  // jQuery AJAX request
  $("#like-profile").click(function() {
    let userId = $(this).data("userId");
    $.ajax({
      url: "/users/likeProfile/" + userId,
      type: "PUT",
      success: function(result) {

        $("#like-profile").css("background-color", "green");
      },
      error: function(error) {
         $("#error-message").text(error.responseText);
      }
    });
  });



})(jQuery); // jQuery is exported as $ and jQuery


