import axios from "axios";
import { config } from "dotenv";
// import * as querystring from "querystring";
// import SpotifyWebApi from "spotify-web-api-node";

config();

function getArtists(trackObj) {
    // Returns array of artists for a given track
    let res = [];
    trackObj.artists.map(x => res.push(x.name));
    return res;
}

export {
    getArtists
}