import  { Router } from 'express';
import { ObjectId } from 'mongodb';
import { getAllComments, createComment, removeComment } from '../data/comments.js';
import { checkValidId,validString } from "../helpers.js";

import { get } from '../data/users.js';
import { userData } from '../data/index.js';

const router = Router();

router
  .route("/:userId")
  .get(async (req, res) => {
    try {
      req.params.userId = checkValidId(req.params.userId);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
    try {
      const userId = req.params.userId;
      await get(userId);
    } catch (e) {
      return res.status(404).json({ error: "No user with id" });
    }
    try {
      const userId = req.params.userId;

      const comment = await getAllComments(userId);
      res.status(200).json(comment);
    } catch (e) {
    //   res.status(404).json({ error: "No comment for the given id" });
    console.log(e)
    }
  })
  /*
* This route would be used to create a comment on users profile
* @userId: id of the user where comment is to be Created
* @id: the id of the user creating the comment
* @comment: comment created by the user
*/
.post(async (req, res) => {

    const commentInfo = req.body
    if (!commentInfo) {
        return res.status(400).json("Comment text is empty");
    }
    if (
        !commentInfo.comment ||
        typeof commentInfo.comment != "string" ||
        commentInfo.comment.trim().length == 0
      ) {
        // errors.push("Comment text is invalid");
        return res.status(400).json("Comment Text Invalid")
      }


     try{
        // commentInfo.userId = validId(req.session.user);
        var id= commentInfo.id
        checkValidId(req.body.id);
        var userId = req.params.userId
        checkValidId(req.params.userId);
        const userData = await get(id.toString());
        var userName = userData.username
        
      } catch (e) {
        return res.status(404).json({ error: "No user for the given id" });
        
      }
      try {
        const user = await createComment(
          userId,
          id,
          userName,
          commentInfo.comment.trim()
        );
        var allcomm = user["comments"];

        let lastelm = allcomm.slice(-1);
        //return lastelm[0];

        return res.json({
         "userData": lastelm[0]
        })
        
      } catch (e) {
        return res
          .status(500)
          .render("error", { errors: e});
        
      }
    // } else {
    //   res.redirect("/login");
    // }
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
      let comment = req.body
      let commentId = comment.commentId
      try {
        checkValidId(req.params.userId);
        checkValidId(commentId);
      } catch (e) {
        return res.status(400).json({error: e});
      }
      try {
        let userData = await get(req.params.userId);
       // res.json(band);
      } catch (e) {
        return res.status(404).json({error: 'User not found'});
      }
      try {
        let deletedband = await removeComment(req.params.userId, commentId);
        
        res.json(deletedband);
      } catch (e) {
        let status = e[0] ? e[0] : 500;
        let message = e[1] ? e[1] : 'Internal Server Error';
        res.status(status).send({error: message});
      }

  });

  export default router