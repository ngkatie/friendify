import { ObjectId } from "mongodb";
import { users } from "../config/mongoCollections.js";
import * as helpers from "../helpers.js";
import { get } from "./users.js";


/*
* This function would be used to create a comment on users profile
* @id: id of the user where comment is to be Created
* @userId: the id of the user creating the comment
* @username: the username of the user creating the comment
* @comment: comment created by the user
*/
const createComment = async (id, userId, username, comment) => {
  
    let id_ = helpers.checkValidId(id);             // User receiving comment (receiver)
    let userId_ = helpers.checkValidId(userId);     // User creating comment (writer)
    let username_ = helpers.checkName(username);    // Writer's username
    let comment_ = helpers.checkString(comment);
    // if (!helpers.checkString(comment)) {
      // throw "Error: Must give comment text as a string";
    // }
  
    const userCollections = await users();
  
    const receiver = await get(id_);
    const writer = await get(userId_);
    const writer_username = writer.username;

    // Verify that id and username provided match
    if (username_ !== writer_username) {
      throw 'UserId and Username do not match';
    }

    // Check that user exists 
    if (receiver === null) { 
      throw "Error: The user receiving the comment cannot be found";
    };
    
    let newComment = {
      _id: new ObjectId(),
      userId: userId_,
      username: username_,
      comment: comment_
    };

    const updatedInfo = await userCollections.findOneAndUpdate(
      { _id: id_ },
      { $push: { comments: newComment } }
    );

    // const updatedInfo = await userCollections.updateOne(
    //   { _id: new ObjectId(id) },
    //   { $push: { comments: newComment } }
    // );

    if (updatedInfo.modifiedCount === 0) {
      throw "Could not update user collection with comment Data!";
    }

    const user = await userCollections.findOne({ _id: id_ });
    if (user === null) { throw "No user found with that id" }
  
    // Returns user object with _id as string instead of ObjectId
    return helpers.idToString(user);
  };


/*
 * This function will be used to remove comments from user Profile
 * @userId: the id of the user from which comment is to be removed
 * @commentId: comment id of the comment
 */
const removeComment = async(userId, commentId) => {
  
  // userId_ and commentId_ are ObjectId
  const userId_ = checkValidId(userId);
  const commentId_ = checkValidId(commentId);

  const userCollection = await users();

  const user = await get(userId_);
  let newCommentArray = [];

  const comment = user.comments;

  if (comment.length === 0) {
    return "Error: There are no comments to Remove";
  }

  let i = 0;
  comment.forEach(element => {
    if (element._id != commentId) {
      newCommentArray[i++] = element;
    }
  });

  let userInfo = {
    username: user.username,
    email: user.email,
    // spotify_access_token: user.spotify_access_token,
    hashed_password: user.hashed_password,
    topTracks: user.topTracks,
    topArtists: user.topArtists,
    dailyPlaylist: user.dailyPlaylist,
    likeCount: user.likeCount,
    comments: newCommentArray,
    likedProfiles: user.likedProfiles,
    pendingRequests: user.pendingRequests,
    friends: user.friends,
  }

  const updateInfo = await userCollection.findOneAndReplace(
    { _id: userId_ },
    userInfo,
    { returnDocument: 'after' }
  );
  
  
  if (updateInfo.lastErrorObject.n === 0) {
    throw [
      404,
      `Error: Update failed, could not update a user with id of ${idFriend}`
    ]
  }
    return updateInfo.value; 

}

const getAllComments = async(userId) => {
  const userId_ = checkValidId(userId)
  
  const userCollection = await users();
  const user = await userCollection.findOne({ _id: userId_ });

  return user.comments;  

}

export {
  createComment, 
  removeComment, 
  getAllComments
}
  