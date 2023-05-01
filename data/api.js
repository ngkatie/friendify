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
    const authOptions = {
        url: endpoint,
        headers: {
          Authorization: `Bearer ${access_token}`,
        }
    };
    try {
        data = await axios.get(authOptions.url, { headers: authOptions.headers });
        // console.log(data);
        return data;
    } catch (e) {
        console.log(e);
    }
}

export {
    getEndpoint,
    getAccessToken,
    callEndpoint
}