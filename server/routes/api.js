const express = require("express");
const regionModel = require("../models/regionModel");

const router = express.Router();

router.get("/regions", async (req, res, next) => {
  try {
    const regions = await regionModel.getRegions();
    res.json(regions);
  } catch (error) {
    next(error);
  }
});

router.get("/districts", async (req, res, next) => {
  try {
    const regionId = Number(req.query.region_id);

    if (!regionId) {
      return res.status(400).json({ message: "region_id is required" });
    }

    const districts = await regionModel.getDistricts(regionId);
    return res.json(districts);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
