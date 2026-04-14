const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.render("layouts/main", {
    pageTitle: "부동산 가이드 | 전세 사기 예방·보증금 보호 | Real Estate Hub",
    metaDescription:
      "전세 사기를 피하는 방법, 보증금 보호 절차, 계약 전 체크리스트를 검색 유입에 맞춰 정리했습니다.",
    metaKeywords: "전세 사기, 보증금, 전세보증보험, 등기부등본, 부동산 가이드",
    canonicalUrl: `${res.app.locals.baseUrl}/guide`,
    includeCalculatorsScript: false,
    bodyView: "../pages/guide"
  });
});

module.exports = router;
