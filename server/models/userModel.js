const db = require("../../config/db");

async function findOrCreateByUsername(username) {
  const cleanName = String(username || "").trim();

  if (!cleanName) {
    throw new Error("닉네임이 필요합니다.");
  }

  const existingUsers = await db.query(
    "SELECT id, username FROM users WHERE username = ? LIMIT 1",
    [cleanName]
  );

  if (existingUsers.length > 0) {
    return existingUsers[0];
  }

  const result = await db.query(
    "INSERT INTO users (username, email, password) VALUES (?, NULL, NULL)",
    [cleanName]
  );

  return {
    id: result.insertId,
    username: cleanName
  };
}

module.exports = {
  findOrCreateByUsername
};
