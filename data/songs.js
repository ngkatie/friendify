import axios from "axios";
import { config } from "dotenv";
import * as querystring from "querystring";
import SpotifyWebApi from "spotify-web-api-node";

config();

const clientId = process.env.clientId;
const clientSecret = process.env.clientSecret; 

let spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: 'localhost:3000/'
});

async function getTopTracks(time_range) {
    spotifyApi.getMyTopTracks(time_range, 50).then(
        function(data) {
            let topArtists = data.body.items;
            console.log(topArtists);
        }, 
        function(e) { console.log(e) }
    );
}

async function getTopArtists() {
    spotifyApi.getMyTopArtists(time_range, 50).then(
        function(data) {
            let topArtists = data.body.items;
            console.log(topArtists);
        }, 
        function(e) { console.log(e) }
    );
}
