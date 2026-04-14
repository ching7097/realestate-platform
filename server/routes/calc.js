const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.render("layouts/main", {
    pageTitle: "부동산 계산기 | 수수료, 대출 이자, 월세 vs 매매 비교",
    metaDescription:
      "부동산 중개보수, 대출 이자, 월세와 매매 비교 계산기를 통해 실거주와 투자 의사결정을 빠르게 도와드립니다.",
    metaKeywords:
      "부동산 계산기, 중개보수 계산기, 대출 이자 계산기, 월세 매매 비교",
    canonicalUrl: `${res.app.locals.baseUrl}/calc`,
    includeCalculatorsScript: true,
    bodyView: "../pages/calc"
  });
});

module.exports = router;
