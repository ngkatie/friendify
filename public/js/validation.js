let loginform = document.getElementsByClassName('login-form');
let registrationform = document.getElementsByClassName('signup-form');
let frEmail = document.getElementById("email");
let commentform = document.getElementById("comments-form");
let errorDiv = document.getElementById('error');
let emailAddressInput = document.getElementById("email");
let username = document.getElementById("username");
let passwordInput =  document.getElementById("passwordInput");
let confirmPasswordInput = document.getElementById("confirmPasswordInput")
let comment = document.getElementById("commentText");

if (registrationform) {
    registrationform.addEventListener('submit', (event) => {
        event.preventDefault();
    let final = "";
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