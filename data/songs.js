import axios from "axios";
import { config } from "dotenv";
import * as querystring from "querystring";
import SpotifyWebApi from "spotify-web-api-node";

config();

function getArtists(trackObj) {
    // Returns array of artists for a given track
    let artists = [];
    trackObj.artists.map(x => artists.push(x));
    return artists;
}

export {
    getArtists
}