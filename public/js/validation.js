(function(){

  const validationMethods = {

   checkName(str) {
    let name = validationMethods.checkString(str);
    if (name.length < 3 || name.length > 25) {
      
        return `Error: ${name} must be between 3 to 25 characters`;
    }
    for (let i = 0; i < name.length; i++) {
      if (!validationMethods.checkLetter(name[i]) && !validationMethods.isNum(name[i])) {
        
        return `Error: ${name} must only contain letters and numbers`;
      }
    }
    return true;
    },

    checkString(str) {
     if (!str || typeof str !== `string` || str.trim().length === 0) {
      return `${str} should be a non empty string`;
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
          return "Password should be non empty string of minimum 8 characters and must include digit,Uppercase,Lowercase and special characters ";
      }
      return true;
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
        return "Email Address not valid";
    }
    return true;
  }
}
  



let loginform = document.getElementById('login-form');
let registrationform = document.getElementById('registeration-form');
let friendRegisterationform = document.getElementById('friend-request-form');
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

    const errors = [];

    if(!username1|| !emailAddress || !password ||!confirmPassword)
    errors.push("All fields Required!")
    const validUsername = validationMethods.checkName(username1);
    if (validUsername !== true) {
      errors.push(validUsername);
    }
    const validPassword = validationMethods.checkPassword(password);
    if (validPassword !== true) {
      errors.push(validPassword);
    }
    const confirmPassword_ = validationMethods.checkPassword(confirmPassword);
    if (confirmPassword_ !== true || password !== confirmPassword) {
      errors.push("Password and confirm Password don't match");
    }
    const validEmail = validationMethods.checkEmail(emailAddress);
    if (validEmail !== true) {
      errors.push(validEmail);
    }

    if (errors.length > 0) {
      errorTextElement.textContent = errors.join('\n');
      errorContainer.classList.remove('hidden');
      return;
    }

    registrationform.submit();


 })
}


if (loginform) {
    loginform.addEventListener('submit', (event) => {
      
      const errors = [];

      event.preventDefault();
      let final="";
      const errorContainer = document.getElementById('error-container');
      const errorTextElement = errorContainer.getElementsByClassName('text-goes-here')[0];
      errorContainer.classList.add('hidden');
      let username1 = username.value.trim();
      let password = passwordInput.value.trim();
      username1 = username1.toLowerCase()

      if(!username1 || !password )
      errors.push("All fields Required!")
      const validUsername = validationMethods.checkName(username1);
      if (validUsername !== true) {
        errors.push(validUsername);
      }
      const validPassword = validationMethods.checkPassword(password);
      if (validPassword !== true) {
        errors.push(validPassword);
      }

      
     if (errors.length > 0) {
      errorTextElement.textContent = errors.join('\n');
      errorContainer.classList.remove('hidden');
      return;
     }

     loginform.submit();

  })
}


if (friendRegisterationform) {
  friendRegisterationform.addEventListener('submit', (event) => {
      event.preventDefault();
      let final="";
      const errors=[]
      let emailAddressInput = document.getElementById("email");
      email = emailAddressInput.value.trim()
      email = email.toLowerCase()

      const errorContainer = document.getElementById('error-container');
      const errorTextElement = errorContainer.getElementsByClassName('text-goes-here')[0];
      errorContainer.classList.add('hidden');

      const validEmail = validationMethods.checkEmail(email)
  
      if(validEmail !== true){
        errors.push(validEmail)
      }

      if(errors.length>0){
        errorTextElement.textContent = errors.join('\n');
        errorContainer.classList.remove('hidden');
        return;
      }

      friendRegisterationform.submit();

    })
}

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