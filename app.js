import express from 'express'; // Express web server framework

import cors from 'cors';

import cookieParser from 'cookie-parser';
import configRoutes from './routes/index.js';

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */

var app = express();
configRoutes(app);


app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());
   


console.log('Listening on 3000');
app.listen(3000);
