import  { Router } from 'express';
import { ObjectId } from 'mongodb';
import { commentData } from '../data/index.js';
import * as helpers from "../helpers.js";
import xss from 'xss';
import { get } from '../data/users.js';
import { userData } from '../data/index.js';

const router = Router();

router
  .route("/:userId")
  .get(async (req, res) => {

    if(req.session.user){
      const userId_ = req.params.userId;
      const userId = undefined;
      try {
        userId = helpers.checkValidId(userId_);
        userIdString = userId.toString();
      } catch (e) {
        return res.status(400).json({ error: e });
      }

      try {
        const user = await get(userIdString);
      } catch (e) {
        return res.status(404).json({ error: "No user with id" });
      }
      try {
        const comments = await commentData.getAllComments(userIdString);
        res.status(200).json(comments);
      } catch (e) {
        //   res.status(404).json({ error: "No comment for the given id" });
        console.log(e);
      }
    }
    else {
      res.redirect("/");
    }
  })
  /*
* This route would be used to create a comment on users profile
* @userId: id of the user where comment is to be Created
* @id: the id of the user creating the comment
* @comment: comment created by the user
*/
.post(async (req, res) => {

  if(req.session.user){
    
    let id = req.session.user.id;
    id = id.toString();

    let commentInfo = req.body;
    // commentInfo = xss(commentInfo);

    if (!commentInfo) {
        return res.status(400).json("Comment text is empty");
    }

    let comment = undefined;
    try {
      comment = helpers.checkString(commentInfo.comment);
    } catch (e) {
      return res.status(400).json("Comment Text Invalid");
    }


    try{
      // commentInfo.userId = validId(req.session.user);
      //var id= commentInfo.id
      commentInfo.comment = xss(
        helpers.checkString(commentInfo.comment)
      );

      id = helpers.checkValidId(id);
      var userId = req.params.userId;
      userId = helpers.checkValidId(req.params.userId);
      
      const userData = await get(id.toString());
      var userName = userData.username;
    } catch (e) {
      // return res.status(404).json({ error: "No user for the given id" });  
      console.log(e)
      return res.status(404).json({ error: e });  
    }
    
    try {
      const user = await commentData.createComment(
        userId.toString(),
        id.toString(),
        userName,
        commentInfo.comment.trim()
      );
      var allcomm = user["comments"];

      let lastelm = allcomm.slice(-1);
      //return lastelm[0];

      return res.json({
        layout: null,
        userData: lastelm[0],
        userLoggedIn: true,
      })
        
    } catch (e) {   
      let status = e[0] ? e[0] : 500;
      let message = e[1] ? e[1] : ' Error occurred while creating the comment';
      return res.status(status).json({ errorMessage:message})
    }
  }
  else{
    res.redirect("/")
  } 
})

  /*
* This route would be used to remove a comment on users profile
* @userId: id of the user where comment is to be Created
* @commentId: comment created by the user
*/
router
  .route("/remove/:userId")
  .post(async(req,res)=>{
      //code here for DELETE
      let comment_ = req.body;
      let commentId_ = comment_.commentId;
      comment_ = xss(comment_);

      const userId = undefined;
      const commentId = undefined;
      try {
        userId = helpers.checkValidId(req.params.userId);
        commentId = helpers.checkValidId(commentId_);
      } catch (e) {
        return res.status(400).json({error: e});
      }

      // Ensure user exists
      try {
        let userData = await get(req.params.userId);
      } catch (e) {
        return res.status(404).json({error: 'User not found'});
      }

      try {
        let deletedband = await removeComment(userId, commentId);
        res.json(deletedband);
      } catch (e) {
        let status = e[0] ? e[0] : 500;
        let message = e[1] ? e[1] : 'Internal Server Error';
        res.status(status).send({error: message});
      }

  });

  export default router;