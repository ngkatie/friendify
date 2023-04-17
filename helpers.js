import crypto from 'crypto';
import {ObjectId} from 'mongodb';
import axios from 'axios'; // "Request" library
//This file contains any functions that are too long or can be used in multiple places

//function to hash a password
function hashPassword(password) {
  const sha256 = crypto.createHash('sha256');
  sha256.update(password);
  const hashedPassword = sha256.digest('hex');
  return hashedPassword;
}

function checkValidId(id){
  if (!id) throw `You must provide an id ${id} to search for`;
  if (typeof id !== 'string') throw `Id ${id} must be a string`;
  if (id.trim().length === 0)
    throw `id ${id} cannot be an empty string or just spaces`;
  id = id.trim();
  if (!ObjectId.isValid(id)) throw `invalid object ID ${id}`;
}




export { hashPassword , checkValidId};