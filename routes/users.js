import { Router } from 'express';
export const router = Router();
// import { ObjectId } from 'mongodb';
import { userData } from '../data/index.js';
import querystring from 'querystring';
import { users } from "../config/mongoCollections.js";
import { checkValidId } from '../helpers.js';
import { acceptFriend, sendFriendRequest,rejectFriendRequest,getAll,get, likeProfile, unlikeProfile } from '../data/users.js';
import * as helpers from '../helpers.js';
import axios from 'axios'; // Axios library
import dotenv from 'dotenv';
import xss from 'xss';
import qs from 'qs';


dotenv.config();
const CLIENT_ID = process.env.CLIENT_ID // Your client id
const CLIENT_SECRET = process.env.CLIENT_SECRET; // Your secret
const redirect_uri = 'http://localhost:3000/users/callback'; // Your redirect uri

const generateRandomString = (length) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey = 'spotify_auth_state';
router
  .route('/login')
  .get(async (req, res) => {
    res.status(200).render('pages/login', { title: "Login" })
  })
  .post(async (req, res) => {

    let error = false;

    // Check missing fields
    let missingFields = [];
    if (!req.body.usernameInput.trim()) {
      missingFields.push('username');
    }
    if (!req.body.passwordInput.trim()) {
      missingFields.push('password');
    }
    if (missingFields.length > 0) {
      return res.status(400).render('pages/login', { 
        title: 'Login', 
        missingFields: missingFields.join(', '), 
        missing: true 
      });
    }

    // Check valid username and password input
    const username = (req.body.usernameInput).trim().toLowerCase();
    const password = (req.body.passwordInput).trim();

    try{
      const validUsername = helpers.checkName(username);
      const validPassword = helpers.checkPassword(password);

      if (!(validUsername && validPassword)) {
        throw 'Either the username or password is invalid';
      }

      let authenticatedUser = await userData.checkUser(xss(username), xss(password));
      if (authenticatedUser) {
        req.session.user = {
          id: authenticatedUser._id,
          username: username,
        }
      }
    } catch(e){
      return res.status(400).render('pages/login', { 
        title: 'Login', 
        error: true });
    }
        
    const state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    const scope = 'user-read-private user-read-email user-top-read user-read-recently-played';
    res.redirect(
      'https://accounts.spotify.com/authorize?' + querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope,
        redirect_uri,
        state,
      })
    );
  })

router
  .route('/register')
  .get(async (req, res) => {
    res.status(200).render('pages/register', { title: "Register" })
  })
  .post(async (req, res) => {
    let {
      usernameInput,
      passwordInput,
      confirmPasswordInput,
      emailInput
    } = req.body;

    usernameInput = xss(usernameInput);
    emailInput = xss(emailInput);
    passwordInput = xss(passwordInput);
    confirmPasswordInput = xss(confirmPasswordInput);

    let error = []
    let missingFields = []

    let username = usernameInput.trim().toLowerCase();
    let password = passwordInput.trim();
    let confirmPassword = confirmPasswordInput.trim();
    let email = emailInput.trim().toLowerCase();

    // Check missing fields
    if(!username || username === '') { missingFields.push('username') }
    if(!password || password === '') { missingFields.push('password') }
    if(!confirmPassword || confirmPassword === '') { missingFields.push('confirm password') }
    if(!email || email === '') { missingFields.push('email') }
    if(missingFields.length > 0) {
      return res.status(400).render('pages/register', { 
        title: 'Register', 
        missingFields: missingFields.join(', '), 
        missing: true 
      });
    }
      
    const userCollection = await users();
    // Validate registration inputs
    if(!helpers.checkName(username)) { error.push('Invalid username') }
    if(!helpers.checkEmail(email)) { error.push('Invalid email') }
    if(!helpers.checkPassword(password)) { error.push('Invalid password') }
    if(!helpers.checkPassword(confirmPassword)) { error.push('Invalid confirm password') }
    if (confirmPassword !== password) {
      error.push('Passwords do not match')
    }
    
    // Do not allow duplicate users
    const dupeEmail = await userCollection.findOne({ email: email })
    if(dupeEmail){
      error.push(`Email already exists`);
    }
    const dupeName = await userCollection.findOne({ username: username })
    if(dupeName){
      error.push(`Username already exists`);
    }
    
    if (error.length > 0){
    return res.status(400).render('pages/register', { 
      title: 'Register', 
      errorMessage: error.join(`, `), 
      error: true });
    }

    username = xss(username);
    email = xss(email);
    password = xss(password);
    confirmPassword = xss(confirmPassword);
    console.log(password);
;
    try {
      await userData.create(username, email, password);
      return res.status(200).redirect('/users/login');
    } catch(e){
      return res.status(500).render('pages/register', { 
        title: 'Register', 
        errorMessage: 'Failed to create user. Please try again!', 
        error: true 
      });
    }
  });
router.get('/callback', async (req, res) => {
  // your application requests refresh and access tokens
  // after checking the state parameter
  const code = req.query.code || null;
  const state = req.query.state || null;
  console.log(state);
  // const storedState = req.cookies ? req.cookies[stateKey] : null;
  // console.log(storedState)

  if (state === null) {
    res.redirect('/#' + querystring.stringify({ error: 'state_mismatch' }));
  } else {
    res.clearCookie(stateKey);
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      data: {
        code,
        redirect_uri,
        grant_type: 'authorization_code',
      },
      headers: {
        Authorization: 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
      },
    };

    try {
      const { data: body } = await axios.post(authOptions.url, querystring.stringify(authOptions.data), {
        headers: authOptions.headers,
      });

      if (body && body.access_token) {
        const { access_token, refresh_token } = body;

        // Storing access_token and refresh token in session
        req.session.user.access_token = access_token;
        req.session.user.refresh_token = refresh_token;

        res.redirect('/users/dashboard');
      } else {
        res.redirect('/#' + querystring.stringify({ error: 'invalid_token' }));
      }
    } catch (error) {
      console.error(error);
      res.redirect('/#' + querystring.stringify({ error: 'invalid_token' }));
    }
  }
});


router.get('/refresh_token', async (req, res) => {
  try {
    const refresh_token = req.query.refresh_token;
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')) },
      data: {
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      }
    };
    
    const response = await axios.post(authOptions.url, authOptions.data, { headers: authOptions.headers });
    if (response.status === 200) {
      const access_token = response.data.access_token;
      res.send({
        'access_token': access_token
      });
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

router.post("/acceptFriend/:id",async(req,res)=>{
 try {
    
  let idFriend = req.params.id
  let id = req.session.user.id

  try {
    helpers.checkValidId(id)
    helpers.checkValidId(idFriend)  
  } catch (error) {
    return res.status(404).json({ error: error });
  }
  id = id.trim();
  idFriend = idFriend.trim();

  const result = await userData.acceptFriend(id,idFriend)

  return res.status(200).redirect('/users/pendingRequests')
  } catch (e) {
    res.status(500).redirect('/users/pendingRequests')
  }
})

router.post("/sendFriendRequest",async(req,res)=>{
  let friendObjects = [];
  let error = [];
  try {
  let friendEmail = req.body.email
  friendEmail = xss(friendEmail);
   let id = req.session.user.id
    const user = await userData.get(id);
    const friends = user.friends;
    for (const friendId of friends) {
      const friendObject = await get(friendId);
      friendObjects.push(friendObject);
    }

    friendEmail = friendEmail.trim().toLowerCase();

   if (!friendEmail || Object.keys(friendEmail).length === 0) {
    error.push('Email cannot be empty')
   }

  if(!helpers.checkEmail(friendEmail)) error.push('Invalid email');

  const userCollection = await users();
    const unknownUser = await userCollection.findOne({ email: friendEmail });
    if (!unknownUser) {
      error.push(`No user with email ${friendEmail}`);
    }

    let idFriend = await userData.getByEmail(friendEmail);

    id = id.trim();
    idFriend = idFriend.trim();

   try {
    helpers.checkValidId(id)
    helpers.checkValidId(idFriend)  
  } catch (error) {
    return res.status(404).json({ error: error });
  }
 
    const user2 = await userData.get(idFriend);

  if(friendEmail === user.email) error.push('Cannot send friend request to yourself')

  if (friends.includes(idFriend)) {
    error.push(`This user is already a friend`)
  }

  const user2PendingRequest = user2.pendingRequests;
  if(user2PendingRequest.includes(id)) {
    error.push('Friend Request already sent')
  }

  

  if(error.length > 0) {
    return res.status(400).render("pages/friendsDashboard",{title:"Friends",friends: friendObjects, error: true, errorMsg: error.join(', ')})
  }
   const result = await userData.sendFriendRequest(id,idFriend)
 
   return res.status(200).render("pages/friendsDashboard",{title:"Friends",friends: friendObjects, _id:idFriend, success:true})
   } catch (e) {
     return res.status(500).render("pages/friendsDashboard",{title:"Friends",friends: friendObjects, error: true, errorMsg: error.join(', ')})
   }
})

router.post("/rejectFriendRequest/:id",async(req,res)=>{
  try {
    
    let idFriend = req.params.id
    let id = req.session.user.id
  
    try {
      helpers.checkValidId(id)
      helpers.checkValidId(idFriend)  
    } catch (error) {
      return res.status(404).json({ error: error });
    }
    id = id.trim();
    idFriend = idFriend.trim();
  
    const result = await userData.rejectFriendRequest(idFriend,id)
  
    return res.status(200).redirect('/users/pendingRequests')
    } catch (e) {
      res.status(500).redirect('/users/pendingRequests')
    }
  })

router.get('/dashboard', async (req, res) => {
  // const {id} = req.session.user.id;
  if (req.session.user && req.session.user.access_token) {
    // Use access token to make API requests
    const authOptions = {
      url: 'https://api.spotify.com/v1/me',
      headers: {
        Authorization: `Bearer ${req.session.user.access_token}`,
      },
    };

    let user_id;
    try {
      user_id = checkValidId(req.session.user.id);
    } catch (error) {
      return res.status(400).render('pages/dashboard', {
        title: 'Dashboard',
        error: true,
        errorMessage: error
      })
    }

    let userInfo;

    try {
      const { data : body } = await axios.get(authOptions.url, { headers: authOptions.headers });
      const profilePhoto = userData.updatePhoto(req.session.user.id, body.images[0].url);
      userInfo = await get(req.session.user.id);

      return res.status(200).render('pages/dashboard', {
        title: 'Dashboard',
        // username: user.username,
        likeCount: userInfo.likeCount,
        user : body,
        userInfo : userInfo
      })
    } catch (error) {
      // Handle error
      console.log(error);
      return res.render("pages/dashboard",{        
        title: 'Dashboard',
        // username: user.username,
        // likeCount: userInfo.likeCount,
        // user : body,
        userInfo : userInfo,
        errorMessage : error
      })
      // console.log(error);
      // res.redirect('/');
    }
  }
  else
  res.redirect("/")
})

router
  .route('/toptracks')
  .get(async (req, res) => {
    try {
      if (req.session.user && req.session.user.access_token) {
        const { id } = req.session.user;
        const access_token = req.session.user.access_token;
        // Default time range is medium term (6 months)
        const time_range = "medium_term";

        const topTracks = await userData.getTopTracks(id, time_range, access_token);
        return res.status(200).render('pages/top-tracks', {
          title: 'Top Tracks',
          topTracks: topTracks
        })
      }
    } catch (e) {
      console.log(e);
      return res.status(400).render('pages/top-tracks', {
        title: 'Error',
        err: true,
        error: e
      })
    }
  })
  .post(async (req, res) => {
    try {
      // POST request for changing time range
      if (req.session.user && req.session.user.access_token) {
        const { id } = req.session.user;
        const access_token = req.session.user.access_token;
        let { time_range } = req.body;

        time_range = xss(time_range);

        const topTracks = await userData.getTopTracks(id, time_range, access_token);
        return res.status(200).render('pages/top-tracks', {
          title: 'Top Tracks',
          topTracks: topTracks
        })
      }
    } catch (e) {
      console.log(e);
      return res.status(400).render('pages/top-tracks', {
        title: 'Error',
        err: true,
        error: e
      })
    }
  })

router
  .route('/topartists')
  .get(async (req, res) => {
    try {
      if (req.session.user && req.session.user.access_token) {
        const { id } = req.session.user;
        const access_token = req.session.user.access_token;
        const time_range = "medium_term";

        const topArtists = await userData.getTopArtists(id, time_range, access_token);
        return res.status(200).render('pages/top-artists', {
          title: 'Top Artists',
          topArtists: topArtists
        })
      }
    } catch (e) {
      console.log(e);
      return res.status(400).render('pages/top-artists', {
        title: 'Error',
        err: true,
        error: e
      })
    }
  })
  .post(async (req, res) => {
    try {
      if (req.session.user && req.session.user.access_token) {
        const { id } = req.session.user;
        const access_token = req.session.user.access_token;
        let { time_range } = req.body;

        time_range = xss(time_range);
  
        const topArtists = await userData.getTopArtists(id, time_range, access_token);
        return res.status(200).render('pages/top-artists', {
          title: 'Top Artists',
          topArtists: topArtists
        })
      }
    } catch (e) {
      console.log(e);
      return res.status(400).render('pages/top-artists', {
        title: 'Error',
        err: true,
        error: e
      })
    }
  })

router.get('/friends', async (req, res) => {
   const id = req.session.user.id;
  
  try {
    const user = await userData.get(id);
    const friends = user.friends;

    const friendObjects = [];

    for (const friendId of friends) {
      const friendObject = await get(friendId);
      friendObjects.push(friendObject);
    }

    return res.status(200).render('pages/friendsDashboard', { title: "Friends", friends: friendObjects});

  } catch (e) {
    console.error(e)
    return res.status(400);
  }
});

router.get('/friends/:id', async (req, res) => {
  const id = req.params.id;
  if(req.session.user){
  let userId = req.session.user.id  
  //let userId = '643cb4bf7f4290f4eb398d26'
  let profileLiked=false
  try {
    const friend = await userData.get(id);
    const friend2 = await userData.get(userId);
    const users= getAll()

    if(friend2.likedProfiles.includes(id))
    profileLiked = true;

    
    let result = await userData.topArtistTogether(id,userId);
    let result2 = await userData.topSongTogether(id,userId);
    let musicCompatibility = await userData.musicCompatibility(id,userId);
    let topArtist;
    let topSong;
    if(result[0] === "") {
      topArtist = " No Top Artist together"
    }
    else {
      topArtist = result[0]
    }

    if(result2[0] === "") {
      topSong = " No Top Song together"
    }
    else{
      topSong = result2[0]
    }
    // return res.status(200).json({ message: " No Top Artist together" })

    // return res.status(200).json(result[0])

    
    return res.status(200).render('pages/friendProfile', { 
      title: "Friend", 
      users: friend , 
      userId:friend._id, 
      profilePhoto: friend.profilePhoto,
      likeCount: friend.likeCount, 
      profileLiked:profileLiked, 
      topArtist:topArtist, 
      topSong:topSong , 
      musicCompatibility:musicCompatibility, 
      username: friend.username});

  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    return res.status(status).render("pages/friendProfile", { title: "Friend", error:true, errorMessage:message})
  }
}
else{
  res.redirect("/")
}
});

router
 .route('/likeProfile/:id')
 .put( async(req,res)=>{
  if(req.session.user){
    let id1 = req.session.user.id
    //let id1= '643cb4bf7f4290f4eb398d26'
    let id2 = req.params.id

    try {
      helpers.checkValidId(id1)
      helpers.checkValidId(id2)
    } catch (error) {
      return res.status(400).json(error);
      return
    }
   
    try {
      let result = await likeProfile(id1,id2);

      return res.status(200).json(result)
    } catch (e) {
     let status = e[0] ? e[0] : 500;
     let message = e[1] ? e[1] : 'Internal Server Error';
     return res.status(status).json(message)
    }

  }
  else{
    res.redirect("/")
  }
})
.delete( async(req,res)=>{
  if(req.session.user){
    let id1 = req.session.user.id
    //let id1= '643cb4bf7f4290f4eb398d26'
    let id2 = req.params.id

    try {
      helpers.checkValidId(id1)
      helpers.checkValidId(id2)
    } catch (error) {
      return res.status(400).json(error);
      return
    }
   
    try {
      let result = await unlikeProfile(id1,id2);

      return res.status(200).json(result)
    } catch (e) {
     let status = e[0] ? e[0] : 500;
     let message = e[1] ? e[1] : 'Internal Server Error';
     return res.status(status).json(message)
    }

  }
  else{
    res.redirect("/")
  }
})

router.get('/topSong/:id', async(req, res)=>{
  if(req.session.user){

    let id1 = req.session.user.id
    let id2 = req.params.id

    try {
      helpers.checkValidId(id1)
      helpers.checkValidId(id2)
    } catch (error) {
      return res.status(400).json(error);
    }

    try {
      let result = await userData.topSongTogether(id1,id2);
      if(result[0] === "")
      return res.status(200).json({ message: " No Top song together" })
      
      return res.status(200).json(result[0])
    } catch (e) {
     let status = e[0] ? e[0] : 500;
     let message = e[1] ? e[1] : 'Internal Server Error';
     return res.status(status).json(message)
    }
  }
  else{
    res.redirect("/")
  }
})

router.get('/topArtist/:id', async(req, res)=>{
  if(req.session.user){

    let id1 = req.session.user.id
    let id2 = req.params.id

    try {
      helpers.checkValidId(id1)
      helpers.checkValidId(id2)
    } catch (error) {
      return res.status(400).json(error);
    }

    try {
      let result = await userData.topArtistTogether(id1,id2);
      if(result[0] === "")
      return res.status(200).json({ message: " No Top Artist together" })

      return res.status(200).json(result[0])
    } catch (e) {
     let status = e[0] ? e[0] : 500;
     let message = e[1] ? e[1] : 'Internal Server Error';
     return res.status(status).json(message)
    }
  }
  else{
    res.redirect("/")
  }
})

router.get('/musicCompatibility/:id', async(req, res)=>{
  if(req.session.user){

    let id1 = req.session.user.id
    let id2 = req.params.id

    try {
      helpers.checkValidId(id1)
      helpers.checkValidId(id2)
    } catch (error) {
      return res.status(400).json(error);
    }

    try {
      let result = await userData.musicCompatibility(id1,id2);
      return res.status(200).json(result)
    } catch (e) {
     let status = e[0] ? e[0] : 500;
     let message = e[1] ? e[1] : 'Internal Server Error';
     return res.status(status).json(message)
    }
  }
  else{
    res.redirect("/")
  }
})

router.get('/dailyplaylist', async (req, res) => {
  try {
    if (req.session.user && req.session.user.access_token) {
      const { id } = req.session.user;
      const access_token = req.session.user.access_token;
      const dailyPlaylist = await userData.getDailyPlaylist(id, access_token)
  
      return res.status(200).render('pages/daily-playlist', {
        title: 'Custom Playlist',
        dailyPlaylist: dailyPlaylist
      })
    }
  } catch (e) {
    console.log(e);
    return res.status(400).render('pages/daily-playlist', {
      title: 'Error',
      err: true,
      error: e
    })
  }
})

router.get('/pendingRequests', async (req, res) => {
  try {
    if (req.session.user && req.session.user.access_token) {
      let { id } = req.session.user;
      const user = await userData.get(id);
      let pendingRequests = user.pendingRequests;

      const pendingObjects = [];

    for (const pendingId of pendingRequests) {
      const pendingObject = await get(pendingId);
      pendingObjects.push(pendingObject);
    }
    console.log(pendingObjects)
      return res.status(200).render('pages/pendingRequests', {
        title: 'Pending Requests',
        pendingRequests: pendingObjects
      })
    }
  } catch (e) {
    console.log(e);
    return res.status(400).render('pages/pendingRequests', {
      title: 'Error',
      err: true,
      error: e
    })
  }
})

router.route('/logout').get(async (req, res) => {
  //code here for GET
  try {
    // Destroy session
    req.session.destroy();

    // Render logout page
    return res.render('pages/logout', { title: 'Logout' });

  } catch (e) {
    return res.status(404).json({ message: e });
  }
});


export default router