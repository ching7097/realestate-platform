USE realestate_platform;

ALTER TABLE posts
  ADD COLUMN board VARCHAR(40) NOT NULL DEFAULT '자유게시판' AFTER district,
  ADD INDEX idx_posts_board (board),
  ADD INDEX idx_posts_views_created (views_count, created_at);
