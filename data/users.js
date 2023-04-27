import { users } from "../config/mongoCollections.js";
import { config } from "dotenv";
import { ObjectId } from "mongodb";
import * as spotifyAPI from './api.js';
import SpotifyWebApi from "spotify-web-api-node";
import * as songs from "./songs.js";
import * as helpers from "../helpers.js";

config();
const CLIENT_ID = process.env.client_id;
const CLIENT_SECRET = process.env.client_secret;

const create = async (
    username,
    email,
    spotify_access_token,
    hashed_password
) => {

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

//Friend2 accepts request of friend1, request would be removed from pending requests of friend2
const acceptFriend = async(id,idFriend) =>{
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

// Friend 1(id) sends request to Friend2(idFriend), id would be added to pendingRequests of idFriend
const sendFriendRequest= async(id,idFriend) =>{

  checkValidId(id)
  checkValidId(idFriend)

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
      spotify_access_token: user2.spotify_access_token,
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
      spotify_access_token: user2.spotify_access_token,
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
    let topTracks = [];
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
  } 
  else {
    throw 'Error: Could not fetch top tracks from Spotify API';
  }

  return user.topSongs;
}

export {
  create, 
  getAll, 
  get, 
  acceptFriend, 
  sendFriendRequest, 
  rejectFriendRequest,
  getTopTracks,
  getTopArtists
}