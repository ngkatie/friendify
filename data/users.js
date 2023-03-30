import { users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

const create = async (
    username,
    email,
    spotify_access_token,
    hashed_password
) => {
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
const newId = insertInfo.insertedId.toString();
const user = await get(newId);
return user;
}

const getAll = async () => {
    const userCollection = await bands();
    let userList = await userCollection.find({}).toArray();
    if(!userList) throw 'Could not get all users';
    userList = userList.map((user) => {
        user._id = user._id.toString();
        return user;
    })
    return userList;
}

const get = async (id) => {
    id = id.trim();
    const userCollection = await users();
    const user = await userCollection.findOne({ _id: ObjectId(id) });
    user._id = user._id.toString();
    return user;   
}

export {create, getAll, get}