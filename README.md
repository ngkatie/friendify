# Friendify

The purpose of this website is to provide insight on a user’s music taste compared to their friends, encouraging them to discover new music that might be of interest! Implemented with the Spotify API, the application generates the user's Top 50 Tracks, Top 50 Artists, and Daily Playlist. Users can also add friends to view their Music Compatibility Score, as well as shared tracks and artists.

## Local Setup

1. Clone repo locally.

```
git clone https://github.com/ngkatie/friendify
```

2. Install all dependencies.

```
npm install
```
3. Update .env file in your root directory and add your CLIENT_ID and CLIENT_SECRET from your app on Spotify's Developer Dashboard
https://developer.spotify.com/dashboard

4. If you would to log in with your own Spotify account, add your email address to Spotify's Developer Dashboard https://developer.spotify.com/dashboard (Friendify >> Settings >> User Management). 

5. Navigate to the `tasks` directory and run the seed file.
```
cd tasks
node seed.js
```

4. Navigate back to the `friendify` directory. Run the program.
```
cd ..
npm start
```

## How the Application Works
### Authentication and Authorization
* Upon opening http://localhost:3000 in a browser, the landing page will load, with options to _Log In_ or _Register_. 
* Non-authenticated users will not be able to access any page but the landing, login, and registration pages.
* At login, users will be redirected to Spotify to log in with their Spotify credentials. This is necessary for authorizing Friendify to access the user's Spotify data.
### User Dashboard and Music History
* After login, authenticated users will be able to access their user dashboard, displaying their profile information, like count, and comments.
* Using the navigation bar, authenticated users can view information about their _Top Tracks_ and _Top Artists_ across three time ranges. The application also generates a _Daily Playlist_ of personalized recommendations, recently played, tracks from top charts, and the user's old favorites.
### Friends
* Under the _Friends_ page, users can send friend requests by email. Users on the receiving end of a friend request can accept or reject the request.
* Friends will be able to view each other's profiles to view their _Music Compatibility Score_, _Top Shared Track_, and _Top Shared Artist_.
* Friends can like and comment on each other's profiles. Comments on a user's pages, as well as their total like count, are visible to all his/her friends.
### Logout
* Press _Logout_ to log out of Friendify. To fully log out, users must log out of Spotify via the link provided at logout.


## Extra Features
* Implemented dark mode

## Spotify API
To run the application, request a CLIENT_ID and CLIENT_SECRET from the Spotify Developer Dashboard and insert them into the appropriate variables in the .env file.
