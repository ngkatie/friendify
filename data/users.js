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
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const create = async (
    username,
    email,
    password
) => {
  const hashed_password = bcryptjs.hashSync(password, saltRounds);
  // hashed_password = helpers.hashPassword(hashed_password);
  let newUser = {
    username: username,
    email: email,
    hashed_password: hashed_password,
    topTracks: [],
    topArtists: [],
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

  // const user = await get(insertInfo.insertedId.toString());
  return newUser;
}
// create("test", "test", "test");

const checkUser = async (username, password) => {

  const username_ = helpers.checkName(username);
  const password_ = helpers.checkPassword(password);

  const userCollection = await users();
  const user = await userCollection.findOne({ username: username_ });

  if (!user) {
    throw  `Either the email address or password is invalid`;
  }

  let compareToMatch = bcryptjs.compareSync(password_, user.hashed_password);
  if (!compareToMatch) {
    throw `Error: Either the email address or password is invalid`;
  }

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

// Note to self: Need to add time_range
async function getTopTracks(access_token) {

  const tracksEndpoint = spotifyAPI.getEndpoint('me/top/tracks');

  let { data } = await spotifyAPI.callEndpoint(tracksEndpoint, access_token);

  if (data) { 
    // const userCollection = await users();
    // const user = await get(user_id);

    // Clear outdated topSongs
    // user.topSongs = [];
    let topSongs = [];

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
      // user.topSongs.push(newTrack);
      topSongs.push(newTrack);
    }

    // const updatedUser = await userCollection.findOneAndUpdate(
    //   { _id: user._id },
    //   { $set: user },
    //   { returnDocument: 'after' }
    // )

    // if (updatedUser.lastErrorObject.n === 0) {
    //   throw `Error: Could not store top tracks successfully`;
    // }

    return topSongs;
  } 
  else {
    throw 'Error: Could not fetch top tracks from Spotify API';
  }
}

// user with id1 likes profile of user with id2, add id2 to likeProfile object of id1, increase likedcount of id2
async function likeProfile(iD1,iD2){

  let id1;
  let id2;

  iD1=iD1.trim()
  iD2=iD2.trim()
  try {
    helpers.checkValidId(iD1)
    helpers.checkValidId(iD2)

     id1 = await get(iD1)
     id2 = await get(iD2)
  } catch (error) {
    throw [400, error]
  }
  


  const likedProfiles = id1.likedProfiles
  let likeCount = id2.likeCount

  if(likedProfiles.includes(id2._id))
  throw [400,"Profile already liked"]

  likeCount = likeCount+1;
  likedProfiles.push(id2._id)

  let user1Info = {
    username: id1.username,
    email: id1.email,
    hashed_password: id1.hashed_password,
    topTracks: id1.topTracks,
    topArtists: id1.topArtists,
    dailyPlaylist: id1.dailyPlaylist,
    likeCount: id1.likeCount,
    comments: id1.comments,
    likedProfiles: likedProfiles,
    pendingRequests: id1.pendingRequests,
    friends: id1.friends,
  };

  let user2Info = {
    username: id2.username,
    email: id2.email,
    hashed_password: id2.hashed_password,
    topTracks: id2.topTracks,
    topArtists: id2.topArtists,
    dailyPlaylist: id2.dailyPlaylist,
    likeCount: likeCount,
    comments: id2.comments,
    likedProfiles: id2.likedProfiles,
    pendingRequests: id2.pendingRequests,
    friends: id2.friends,
  }


  const userCollection = await users();
  const updateInfo1 = await userCollection.findOneAndReplace(
    {_id: new ObjectId(id1._id)},
    user1Info,
    {returnDocument: 'after'}
  );

  const updateInfo2 = await userCollection.findOneAndReplace(
    {_id: new ObjectId(id2._id)},
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
    `Error: Update failed, could not update a user with id of ${id2}`
  ];


  return [updateInfo1.value, updateInfo2.value];


};

async function topSongTogether(iD1,iD2){
   
  let id1;
  let id2;

  iD1=iD1.trim()
  iD2=iD2.trim()
  try {
    helpers.checkValidId(iD1)
    helpers.checkValidId(iD2)

     id1 = await get(iD1)
     id2 = await get(iD2)
  } catch (error) {
    throw [400, error]
  }
 let topTracks1 = id1.topTracks
 let topTracks2 = id2.topTracks

 let topSong
 let commSongCount=0
 topTracks1.forEach(element => {
  topTracks2.forEach(element2=>{
    if(element.trim().lowercase() == element2.trim().lowercase()){
       topSong = element 
       commSongCount++
     }
  })
 });

 return [topSong, commSongCount, (topTracks1 + topTracks2)]

}

async function topArtistTogether(iD1,iD2){
   
  let id1;
  let id2;

  iD1=iD1.trim()
  iD2=iD2.trim()
  try {
    helpers.checkValidId(iD1)
    helpers.checkValidId(iD2)

     id1 = await get(iD1)
     id2 = await get(iD2)
  } catch (error) {
    throw [400, error]
  }
 let topArtist1 = id1.topArtists
 let topArtist2 = id2.topArtists


 let topArtist
 let commArtistCount =0;
 topArtist1.forEach(element => {
  topArtist2.forEach(element2=>{
    if(element.trim().lowercase() == element2.trim().lowercase()){
      topArtist = element ,
      commArtistCount++
     }
  })
 });

 return [topArtist, commArtistCount, (topArtist1+topArtist2)]

}

async function musicCompatibility(iD1, iD2){

  let arr1 = topSongTogether(iD1, iD2)
  let arr2 = topArtistTogether(iD1, iD2)

  let totArtist = arr2[3]
  let totTrack = arr1[3]

  let commSong = arr1[1]
  let commArtist = arr2[1]

  let perComp = ((commSong + commArtist)/(totArtist+ totTrack) * 100)

  let comp = perComp + "%"
  return comp
   
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
  likeProfile,
  topSongTogether,
  topArtistTogether,
  musicCompatibility
}
