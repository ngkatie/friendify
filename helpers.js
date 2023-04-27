import crypto from 'crypto';
import {ObjectId} from 'mongodb';
import axios from 'axios'; // "Request" library
//This file contains any functions that are too long or can be used in multiple places

//function to hash a password
// export function hashPassword(password) {
//   const sha256 = crypto.createHash('sha256');
//   sha256.update(password);
//   const hashedPassword = sha256.digest('hex');
//   return hashedPassword;
// }

export function checkString(str) {
  if (!str || typeof str !== `string` || str.trim().length === 0) {
    throw `Error: ${str} must be a non-empty string`;
  }
  return str.trim();
};


export function idToString(mongoDocument) {
  mongoDocument._id = mongoDocument._id.toString();
  return mongoDocument;
}

export function checkId(str) {
  const idString = checkString(str);
  const id = new ObjectId(str);
  if (!ObjectId.isValid(id)) {throw `Error: Invalid object ID`};
  // Returns ID as ObjectId, not string
  return id;
}