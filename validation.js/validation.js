import { ObjectId } from "mongodb";

const checkPassword = (password) =>{
    if (password === undefined || !password || typeof password !== "string")
    throw `password does not exist or is not a string`;
 password = password.trim() 
 if (password.length == 0) throw `password cannot be an empty string or just spaces`;
const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
  if (!regex.test(password)|| password.length<8) {
    throw 'Password should have at least one uppercase letter, one lowercase letter, one numeric character, and one special character or should have greater than 7 characters ';}
} 
const checkUserName = (username) => {
    if (username === undefined || !username || typeof username !== "string")
    throw `username does not exist or is not a string`;
     username = username.trim() 
     if (username.includes(' ')) {
    throw new Error('Username cannot contain spaces');
  }
   if (username.length < 3) {
    throw new Error('Username must be at least 3 characters long');
  }

  const alphanumericRegex = /^[a-zA-Z0-9_]+$/;
  if (!alphanumericRegex.test(username)) {
    throw new Error('Username can only contain alphanumeric characters and _');
  }

}
//use for all strings like name of songs, artists comments etc 
const checkString = (par, parName = "input") => {
  if (par === undefined || !par || typeof par !== "string")
    throw `${parName} does not exist or is not a string`;

  par = par.trim();
  if (par.length == 0) throw `${parName} cannot be an empty string or just spaces`;
  
  

  return par;
};

const checkID = (par, parName = "input") => {
  par = checkString(par, parName);
  if (!ObjectId.isValid(par)) throw `${parName} invalid object ID`;
  return par;
};
//checks array of strings when retrived 
const checkArrayOfStrings = (par, parName = "input") => {
  if (!par || !Array.isArray(par)) throw `${parName} is not an array`;
  const arr = [];
  for (let i in par) {
    if (par[i] === undefined || !par[i] || typeof par[i] !== "string")
      throw `One or more elements in ${parName} array is not a string`;
    par[i] = par[i].trim();
    if (par[i].length === 0)
      throw `One or more elements in ${parName} array is an empty string`;
    arr.push(par[i]);
  }
  if (arr.length === 0) throw `${parName} is an empty array`;
  return arr;
};

const checkemail = (email) => {
    
    if (!email) {
    throw "Email address is missing";
  }
  email=email.trim()

  if (typeof email !== "string") {
    throw "Email address must be a string";
  }

  // Regular expression to match email addresses
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)||email.length>6) {
    throw "Invalid email address";
  }
}

const checkYear = (par, parName='input') => {
  if (par == undefined || !par || typeof par !== 'number' || isNaN(par))
    throw `${parName} must be a number`;
  const currYear = new Date().getFullYear();
  if (!(par >= 1900 && par <= currYear))
    throw `${parName} must lie in the range 1900-${currYear}`;
  if (Boolean(par % 1)) throw `${parName} must be a valid year`;
  return par;
};


export {
    checkPassword,
  checkString,
  checkID,
  checkArrayOfStrings,
  checkemail,
  checkYear
};