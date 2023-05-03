// In this file, you must perform all client-side validation for every single form input (and the role dropdown) on your pages. The constraints for those fields are the same as they are for the data functions and routes. Using client-side JS, you will intercept the form's submit event when the form is submitted and If there is an error in the user's input or they are missing fields, you will not allow the form to submit to the server and will display an error on the page to the user informing them of what was incorrect or missing.  You must do this for ALL fields for the register form as well as the login form. If the form being submitted has all valid data, then you will allow it to submit to the server for processing. Don't forget to check that password and confirm password match on the registration form!
let loginform = document.getElementById('login-form');
let registrationform = document.getElementById('registration-form');
let frEmail = document.getElementById("friend-email");
let commentform = document.getElementById("comments-form");
let errorDiv = document.getElementById('error');
let emailAddressInput = document.getElementById("email");
let username = document.getElementById("username");
let passwordInput =  document.getElementById("password");
let confirmPasswordInput = document.getElementById("confirmPassword")
let comment = document.getElementById("commentText");

if (registrationform) {
    registrationform.addEventListener('submit', (event) => {
        event.preventDefault();
    let final = "";
    // let firstName = firstNameInput.value.trim();
    // let lastName = lastNameInput.value.trim();
    let emailAddress = emailAddressInput.value.trim();
    let password = passwordInput.value.trim();
    let confirmPassword = confirmPasswordInput.value.trim();
    let username1 = username.value.trim();
    username1 = username1.toLowerCase()
  if (!username1.match(validRegex)) {
    final = final.concat('username is invalid <br>')
  }
  if (username1 === undefined || !username || typeof username !== "string")
    final = final.concat('username does not exist or is not a string <br>')
 if (username1.includes(' ')) {
    final = final.concat('Username cannot contain spaces <br>')
  }
   if (username1.length < 3) {
    final = final.concat('Username must be at least 3 characters long <br>')
  }

  const alphanumericRegex = /^[a-zA-Z0-9_]+$/;
  if (!alphanumericRegex.test(username1)) {
    final = final.concat('Username can only contain alphanumeric characters and _ <br>')
  }
    // let role = roleInput.value.trim();
//   if ((typeof(firstName)!='string')|| /[0-9]/g.test(firstName)||firstName.length<2||firstName.length>25) {
//       final = final.concat('First name is invalid <br>')
//   }
//   if ((typeof(lastName)!='string')|| /[0-9]/g.test(lastName)||lastName.length<2||lastName.length>25) {
//       final = final.concat('last name is invalid <br>')
//   }
   emailAddress = emailAddress.toLowerCase()
  var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!emailAddress.match(validRegex)) {
    final = final.concat('email is invalid <br>')
  }
  password = password.trim()
var pass = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+/g;
if ((typeof(password)!= 'string')|| password.length<8||!pass.test(password)) {
  final = final.concat('password  is invalid <br>')
}

if (confirmPassword!==password) {
  final = final.concat('password and confirm password do not match <br>')
}
// role = role.trim() 
// role= role.toLowerCase() 
// if (!(role === "admin" || role === "user")) {
//   final = final.concat('role can only be admin or user')
// }
 if(final.length === 0 ) {
    registrationform.submit();
 }
 else {
      errorDiv.hidden = false;
      errorDiv.innerHTML = final ;
    }
    })
}


if (loginform) {
    loginform.addEventListener('submit', (event) => {
      event.preventDefault();
      let final="";
      let username1 = username.value.trim();
      let password = passwordInput.value.trim();
      username1 = username1.toLowerCase()
      if (!username1.match(validRegex)) {
        final = final.concat('username is invalid <br>')
      }
      if (username1 === undefined || !username || typeof username !== "string")
        final = final.concat('username does not exist or is not a string <br>')
     if (username1.includes(' ')) {
        final = final.concat('Username cannot contain spaces <br>')
      }
       if (username1.length < 3) {
        final = final.concat('Username must be at least 3 characters long <br>')
      }
    
      const alphanumericRegex = /^[a-zA-Z0-9_]+$/;
      if (!alphanumericRegex.test(username1)) {
        final = final.concat('Username can only contain alphanumeric characters and _ <br>')
      }
  password = password.trim()
var pass = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+/
if ((typeof(password)!= 'string')|| password.length<8||!pass.test(password)) {
  final = final.concat('password  is invalid <br>')
}
 if(final.length === 0 ) {
    loginform.submit();
 }
 else {
      errorDiv.hidden = false;
      errorDiv.innerHTML = final ;
    }
    })
}

if (frEmail) {
    frEmail.addEventListener('submit', (event) => {
      event.preventDefault();
      let final="";
      let email = emailAddressInput.value.trim();
email = email.toLowerCase()
  var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!email.match(validRegex)) {
    final = final.concat('email is invalid <br>')
  }
 if(final.length === 0 ) {
    frEmail.submit();
 }
 else {
      errorDiv.hidden = false;
      errorDiv.innerHTML = final ;
    }
    })
}

if (commentform) {
    commentform.addEventListener('submit', (event) => {
      event.preventDefault();
      let final="";
      let comment1 = comment.value.trim();
    comment1 = comment1.toLowerCase()
//   var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
 
  if (comment1 === undefined || !comment1 || typeof comment1 !== "string" || !comment1.length === 0) {
    final = final.concat('comment is empty <br>')
  }
 if(final.length === 0 ) {
    commentform.submit();
 }
 else {
      errorDiv.hidden = false;
      errorDiv.innerHTML = final ;
    }
    })
}