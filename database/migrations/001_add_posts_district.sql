-- Run once on existing DBs created before district column existed.
USE realestate_platform;

ALTER TABLE posts
  ADD COLUMN district VARCHAR(60) NOT NULL DEFAULT '' AFTER region;
