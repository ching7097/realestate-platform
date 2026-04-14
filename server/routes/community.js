const express = require("express");
const postController = require("../controllers/postController");

const router = express.Router();

router.get("/", postController.renderCommunityPage);
router.get("/write", postController.renderWritePage);
router.post("/write", postController.createPostFromWritePage);
router.post("/posts", postController.createPost);
router.get("/:id", postController.renderPostDetail);
router.get("/posts/:id", postController.renderPostDetail);
router.post("/:id/comments", postController.createComment);
router.post("/posts/:id/comments", postController.createComment);

module.exports = router;
