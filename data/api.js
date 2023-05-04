import axios from "axios";
import { config } from "dotenv";

config();

const CLIENT_ID = process.env.client_id;
const CLIENT_SECRET = process.env.client_secret;
const BASE_ENDPOINT = `https://api.spotify.com/v1/`;
const AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/api/token";

function getEndpoint(ext) {
    return `${BASE_ENDPOINT}${ext}`;
}

async function getAccessToken() {
    try {
        const response = await axios.post(AUTHORIZE_ENDPOINT, {
            grant_type: "authorization_code",
            code: null 
        }, {
            headers: {
                "Auhtorization": `Basic ${CLIENT_ID}:${CLIENT_SECRET}`,
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
    
        console.log(response);
        return response;
    } catch(e) {
        console.log(e);
    }
}

async function callEndpoint(endpoint, access_token) {
    let data = undefined;
    try {
        data = await axios.get(endpoint, { 
            headers: { Authorization: `Bearer ${access_token}` }
        });
        return data;
    } catch (e) {
        console.log(e);
    }
}

async function callTopEndpoint(endpoint, time_range, limit, access_token) {
    let data = undefined;
    const authOptions = {
        url: endpoint,
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        params: { 
            limit: limit, 
            time_range: time_range 
        },
    };
    try {
        data = await axios.get(authOptions.url, { 
            headers: authOptions.headers, 
            params: authOptions.params 
        });
        return data;
    } catch (e) {
        console.log(e);
    }
}

async function callRecsEndpoint(endpoint, opt_params, access_token) {
    let data = undefined;
    let {
        limit,
        seed_tracks,
        seed_artists,
        seed_genres
    } = opt_params;

    const authOptions = {
        url: endpoint,
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        params: { 
            limit: limit,
            seed_tracks: seed_tracks,       // required
            seed_artists: seed_artists,     // required
            seed_genres: seed_genres        // required
        },
    };
    try {
        data = await axios.get(authOptions.url, { 
            headers: authOptions.headers, 
            params: authOptions.params 
        });
        return data;
    } catch (e) {
        console.log(e);
    }
}

async function callRecentEndpoint(endpoint, limit, access_token) {
    let data = undefined;

    const authOptions = {
        url: endpoint,
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
        params: { 
            limit: limit,
        },
    };
    try {
        data = await axios.get(authOptions.url, { 
            headers: authOptions.headers, 
            params: authOptions.params 
        });
        return data;
    } catch (e) {
        console.log(e);
    }
}

export {
    getEndpoint,
    getAccessToken,
    callEndpoint,
    callTopEndpoint,
    callRecsEndpoint,
    callRecentEndpoint
}