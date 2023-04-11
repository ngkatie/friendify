import express from 'express';
import * as querystring from 'querystring';

var app = express();
//configRoutes(app);
app.get('/', (req, res) => {
  // Landing page
  res.send("Hello User");

});


// app.use(express.static(__dirname + '/public'))
//    .use(cors())
//    .use(cookieParser());


function generateRandomString(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

async function generateCodeChallenge(codeVerifier) {
    function base64encode(string) {
      return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
  
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    if(typeof window !== 'undefined'){
    var digest = await window.crypto.subtle.digest('SHA-256', data);
    }
    return base64encode(digest);
  }

app.get('/login', async function(req, res) {

//   if(typeof window !== 'undefined'){
//   var digest = await window.crypto.subtle.digest('SHA-256', data);
//   }

  const clientId = '4d4b1abc9b684dd58186ced30e4a5cb4';
  const redirectUri = 'http://localhost:3000';
  
  let codeVerifier = generateRandomString(128);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  let state = generateRandomString(16);
  let scope = 'user-read-private user-read-email';

  if(typeof localStorage!=='undefined'){
      localStorage.setItem('code-verifier', codeVerifier);
  }
  
  let args = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUri,
    state: state,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  });
  
  if(typeof window!== "undefined"){
  window.location = 'https://accounts.spotify.com/authorize?' + args;
  var urlParams = new URLSearchParams(window.location.search);
  }
  
  if(typeof code!=='undefined'){
  var code = urlParams.get('code');
  }
  if(typeof localStorage !== 'undefined'){
  codeVerifier = localStorage.getItem('code_verifier');
  }

let body = new URLSearchParams({
  grant_type: 'authorization_code',
  code: code,
  redirect_uri: redirectUri,
  client_id: clientId,
  code_verifier: codeVerifier
});

const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body
  })

if (!response.ok) {
    throw new Error('HTTP status ' + response.status);
  }
return response.json();

})

console.log('Listening on 3000');
app.listen(3000);
