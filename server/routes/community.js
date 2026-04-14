const express = require("express");
const postController = require("../controllers/postController");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    await postController.renderCommunityPage(req, res, next);
  } catch (err) {
    console.error("ROUTE ERROR:", err);
    next(err);
  }
});
router.get("/write", postController.renderWritePage);
router.post("/write", postController.createPost);
router.get("/:id", postController.renderPostDetail);

module.exports = router;
