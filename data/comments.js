import { ObjectId } from "mongodb";
import { users } from "../config/mongoCollections.js";
import { checkValidId,validString } from "../helpers.js";
import { get } from "./users.js";


/*
* This function would be used to create a comment on users profile
* @id: id of the user where comment is to be Created
* @userId: the id of the user creating the comment
* @username: the username of the user creating the comment
* @comment: comment created by the user
*/
const createComment = async (id, userId,username, comment) => {
  
    checkValidId(id)
    checkValidId(userId)
    if (!validString(comment))
      throw "must give comment text as a string";
  
    const userCollections = await users();
  
    const user1 = await get(id)
    const user2 = await get(userId)
    const userNameFromData= user2.username

    if(username !== userNameFromData)
    throw 'UserId and Username do not match'
  
    if (user1 === null) throw "User profile to which comment added doesnt exist";
    
    let newComment = {
      
      _id: new ObjectId(),
      userId: userId ,
      username: username,
      comment: comment
    };

    const updatedInfo = await userCollections.updateOne(
      { _id: new ObjectId(id) },
      { $push: { comments: newComment } }
    );
    if (updatedInfo.modifiedCount === 0) {
      throw "Could not update user Collection with comment Data!";
    }

    const user = await userCollections.findOne({ _id: new ObjectId(id) });
    if (user === null) throw "No user found with that id";
  
    user._id = user._id.toString();
    return user;
  };


/*
 * This function will be used to remove comments from user Profile
 * @userId: the id of the user from which comment is to be removed
 * @commentId: comment id of the comment
 */
const removeComment= async(userId, commentId) => {
  
    checkValidId(commentId)
    checkValidId(userId)

    const userCollection = await users();

    const user = await get(userId)
    let newCommenArray = []

    const comment = user.comments

    if(comment.length === 0)
    return "Error: There are no comments to Remove"
    let i=0;

    comment.forEach(element => {
        if(element._id != commentId){
            newCommenArray[i++] = element
        }
    });

    let userInfo  = {
        username: user.username,
        email: user.email,
        spotify_access_token: user.spotify_access_token,
        hashed_password: user.hashed_password,
        top_songs: user.top_songs,
        top_artists: user.top_artists,
        dailyPlaylist: user.dailyPlaylist,
        likeCount: user.likeCount,
        comments: newCommenArray,
        likedProfiles: user.likedProfiles,
        pendingRequests: user.pendingRequests,
        friends: user.friends,
    }

    const updateInfo = await userCollection.findOneAndReplace(
        {_id: new ObjectId(userId)},
        userInfo,
        {returnDocument: 'after'}
      );
  
  
    if (updateInfo.lastErrorObject.n === 0)
      throw [
        404,
        `Error: Update failed, could not update a user with id of ${idFriend}`
      ];
  
    return  updateInfo.value; 

}

const getAllComments= async(userId) => {
  checkValidId(userId)
  id = id.trim();
  const userCollection = await users();
  const user = await userCollection.findOne({ _id: new ObjectId(id) });
  user._id = user._id.toString();
  return user.comments;  

}

  export {createComment, removeComment, getAllComments}
  