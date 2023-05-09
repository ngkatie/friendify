import express from 'express'; // Express web server framework
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import configRoutes from './routes/index.js';

import { fileURLToPath } from 'url';
import path from 'path';
import exphbs from 'express-handlebars';
import * as middleware from './middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const stat = express.static(__dirname+"/public")
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */



const app = express();
app.use("/public",stat)


const rewriteUnsupportedBrowserMethods = (req, res, next) => {
   if (req.body && req.body._method) {
      req.method = req.body._method
      delete req.body._method
   }
}


// app.use(express.static(__dirname + '/public'))
app.use(cors())
   .use(cookieParser())
   .use(express.json())
   .use(express.urlencoded({ extended: true }))
   .use(session({
      name: 'AuthCookie',
      secret: 'Secret!',
      resave: false,
      saveUninitialized: false,
   }));
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.get('/', middleware.hasCookie);
app.get('/users/login', middleware.hasCookie);
app.get('/users/register', middleware.hasCookie);
app.get('/users/logout', middleware.noCookie);

app.get('/users/dashboard', middleware.noCookie);
app.get('/users/friends', middleware.noCookie);
app.get('/users/toptracks', middleware.noCookie);
app.get('/users/topartists', middleware.noCookie);
app.get('/users/topdailyplaylist', middleware.noCookie);
app.get('/users/friends', middleware.noCookie);
app.get('/users/pendingRequests', middleware.noCookie);
app.get('/users/sendFriendRequest', middleware.noCookie);
app.get('/users/friends/:id', middleware.noCookie);
app.get('/users/friends/:id', middleware.notFriend);



configRoutes(app);
app.listen(3000, () => {
      console.log("We've now got a server!");
      console.log('Your routes will be running on http://localhost:3000');
})