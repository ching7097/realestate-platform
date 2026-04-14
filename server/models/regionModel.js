const db = require("../../config/db");

async function getRegions() {
  return db.query("SELECT id, name FROM regions ORDER BY id ASC");
}

async function getDistricts(regionId) {
  return db.query(
    "SELECT id, region_id, name FROM districts WHERE region_id = ? ORDER BY id ASC",
    [Number(regionId)]
  );
}

async function getAllRegionLabels() {
  return db.query(
    `SELECT
      CASE
        WHEN d.name = r.name THEN r.name
        ELSE CONCAT(r.name, ' ', d.name)
      END AS label
    FROM districts d
    INNER JOIN regions r ON r.id = d.region_id
    ORDER BY r.id ASC, d.id ASC`
  );
}

module.exports = {
  getRegions,
  getDistricts,
  getAllRegionLabels
};
