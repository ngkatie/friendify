import crypto from 'crypto';
import {ObjectId} from 'mongodb';
import axios from 'axios'; // "Request" library
import EmailValidator from 'email-validator';
//This file contains any functions that are too long or can be used in multiple places

//function to hash a password
// export function hashPassword(password) {
//   const sha256 = crypto.createHash('sha256');
//   sha256.update(password);
//   const hashedPassword = sha256.digest('hex');
//   return hashedPassword;
// }

function checkLetter(char) {
  if (/[a-z]+/gi.test(char)) {
      return true;
  }
  return false;
}

function isNum(char) {
  if (/\d+/g.test(char)) {
      return true;
  }
  return false;
}

function includesUpper(str) {
  if (/[A-Z]+/g.test(str)) {
      return true;
  }
  return false;
}

function includesNum(str) {
  if (/\d+/g.test(str)) {
      return true;
  }
  return false;
}

function includesSpecial(str) {
  if (/[^a-zA-Z0-9]/g.test(str)) {
      return true;
  }
  return false;
}

export function checkValidId(str) {
  const str_ = checkString(str);
  const id = new ObjectId(str_);
  if (!ObjectId.isValid(id)) {
    throw `Error: Invalid object ID`
  };
  return id;
}

export function checkString(str) {
  if (!str || typeof str !== `string` || str.trim().length === 0) {
    throw `Error: ${str} must be a non-empty string`;
  }
  return str.trim();
};

export function checkStrArray(arr) {
  if (!arr || !Array.isArray(arr) || arr.length < 1) {
    throw `Error: ${arr} must be an non-empty array`;
  }
  arr = arr.map(str => {
    checkString(str);
    return str.trim();
  });
  return arr;
};

export function checkName(str) {
  let name = checkString(str);
  if (name.length < 3 || name.length > 25) {
      throw `Error: ${name} must be between 3 to 25 characters`;
  }
  for (let i = 0; i < name.length; i++) {
      if (!checkLetter(name[i]) && !isNum(name[i])) {
          throw `Error: ${name} must only contain letters and numbers`;
      }
  }
  return name;
}

export function checkEmail(str) {
  const email = checkString(str).toLowerCase();
  if (!EmailValidator.validate(email)) {
      throw `Error: ${email} is an invalid email`;
  }
  return email;
}

export function checkPassword(str) {
  const password = checkString(str);
  if (password.length < 8 || password.includes(' ') || !includesNum(password) || !includesUpper(password) || !includesSpecial(password)) {
      throw `Error: Password must contain at least one number, one uppercase character, and one special character`;
  }
  return password;
}

export function idToString(mongoDocument) {
  mongoDocument._id = mongoDocument._id.toString();
  return mongoDocument;
}
