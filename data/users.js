import { users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import * as helpers from "../helpers.js"

const create = async (
    username,
    email,
    spotify_access_token,
    hashed_password
) => {
    //function that hashes the password
    hashed_password = helpers.hashPassword(hashed_password);
    let newUser = {
        username: username,
        email: email,
        spotify_access_token: spotify_access_token,
        hashed_password: hashed_password,
        top_songs: [],
        top_artists: [],
        dailyPlaylist: [],
        likeCount: 0,
        comments: [],
        likedProfiles: [],
        pendingRequests: [],
        friends: [],
    }
    const userCollection = await users();
    const insertInfo = await userCollection.insertOne(newUser);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
        throw `Could not add user successfully`;
      }

    // const newId = insertInfo.insertedId.toString();
    const user = await get(insertInfo.insertedId.toString());
    return helpers.idToString(user);
}

const getAll = async () => {
    const userCollection = await users();
    let userList = await userCollection.find({}).toArray();
    if(!userList) {throw 'Could not get all users'};
    userList = userList.map(helpers.idToString);
    return userList;
}

const get = async (id) => {
    id = helpers.checkId(id);
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: id });
    return helpers.idToString(user);
}

export {create, getAll, get}