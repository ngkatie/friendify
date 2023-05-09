(function(){

  const validationMethods = {

   checkName(str) {
    let name = validationMethods.checkString(str);
    if (name.length < 3 || name.length > 25) {
      
        throw `Error: ${name} must be between 3 to 25 characters`;
    }
    for (let i = 0; i < name.length; i++) {
      if (!validationMethods.checkLetter(name[i]) && !validationMethods.isNum(name[i])) {
        
        throw `Error: ${name} must only contain letters and numbers`;
      }
    }
    return str;
    },

    checkString(str) {
     if (!str || typeof str !== `string` || str.trim().length === 0) {
      throw `All fields must be filled`;
     }
     return str.trim();
    },

    checkLetter(char) {
      if (/[a-z]+/gi.test(char)) {
          return true;
      }
      return false;
    },
    isNum(char) {
      if (/\d+/g.test(char)) {
          return true;
      }
      return false;
    },
    checkPassword(str) {
      const password = validationMethods.checkString(str);
      if (password.length < 8 || password.includes(' ') || !validationMethods.includesNum(password) || !validationMethods.includesUpper(password) || !validationMethods.includesSpecial(password) || !validationMethods.includesLower(password)) {
          throw "Password should be non empty string of minimum 8 characters and must include digit,Uppercase,Lowercase and special characters ";
      }
      return str;
    },
    includesNum(str) {
      if (/\d+/g.test(str)) {
          return true;
      }
      return false;
    },
    includesUpper(str) {
      if (/[A-Z]+/g.test(str)) {
          return true;
      }
      return false;
    },
    
    includesLower(str) {
      if (/[a-z]+/g.test(str)) {
          return true;
      }
      return false;
    },
    
    includesSpecial(str) {
    if (/[^a-zA-Z0-9]/g.test(str)) {
      return true;
     }
    return false;
   },
   checkEmail(str) {
    const email = validationMethods.checkString(str).toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!(emailRegex.test(email))) {
        throw "Email Address not valid";
    }
    return email;
  }
}
  



let loginform = document.getElementById('login-form');
let registrationform = document.getElementById('registeration-form');
// let frEmail = document.getElementById("email");
let commentform = document.getElementById("comments-form");
// let errorDiv = document.getElementById('error');
let emailAddressInput = document.getElementById("emailInput");
let username = document.getElementById("usernameInput");
let passwordInput =  document.getElementById("passwordInput");
let confirmPasswordInput = document.getElementById("confirmPasswordInput")



if (registrationform) {
  registrationform.addEventListener('submit', (event) => {
    event.preventDefault();
    //const errorContainer = document.getElementById('error-container');
    // errorContainer.classList.add('hidden');
    const errorContainer = document.getElementById('error-container');
    const errorTextElement = errorContainer.getElementsByClassName('text-goes-here')[0];
    errorContainer.classList.add('hidden');
    let final = "";
    let emailAddress = emailAddressInput.value.trim();
    let password = passwordInput.value.trim();
    let confirmPassword = confirmPasswordInput.value.trim();
    let username1 = username.value.trim();
    username1 = username1.toLowerCase()

  try {
    const validUsername = validationMethods.checkName(username1);
    const validPassword = validationMethods.checkPassword(password);
    const confirmPassword_ = validationMethods.checkPassword(confirmPassword);
    if(validPassword !== confirmPassword)
    throw "Password and confirm Password dont match"
    const validEmail = validationMethods.checkEmail(emailAddress)
    registrationform.submit();

  } catch (e) {
    const message = typeof e === 'string' ? e : e.message;
    errorTextElement.textContent = message;
    errorContainer.classList.remove('hidden');
    return;;
  }
 })
}


if (loginform) {
    loginform.addEventListener('submit', (event) => {
      
      event.preventDefault();
      let final="";
      const errorContainer = document.getElementById('error-container');
      const errorTextElement = errorContainer.getElementsByClassName('text-goes-here')[0];
      errorContainer.classList.add('hidden');
      let username1 = username.value.trim();
      let password = passwordInput.value.trim();
      username1 = username1.toLowerCase()
    try {
      const validUsername = validationMethods.checkName(username1);
      const validPassword = validationMethods.checkPassword(password);
      loginform.submit();
    } catch (e) {
      const message = typeof e === 'string' ? e : e.message;
      errorTextElement.textContent = message;
      errorContainer.classList.remove('hidden');
      return;
    }
  })
}


// if (frEmail) {
//     frEmail.addEventListener('submit', (event) => {
//       event.preventDefault();
//       let final="";
//       let email = emailAddressInput.value.trim();
// email = email.toLowerCase()
//   var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
//   if (!email.match(validRegex)) {
//     final = final.concat('email is invalid <br>')
//   }
//  if(final.length === 0 ) {
//     frEmail.submit();
//  }
//  else {
//       errorDiv.hidden = false;
//       errorDiv.innerHTML = final ;
//     }
//     })
// }

if (commentform) {
    let comment = document.getElementById("commentText");
    commentform.addEventListener('submit', (event) => {
      event.preventDefault();
      const errorContainer = document.getElementById('error-container');
      const errorTextElement = errorContainer.getElementsByClassName('text-goes-here')[0];
      errorContainer.classList.add('hidden');
      let final="";
      let comment1 = comment.value.trim();
      comment1 = comment1.toLowerCase()

      try {
        if (comment1 === undefined || !comment1 || typeof comment1 !== "string" || !comment1.length === 0) {
          throw "Comment Entered is Invalid"
        }
          commentform.submit();
      } catch (error) {
        const message = typeof e === 'string' ? e : e.message;
        errorTextElement.textContent = message;
        errorContainer.classList.remove('hidden');
        return;
      }
    })
}
})()