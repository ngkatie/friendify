import crypto from 'crypto';
import axios from 'axios'; // "Request" library
//This file contains any functions that are too long or can be used in multiple places

//function to hash a password
function hashPassword(password) {
  const sha256 = crypto.createHash('sha256');
  sha256.update(password);
  const hashedPassword = sha256.digest('hex');
  return hashedPassword;
}




export { hashPassword };