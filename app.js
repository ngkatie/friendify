import express from 'express'; // Express web server framework
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import configRoutes from './routes/index.js';

import { fileURLToPath } from 'url';
import path from 'path';
import exphbs from 'express-handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */

const app = express();


const rewriteUnsupportedBrowserMethods = (req, res, next) => {
   if (req.body && req.body._method) {
      req.method = req.body._method
      delete req.body._method
   }
}

app.use(express.static(__dirname + '/public'))
   .use(cors())
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

configRoutes(app);
app.listen(3000, () => {
      console.log("We've now got a server!");
      console.log('Your routes will be running on http://localhost:3000');
})