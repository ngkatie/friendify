import axios from "axios";
import { config } from "dotenv";
import * as querystring from "querystring";
import SpotifyWebApi from "spotify-web-api-node";

config();

const getTrackInformation = async (trackId) => {
    let track = {};
    try {
        const tracksEndpoint = spotifyAPI.getEndpointByType(`tracks/${trackId}`);
        track = await axios.get(tracksEndpoint, {
        headers: { 'Authorization': `Bearer ${token}`}
        });
    } catch (e) { console.error(e) }
    
    let thisTrack = {
        trackName: track.name,
        trackURL: tracks[i].external_urls.spotify,
        artistName: getArtists(track),
        albumName: track.album.name,
        image: track.album.images[0].url
    }

    return thisTrack;
}

function getArtists(trackObj) {
    // Returns array of artists for a given track
    let artists = [];
    trackObj.artists.map(x => artists.push(x));
    return artists;
}

export {
    getArtists,
    getTrackInformation
}