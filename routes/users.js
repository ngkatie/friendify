import { Router } from 'express';
export const router = Router();
// import { ObjectId } from 'mongodb';
import { userData } from '../data/index.js';
import querystring from 'querystring';
import * as helpers from '../helpers.js';
import axios from 'axios'; // Axios library
import dotenv from 'dotenv';


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
  .post(async (req, res) => {
    let authenticatedUser = await userData.checkUser(req.body.usernameInput, req.body.passwordInput);
    if (authenticatedUser) {
      const state = generateRandomString(16);
      res.cookie(stateKey, state);

      // your application requests authorization
      const scope = 'user-read-private user-read-email';
      res.redirect(
        'https://accounts.spotify.com/authorize?' +
          querystring.stringify({
            response_type: 'code',
            client_id: CLIENT_ID,
            scope,
            redirect_uri,
            state,
          })
      );
    }
  });

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

    try {
      const username = helpers.checkName(usernameInput);
      const email = helpers.checkEmail(emailInput);
      const password = helpers.checkPassword(passwordInput);
      const confirmPassword = helpers.checkPassword(confirmPasswordInput);

      if (confirmPassword !== password) {
        return res.status(400).render('pages/register', { 
          title: 'Register', 
          err: true,
          error: 'Error: Passwords do not match' 
        })
      }

      const newUser = await userData.create(username, email, password);
      console.log(newUser);
      if (newUser) {
        return res.status(200).redirect('/');
      }
      else {
        return res.status(500).json({ error: 'Internal Server Error '});
      }
    } catch (e) {
      return res.status(400).json({ error: 'no lol' });
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
        req.session.user = {
          access_token : access_token,
          refresh_token : refresh_token
        }

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


// This function will be used to get data about the user from spotify
router.get('/userprofile', async(req, res) => {
  // Check if user is authenticated
  if (req.session.user && req.session.user.access_token) {
    // Use access token to make API requests
    const authOptions = {
      url: 'https://api.spotify.com/v1/me',
      headers: {
        Authorization: `Bearer ${req.session.user.access_token}`,
      },
    };

    try {
      const { data : body } = await axios.get(authOptions.url, { headers: authOptions.headers });
     // res.render('profile', { user: body });
     console.log({body})
    } catch (error) {
      // Handle error
      console.log(error);
      res.redirect('/');
    }
    
  } else {
    // Redirect user to login page
    res.redirect('/login');
  }
});



router.post("/acceptFriend/:id",async(req,res)=>{
 try {
    
  let id = req.params.id
  let userInfo = req.body

  if (!userInfo || Object.keys(userInfo).length === 0) {
   return res
     .status(400)
     .json({error: 'There are no fields in the request body'});
 }
  let idFriend = userInfo.idFriend
  try {
    helpers.checkValidId(id)
    helpers.checkValidId(idFriend)  
  } catch (error) {
    return res.status(404).json({ error: error });
  }
  id = id.trim();
  idFriend = idFriend.trim();

  const result = await userData.acceptFriend(id,idFriend)

  return res.json(result)
  } catch (e) {
    let status = e[0] ? e[0] : 500;
    let message = e[1] ? e[1] : 'Internal Server Error';
    res.status(status).send({error: message});
  }
})

router.post("/sendFriendRequest/:id",async(req,res)=>{
  try {
     
   let id = req.params.id
   let userInfo = req.body

   if (!userInfo || Object.keys(userInfo).length === 0) {
    return res
      .status(400)
      .json({error: 'There are no fields in the request body'});
  }
   let idFriend = userInfo.idFriend
   try {
    helpers.checkValidId(id)
    helpers.checkValidId(idFriend)  
  } catch (error) {
    return res.status(404).json({ error: error });
  }
 
   id = id.trim();
   idFriend = idFriend.trim();
 
   const result = await userData.sendFriendRequest(id,idFriend)
 
   return res.json(result)
   } catch (e) {
     let status = e[0] ? e[0] : 500;
     let message = e[1] ? e[1] : 'Internal Server Error';
     res.status(status).send({error: message});
   }
 })

 router.post("/rejectFriendRequest/:id",async(req,res)=>{
  try {
     
   let id = req.params.id
   let userInfo = req.body

   if (!userInfo || Object.keys(userInfo).length === 0) {
    return res
      .status(400)
      .json({error: 'There are no fields in the request body'});
  }
   let idFriend = userInfo.idFriend
   try {
    helpers.checkValidId(id)
    helpers.checkValidId(idFriend)  
  } catch (error) {
    return res.status(404).json({ error: error });
  }
 
   id = id.trim();
   idFriend = idFriend.trim();
 
   const result = await userData.rejectFriendRequest(id,idFriend)
 
   return res.json(result)
   } catch (e) {
     let status = e[0] ? e[0] : 500;
     let message = e[1] ? e[1] : 'Internal Server Error';
     res.status(status).send({error: message});
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

    try {
      const { data : body } = await axios.get(authOptions.url, { headers: authOptions.headers });
      return res.status(200).render('pages/userProfile', {
        title: 'Dashboard',
        // username: user.username,
        // likeCount: user.likeCount,
        // comments: user.comments
        user : body
      })
    } catch (error) {
      // Handle error
      console.log(error);
      res.redirect('/');
    }
  }})

router.get('/toptracks', async (req, res) => {
  //const {id} = req.session.user.id;
  // const id = '6445bf8f4a4c6219a9fcc324';
  if (req.session.user && req.session.user.access_token) {
    // const user = await userData.get(id);
    console.log(req.session.user.access_token);
    const access_token = req.session.user.access_token;
    console.log(access_token);
    const topSongs = await userData.getTopTracks(access_token);
    console.log(topSongs);
    return res.status(200).render('top-songs', {
      title: 'top-songs',
      topSongs: user.topSongs
    })
  }
  else {
    console.log('stop');
  }
})

// router.get('/topartists', async (req, res) => {
//   const {id} = req.session.user.id;
//   try {
//     const user = await userData.get(id);

//     return res.status(200).render('dashboard', {
//       title: 'Dashboard',
//       topSongs: user.topArtists
//     })
//   } catch (e) {
//     return res.status(400).log(e);
//   }
// })

router.get('/friends', async (req, res) => {
   const { id } = req.session.user.id;
  try {
    const user = await userData.get(id);
    const friends = user.friends;
    return res.status(200).render('friendsDashboard', { title: "Friends", friends: friends });

  } catch (e) {
    return res.status(400).log(e);
  }
});

router.get('/friends/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const friend = await userData.get(id);
    return res.status(200).render('friendProfile', { title: "Friend", friend: friend });

  } catch (e) {
    return res.status(400).log(e);
  }
})


export default router