import { ObjectId } from "mongodb";

function idToString(mongoDocument) {
    mongoDocument._id = mongoDocument._id.toString();
    return mongoDocument;
}

function checkString(str) {
    str = str.trim();
    if (!str || typeof str !== `string` || str.length === 0) {
      throw `Error: ${str} must be a non-empty string`;
    }
    return str;
}
    
function checkStrArray(arr) {
    if (!arr || !Array.isArray(arr) || arr.length === 0) {
        throw `Error: ${arr} must be a non-empty array`;
    }
    arr = arr.map(str => {
        checkString(str);
        return str.trim();
    });
    return arr;
}

export {
    idToString,
    checkString,
    checkStrArray
}