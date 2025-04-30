const express = require("express");
const {
  createpost,
  getAllposts,
  getpost,
  updatepost,
  deletepost,
  uploadPostFiles,
  processPostUploads,
  addCommentToPost,
  updateComment,
  deleteComment,
} = require("../services/postService");

const authroute = require("../services/authService");

const router = express.Router();

// Routes
router.route("/").get(getAllposts).post(
  authroute.protect,
  authroute.allowedTo("teacher", "institution"),
  uploadPostFiles, // <-- Handle image + file upload
  processPostUploads, // <-- Resize image + save file
  createpost // <-- Save post in DB
);
// Missing individual class routes
router
  .route("/:id")
  .get(getpost) // GET /classes/:id
  .put(
    authroute.protect,
    authroute.allowedTo("teacher", "institution"),
    uploadPostFiles, // <-- Handle image + file upload
    processPostUploads, // <-- Resize image + save file

    updatepost
  ) // PUT /classes/:id
  .delete(
    authroute.protect,
    authroute.allowedTo("teacher", "institution"),
    deletepost
  ); // DELETE /classes/:id

router.route("/:postId/comment").post(authroute.protect, addCommentToPost);
router
  .route("/:postId/comment/:commentId")
  .put(
    authroute.protect,
    authroute.allowedTo("student", "teacher", "institution"),
    updateComment
  )
// Delete a comment
  .delete(
    authroute.protect,
    authroute.allowedTo("student", "teacher", "institution"),
    deleteComment
  );
module.exports = router;
