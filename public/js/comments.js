(function ($) {

  const likeButton = document.getElementById("like-button");
  var usersId = $('#users').val();

  $('#like-button').click(function(event) {
    event.preventDefault();  // Prevent the default form submission
  
    var $form = $(this);
    var userId = $form.find('#like-button').data('user-id');
    var action = $form.attr('action');
    var computedStyle = window.getComputedStyle(likeButton);
    var backgroundColor = computedStyle.getPropertyValue('background-color');
    var method = backgroundColor === 'rgb(0, 128, 0)' ? 'DELETE' : 'PUT';
  
    $.ajax({
      url:  '/users/likeProfile/'+ usersId,
      method: method,
      success: function(response) {
        // Update the UI based on the response
        // For example, change the text of the button and update the like count
        if(method=='PUT'){
          $("#like-button").css("background-color", "#008000");
          var likeCount = parseInt($("#like-count").text());
          $("#like-count").text(likeCount + 1);
        }
        else{
          $("#like-button").css("background-color", "#fff");
          var likeCount = parseInt($("#like-count").text());
          $("#like-count").text(likeCount - 1);
        }

      },
      error: function(xhr, status, error) {
        // Handle the error
        if(xhr.responseJSON){
          errorMessage = xhr.responseJSON.errorMessage;
      }
      $("#error-message").text(errorMessage);
      }
    });
  });

 
  $('#submit-comment').click(function (e) {
    e.preventDefault();
    submitComment();
});

$('#commentText').keypress(function (e) {
    if (e.keyCode === 13) {
        e.preventDefault();
        $('#submit-comment').click();
    }
});

function submitComment() {
    //var profileLiked = {{profileLiked}};
    var commentText = $('#commentText').val();
    
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
          var errorMessage = error;
          if(xhr.responseJSON){
              errorMessage = xhr.responseJSON.errorMessage;
          }
          $("#error-message").text(errorMessage);
        }
    });
}

// })

  // jQuery AJAX request
  // $("#like-profile").click(function() {
  //   let userId = $(this).data("userId");
  //   $.ajax({
  //     url: "/users/likeProfile/" + userId,
  //     type: "PUT",
  //     success: function(result) {

  //       $("#like-profile").css("background-color", "green");
  //       //profileLiked = true;
  //     },
  //     error: function(error) {
  //        $("#error-message").text(error.responseText);
  //     }
  //   });
  // });
  // if (profileLiked) {
  //   $("#like-profile").css("background-color", "green");
  // } else {
  //   $("#like-profile").css("background-color", "");
  // }


})(jQuery); // jQuery is exported as $ and jQuery


