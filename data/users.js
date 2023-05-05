import { users } from "../config/mongoCollections.js";
import { config } from "dotenv";
import { ObjectId } from "mongodb";
import bcryptjs from 'bcryptjs';
import * as spotifyAPI from './api.js';
import * as songs from './songs.js';
// import SpotifyWebApi from "spotify-web-api-node";
import * as helpers from "../helpers.js";
// import axios from "axios";

config();
const saltRounds = await bcryptjs.genSalt(10);
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

const create = async (
    username,
    email,
    password
) => {

  const username_ = helpers.checkName(username);
  const email_ = helpers.checkEmail(email);
  const password_ = helpers.checkPassword(password);
  const hashed_password = bcryptjs.hashSync(password_, saltRounds);

  let newUser = {
    username: username_,
    email: email_,
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
    if (!userList) {throw 'Could not get all users'};
    userList = userList.map(helpers.idToString);
    return userList;
}

const get = async (id) => {
    const user_id = helpers.checkValidId(id);

    const userCollection = await users();
    const user = await userCollection.findOne({ _id: user_id });

    return helpers.idToString(user);
}


const getByEmail = async (email) => {
    const email_ = helpers.checkEmail(email);

    const userCollection = await users();
    const user = await userCollection.findOne({ email: email_ });

    return helpers.idToString(user)._id;
}


//Friend2(id)(has pending req) accepts request of friend1(idFriend), request would be removed from pending requests of friend2
const acceptFriend = async(id_, idFriend_) => {

  // Validate ID
  id_ = helpers.checkValidId(id_);
  idFriend_ = helpers.checkValidId(idFriend_);
  
  const id = id_.toString();
  const idFriend = idFriend_.toString();

  const userCollection = await users();
  const user1 = await get(id);
  const user2 = await get(idFriend);
  const user1Pending = user1.pendingRequests;

  if(!user1Pending.includes(idFriend)){
    throw `${idFriend} has not sent you a friend request`;
  }

  const user1Friends = user1.friends;
  user1Friends.push(idFriend);

  const user2Friends = user2.friends;
  user2Friends.push(id);

  for (let i = 0; i < user1Pending.length; i++) {
    if (user1Pending[i] === idFriend) {
      user1Pending.splice(i, 1);
    }
  }

  let user1Info = {
    username: user1.username,
    email: user1.email,
    hashed_password: user1.hashed_password,
    topTracks: user1.topTracks,
    topArtists: user1.topArtists,
    dailyPlaylist: user1.dailyPlaylist,
    likeCount: user1.likeCount,
    comments: user1.comments,
    likedProfiles: user1.likedProfiles,
    pendingRequests: user1Pending,
    friends: user1Friends,
  };

  let user2Info = {
    username: user2.username,
    email: user2.email,
    hashed_password: user2.hashed_password,
    topTracks: user2.topTracks,
    topArtists: user2.topArtists,
    dailyPlaylist: user2.dailyPlaylist,
    likeCount: user2.likeCount,
    comments: user2.comments,
    likedProfiles: user2.likedProfiles,
    pendingRequests: user2.pendingRequests,
    friends: user2Friends,
  }

  const updateInfo1 = await userCollection.findOneAndReplace(
    { _id: id_ },
    user1Info,
    { returnDocument: 'after' }
  );

  const updateInfo2 = await userCollection.findOneAndReplace(
    { _id: idFriend_},
    user2Info,
    { returnDocument: 'after' }
  );

  if (updateInfo1.lastErrorObject.n === 0) {
    throw [
      404,
      `Error: Update failed, could not update a user with id of ${id}`
    ];
  }

  if (updateInfo2.lastErrorObject.n === 0) {
    throw [
      404,
      `Error: Update failed, could not update a user with id of ${idFriend}`
    ];
  }
  
  return updateInfo1.value;
}

// Friend 1(id) sends request to Friend2(idFriend), id would be added to pendingRequests of idFriend
const sendFriendRequest = async(id_, idFriend_) => {

  id_ = helpers.checkValidId(id_);
  idFriend_ = helpers.checkValidId(idFriend_);
  
  const id = id_.toString(); 
  const idFriend = idFriend_.toString();

  const userCollection = await users();
  const user1 = await get(id);        // Sender
  const user2 = await get(idFriend);  // Receiver

  const user1Friends = user1.friends;
  if (user1Friends.includes(idFriend)) {
    throw `${idFriend} is already a friend`
  }

  // const user1Friends = user.friends;
  const user2PendingRequest = user2.pendingRequests;
  if(user2PendingRequest.includes(id)) {
    throw 'Friend Request already sent'
  }

  user2PendingRequest.push(id);
  
  let userInfo  = {
    username: user2.username,
    email: user2.email,
    hashed_password: user2.hashed_password,
    topTracks: user2.topTracks,
    topArtists: user2.topArtists,
    dailyPlaylist: user2.dailyPlaylist,
    likeCount: user2.likeCount,
    comments: user2.comments,
    likedProfiles: user2.likedProfiles,
    pendingRequests: user2PendingRequest,
    friends: user2.friends,
  }

  const updateInfo = await userCollection.findOneAndReplace(
      { _id: idFriend_ },
      userInfo,
      { returnDocument: 'after' }
    );

  if (updateInfo.lastErrorObject.n === 0) {
    throw [
      404,
      `Error: Update failed, could not update a band with id of ${idFriend}`
    ];
  }

  return  updateInfo.value;
}

// Removes the given id from pendingRequests of user, idFriend(has the request)
const rejectFriendRequest = async(id_, idFriend_) => {

  id_ = helpers.checkValidId(id_);
  idFriend_ = helpers.checkValidId(idFriend_);

  const id = id_.toString(); 
  const idFriend = idFriend_.toString();

  const userCollection = await users();
  const user = await get(id);
  const user2 = await get(idFriend);

  // Remove sender id from receiver's list of pending requests
  if (user2.pendingRequests.includes(id)) {
    let temp = user2.pendingRequests.filter(element => element != id);
  }
  // let temp = [];
  // let i = 0;
  // if(user2.pendingRequests.includes(id)) {
  //   user2.pendingRequests.forEach(element => {
  //     if(element !== id) {
  //       temp[i++] = element;
  //     }
  //   });
  // }
  else {
    throw `Pending request does not exist for the given id`;
  }

  let userInfoFriend  = {
    username: user2.username,
    email: user2.email,
    hashed_password: user2.hashed_password,
    topTracks: user2.topTracks,
    topArtists: user2.topArtists,
    dailyPlaylist: user2.dailyPlaylist,
    likeCount: user2.likeCount,
    comments: user2.comments,
    likedProfiles: user2.likedProfiles,
    pendingRequests: temp,
    friends: user2.friends,
  }
;

  const updateInfoFriend = await userCollection.findOneAndReplace(
    { _id: idFriend_ },
    userInfoFriend,
    { returnDocument: 'after' }
  );


  if (updateInfoFriend.lastErrorObject.n === 0) {
    throw [
      404,
      `Error: Update failed, could not update a band with id of ${idFriend}`
    ];
  }
    
  return updateInfoFriend.value; 
}

async function getTopTracks(user_id, time_range = "medium_term", access_token) {

  // const time_range = document.getElementById("timeSelect");
  const tracksEndpoint = spotifyAPI.getEndpoint('me/top/tracks');

  let { data } = await spotifyAPI.callTopEndpoint(tracksEndpoint, time_range, 50, access_token);

  if (data) { 
    let topTracks = [];
    let tracks = data.items;
    for (let i = 0; i < tracks.length; i++) {
      const newTrack = {
        _id: new ObjectId(),
        trackName: tracks[i].name,
        trackURL: tracks[i].external_urls.spotify,
        spotifyId: tracks[i].id,
        artistName: songs.getArtists(tracks[i]),
        albumName: tracks[i].album.name,
        // genres: tracks[i].album.genres,
        image: tracks[i].album.images[0].url
      }
      topTracks.push(newTrack);
    }

    const currId = helpers.checkValidId(user_id);
    const userCollection = await users();
    const user = await userCollection.findOne({_id: currId});
    user.topTracks = topTracks;
    
    const updatedUser = await userCollection.findOneAndUpdate(
      { _id: currId },
      { $set: user },
      { returnDocument: 'after' }
    )

    if (updatedUser.lastErrorObject.n === 0) {
      throw `Error: Could not store top tracks successfully`;
    }

    return user.topTracks;
  } 
  else {
    throw 'Error: Could not fetch top tracks from Spotify API';
  }
}

async function getTopArtists(user_id, time_range = "medium_term", access_token) {

  const artistsEndpoint = spotifyAPI.getEndpoint('me/top/artists');

  let { data } = await spotifyAPI.callTopEndpoint(artistsEndpoint, time_range, 50, access_token);

  if (data) { 
    let topArtists = [];
    let artists = data.items;
    for (let i = 0; i < artists.length; i++) {
      const newArtist = {
        _id: new ObjectId(),
        artistName: artists[i].name,
        artistURL: artists[i].external_urls.spotify,
        spotifyId: artists[i].id,
        genres: artists[i].genres,
        followerCount: artists[i].followers.total,
        image: artists[i].images[0].url
      }
      topArtists.push(newArtist);
    }

    const currId = helpers.checkValidId(user_id);
    const userCollection = await users();
    const user = await userCollection.findOne({_id: currId});
    user.topArtists = topArtists;
    
    const updatedUser = await userCollection.findOneAndUpdate(
      { _id: currId },
      { $set: user },
      { returnDocument: 'after' }
    )

    if (updatedUser.lastErrorObject.n === 0) {
      throw `Error: Could not store top artists successfully`;
    }

    return user.topArtists;
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
async function seedTracks(user_id, access_token) {
  // Update topTracks in user's database
  // Time range is short_term since playlist should reflect user's most recent history
  const topTracks = await getTopTracks(user_id, "short_term", access_token);
  let seed_tracks_ = [];

  for (let i = 0; i < topTracks.length; i++) {
    const trackId = topTracks[i].spotifyId;
    if (trackId && trackId !== "") {
      seed_tracks_.push(trackId);
    }
  }
  // Return array of strings representing tracks' spotify IDs
  return seed_tracks_;
}

async function seedArtists(user_id, access_token) {
  // Update topArtists info in user's database
  // Time range is short_term since playlist should reflect user's most recent history
  const topArtists = await getTopArtists(user_id, "short_term", access_token);
  let seed_artists_ = [];
  let seed_genres_ = [];

  for (let i = 0; i < topArtists.length; i++) {
    const artistId = topArtists[i].spotifyId;
    if (artistId && artistId !== "") {
      seed_artists_.push(artistId);
    }
    const genreArray = topArtists[i].genres;
    genreArray.forEach(genre => seed_genres_.push(genre));
  }
  // Return array of strings representing artists' spotify IDs and genres
  return { seed_artists_ , seed_genres_ };
}

function constructSeedString(seedArray, limit) {
  // Base seed (first element)
  let seedString = seedArray[0];

  // If limit > 1, concatenate other seed data
  for (let i = 1; i < limit && i < seedArray.length; i++) {
    seedString = seedString + "," + seedArray[i];
  }
  return seedString;
}

async function getRecommendations(limit, user_id, access_token) {
  const recsEndpoint = spotifyAPI.getEndpoint('recommendations');

  // Recommendations endpoint requires seed_tracks, seed_artists, and seed_genres
  let seed_tracks_ = await seedTracks(user_id, access_token);
  let { seed_artists_ , seed_genres_ } = await seedArtists(user_id, access_token);

  // Up to 5 seed values between 3 fields
  const track_limit = 2;
  const artist_limit = 2;
  const genre_limit = 1;

  const seed_tracks = constructSeedString(seed_tracks_, track_limit);
  const seed_artists = constructSeedString(seed_artists_, artist_limit);
  const seed_genres = constructSeedString(seed_genres_, genre_limit);
  const opt_params = {
    limit: limit,
    seed_tracks,
    seed_artists,
    seed_genres
  }

  let { data } = await spotifyAPI.callRecsEndpoint(recsEndpoint, opt_params, access_token);
  let tracks = data.tracks;
  if (tracks) { 
    let recommendations = [];
    for (let i = 0; i < tracks.length; i++) {
      const newTrack = {
        trackName: tracks[i].name,
        trackURL: tracks[i].external_urls.spotify,
        spotifyId: tracks[i].id,
        artistName: songs.getArtists(tracks[i]),
        albumName: tracks[i].album.name,
        image: tracks[i].album.images[0].url
      }
      recommendations.push(newTrack);
    }
    return recommendations;
  } 
  else {
    throw 'Error: Could not fetch recommendations from Spotify API';
  }
}

async function getRecentlyPlayed(limit, access_token) {
  const recentEndpoint = spotifyAPI.getEndpoint('me/player/recently-played');
  let { data } = await spotifyAPI.callRecentEndpoint(recentEndpoint, limit, access_token);
  let items = data.items;

  if (items) { 
    let recentlyPlayed = [];
    for (let i = 0; i < items.length; i++) {
      const newTrack = {
        trackName: items[i].track.name,
        trackURL: items[i].track.external_urls.spotify,
        spotifyId: items[i].track.id,
        artistName: songs.getArtists(items[i].track),
        albumName: items[i].track.album.name,
        image: items[i].track.album.images[0].url
      }
      recentlyPlayed.push(newTrack);
    }
    return recentlyPlayed;
  } 
  else {
    throw 'Error: Could not fetch recently played tracks from Spotify API';
  }
}

async function getTopCharts(limit, access_token) {
  const PLAYLIST_ID = '37i9dQZEVXbLRQDuF5jeBp';     // Spotify ID for "Top 50 - USA" playlist
  const chartsEndpoint = spotifyAPI.getEndpoint(`playlists/${PLAYLIST_ID}`);

  let { data } = await spotifyAPI.callEndpoint(chartsEndpoint, access_token);
  let allTracks = data.tracks.items;

  if (allTracks) { 
    let topCharts = [];
    for (let i = 0; i < allTracks.length; i++) {
      const newTrack = {
        trackName: allTracks[i].track.name,
        trackURL: allTracks[i].track.external_urls.spotify,
        spotifyId: allTracks[i].track.id,
        artistName: songs.getArtists(allTracks[i].track),
        albumName: allTracks[i].track.album.name,
        image: allTracks[i].track.album.images[0].url
      }
      topCharts.push(newTrack);
    }
    return topCharts.slice(0, limit);
  } 
  else {
    throw "Error: Could not fetch 'Top 50' playlist from Spotify API";
  }
}

async function getDailyPlaylist(user_id, access_token) {

  const recTracks = await getRecommendations(22, user_id, access_token);
  const recentTracks = await getRecentlyPlayed(20, access_token);
  const chartTracks = await getTopCharts(5, access_token);

  const longTermTracks = await getTopTracks(user_id, "short_term", access_token);
  const jumpBackTracks = longTermTracks.slice(0,3);

  const dailyPlaylist = recTracks.concat(recentTracks, chartTracks, jumpBackTracks);
  
  return dailyPlaylist;

}

export {
  // user
  create, 
  checkUser,
  getAll, 
  get, 
  getByEmail,
  // friend requests
  acceptFriend, 
  sendFriendRequest, 
  rejectFriendRequest,
  // music information
  getTopTracks,
  likeProfile,
  topSongTogether,
  topArtistTogether,
  musicCompatibility
  getTopArtists,
  getRecommendations,
  getRecentlyPlayed,
  getTopCharts,
  getDailyPlaylist

}
