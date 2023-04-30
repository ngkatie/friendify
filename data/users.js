import { users } from "../config/mongoCollections.js";
import { config } from "dotenv";
import { ObjectId } from "mongodb";
import bcryptjs from 'bcryptjs';
import * as spotifyAPI from './api.js';
import SpotifyWebApi from "spotify-web-api-node";
import * as songs from "./songs.js";
import * as helpers from "../helpers.js";
import axios from "axios";

config();
const saltRounds = await bcryptjs.genSalt(10);
const CLIENT_ID = process.env.client_id;
const CLIENT_SECRET = process.env.client_secret;

const create = async (
    username,
    email,
    password
) => {
  const hashed_password = await bcryptjs.hash(password, saltRounds);
  // hashed_password = helpers.hashPassword(hashed_password);
  let newUser = {
    username: username,
    email: email,
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
create("test", "test", "test");

const checkUser = async (username, password) => {
  const userCollection = await users();
  const user = await userCollection.findOne( { username: username });

  if (!user) {
    throw  `Either the email address or password is invalid`;
  }

  let compareToMatch = await bcryptjs.compare(password, user.hashed_password);
  if (!compareToMatch) {
    throw `Error: Either the email address or password is invalid`;
  }

  let userFound = {
    username: user.username,
    email: user.email,
    likeCount: user.likeCount,
    comments: user.comments,
    friends: user.friends
  }

  return userFound;
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

//Friend2(id)(has pending req) accepts request of friend1(idFriend), request would be removed from pending requests of friend2
const acceptFriend = async(id,idFriend) =>{
    helpers.checkValidId(id)
    helpers.checkValidId(idFriend)
    id = id.trim();
    idFriend = idFriend.trim();

    const userCollection = await users();
    const user = await get(id);
    const user2 = await get(idFriend);
    const user1Pending = user.pendingRequests;

    if(!user1Pending.includes(idFriend)){
        throw `${idFriend} has not sent you a friend request`
    }

    const user1Friends = user.friends;
    user1Friends.push(idFriend);

    const user2Friends = user2.friends;
    user2Friends.push(id);

    for (let i = 0; i < user1Pending.length; i++) {
      if (user1Pending[i] === idFriend) {
        user1Pending.splice(i, 1);
      }
    }

    let user1Info = {
      username: user.username,
      email: user.email,
      hashed_password: user.hashed_password,
      top_songs: user.top_songs,
      top_artists: user.top_artists,
      dailyPlaylist: user.dailyPlaylist,
      likeCount: user.likeCount,
      comments: user.comments,
      likedProfiles: user.likedProfiles,
      pendingRequests: user1Pending,
      friends: user1Friends,
    };

    let user2Info = {
      username: user2.username,
      email: user2.email,
      hashed_password: user2.hashed_password,
      top_songs: user2.top_songs,
      top_artists: user2.top_artists,
      dailyPlaylist: user2.dailyPlaylist,
      likeCount: user2.likeCount,
      comments: user2.comments,
      likedProfiles: user2.likedProfiles,
      pendingRequests: user2.pendingRequests,
      friends: user2Friends,
    }

    const updateInfo1 = await userCollection.findOneAndReplace(
      {_id: new ObjectId(id)},
      user1Info,
      {returnDocument: 'after'}
    );

    const updateInfo2 = await userCollection.findOneAndReplace(
      {_id: new ObjectId(idFriend)},
      user2Info,
      {returnDocument: 'after'}
    );

    if (updateInfo1.lastErrorObject.n === 0)
    throw [
      404,
      `Error: Update failed, could not update a user with id of ${id}`
    ];

    if (updateInfo2.lastErrorObject.n === 0)
    throw [
      404,
      `Error: Update failed, could not update a user with id of ${idFriend}`
    ];


    return updateInfo1.value;
}

console.log(await acceptFriend("644b109ba2ab059f766fa4e5","644b109ba2ab059f766fa4e6"))

// Friend 1(id) sends request to Friend2(idFriend), id would be added to pendingRequests of idFriend
const sendFriendRequest= async(id,idFriend) =>{

  helpers.checkValidId(id)
  helpers.checkValidId(idFriend)

  id = id.trim();
  idFriend = idFriend.trim();

  const userCollection = await users();
  const user = await get(id)
  const user2 = await get(idFriend)
  const user1Friends = user.friends;

  
  if(user1Friends.includes(idFriend))
  throw `${idFriend} is already a friend`

  // const user1Friends = user.friends;
  const user2PendingRequest = user2.pendingRequests

  if(user2PendingRequest.includes(id))
  throw 'Friend Request already sent'

  user2PendingRequest.push(id)
  
  let userInfo  = {
      username: user2.username,
      email: user2.email,
      hashed_password: user2.hashed_password,
      top_songs: user2.top_songs,
      top_artists: user2.top_artists,
      dailyPlaylist: user2.dailyPlaylist,
      likeCount: user2.likeCount,
      comments: user2.comments,
      likedProfiles: user2.likedProfiles,
      pendingRequests: user2PendingRequest,
      friends: user2.friends,
  }

  
  const updateInfo = await userCollection.findOneAndReplace(
      {_id: new ObjectId(idFriend)},
      userInfo,
      {returnDocument: 'after'}
    );



  if (updateInfo.lastErrorObject.n === 0)
    throw [
      404,
      `Error: Update failed, could not update a band with id of ${idFriend}`
    ];


  return  updateInfo.value;
 
}

//console.log(await sendFriendRequest("644b109ba2ab059f766fa4e6","644b109ba2ab059f766fa4e5"))

//removes the given id from pendingRequests of user
const rejectFriendRequest = async(id,idFriend)=>{

  checkValidId(id)
  checkValidId(idFriend)


  id = id.trim();
  idFriend = idFriend.trim();

  const userCollection = await users();
  const user = await get(id);
  const user2 = await get(idFriend);

  let temp=[];
  let i=0;
  if(user2.pendingRequests.includes(id)){
    user2.pendingRequests.forEach(element => {
      if(element !== id) {
        temp[i++] = element;
      }
    });
  }
  else{
    throw `Pending request does not exist for the given id`
  }

  let userInfoFriend  = {
      username: user2.username,
      email: user2.email,
      hashed_password: user2.hashed_password,
      top_songs: user2.top_songs,
      top_artists: user2.top_artists,
      dailyPlaylist: user2.dailyPlaylist,
      likeCount: user2.likeCount,
      comments: user2.comments,
      likedProfiles: user2.likedProfiles,
      pendingRequests: temp,
      friends: user2.friends,
  }
;

  const updateInfoFriend = await userCollection.findOneAndReplace(
      {_id: new ObjectId(idFriend)},
      userInfoFriend,
      {returnDocument: 'after'}
    );


  if (updateInfoFriend.lastErrorObject.n === 0)
    throw [
      404,
      `Error: Update failed, could not update a band with id of ${idFriend}`
    ];

  return  updateInfoFriend.value; 

}

// let spotifyApi = new SpotifyWebApi({
//   clientId: clientId,
//   clientSecret: clientSecret,
//   redirectUri: 'localhost:3000/'
// });

// async function getTopTracks(time_range) {
//     spotifyApi.getMyTopTracks(time_range, 50).then(
//         function(data) {
//             let topArtists = data.body.items;
//             console.log(topArtists);
//         }, 
//         function(e) { console.log(e) }
//     );
// }

// async function getTopArtists(time_range) {
//   spotifyApi.getMyTopArtists(time_range, 50).then(
//       function(data) {
//           let topArtists = data.body.items;
//           console.log(topArtists);
//       }, 
//       function(e) { console.log(e) }
//   );
// }

// Note to self: Need to add time_range
async function getTopTracks(user_id) {
  try {
    const tracksEndpoint = spotifyAPI.getEndpointByType('me/top/tracks');
    const token = spotifyAPI.getAccessToken();

    let data = await axios.get(tracksEndpoint, {
      headers: { 'Authorization': `Bearer ${token}`}
    });
  } catch (e) { console.error(e) }

  if (data) { 
    const userCollection = await users();
    const user = await get(user_id);

    // Clear outdated topSongs
    user.topSongs = [];

    let tracks = data.items;
    for (let i = 0; i < tracks.length; i++) {
      const newTrack = {
        _id: new ObjectId(),
        trackName: tracks[i].name,
        trackURL: tracks[i].external_urls.spotify,
        spotifyId: tracks[i].id,
        artistName: songs.getArtists(tracks[i]),
        albumName: tracks[i].album.name,
        image: tracks[i].album.images[0].url
      }
      user.topSongs.push(newTrack);
    }

    const updatedUser = await userCollection.findOneAndUpdate(
      { _id: user._id },
      { $set: user },
      { returnDocument: 'after' }
    )

    if (updatedUser.lastErrorObject.n === 0) {
      throw `Error: Could not store top tracks successfully`;
    }

    return user.topSongs;
  } 
  else {
    throw 'Error: Could not fetch top tracks from Spotify API';
  }
}

async function getTopArtists(user_id) {

  const tracksEndpoint = spotifyAPI.getEndpointByType('me/top/artists');
  const token = spotifyAPI.getAccessToken();

  let data = await axios.get(tracksEndpoint, {
    headers: { 'Authorization': `Bearer ${token}`}
  });

  if (data) { 
    const userCollection = await users();
    const user = await get(user_id);

    // Clear outdated topSongs
    user.topArtists = [];

    let artists = data.items;
    for (let i = 0; i < artists.length; i++) {
      const newArtist = {
        _id: new ObjectId(),
        artistName: artists[i].name,
        artistURL: artists[i].external_urls.spotify,
        spotifyId: artists[i].id,
        image: artists[i].images[0].url
      }
      user.topArtists.push(newArtist);
    }

    const updatedUser = await userCollection.findOneAndUpdate(
      { _id: user._id },
      { $set: user },
      { returnDocument: 'after' }
    )

    if (updatedUser.lastErrorObject.n === 0) {
      throw `Error: Could not store top artists successfully`;
    }
    
    return user.topArtists;
  } 
  else {
    throw 'Error: Could not fetch top artists from Spotify API';
  }
}

export {
  create, 
  checkUser,
  getAll, 
  get, 
  acceptFriend, 
  sendFriendRequest, 
  rejectFriendRequest,
  getTopTracks,
  // getTopArtists
}