const express = require("express");

const router = express.Router();

function computeRiskLevel(deposit, loan, housePrice) {
  const d = Number(deposit) || 0;
  const l = Number(loan) || 0;
  const h = Number(housePrice) || 0;

  if (h <= 0) {
    return { level: "invalid", label: "입력 오류", detail: "집값(매매가)을 0보다 크게 입력해 주세요." };
  }

  const ltv = l / h;
  const depositRatio = d / h;

  if (ltv > 0.75 || depositRatio < 0.05) {
    return {
      level: "high",
      label: "높음",
      detail:
        "대출 비중(LTV)이 높거나 보증금 비율이 낮아 보증금 회수·금융 리스크가 커질 수 있습니다. 등기·선순위·보증보험을 반드시 확인하세요."
    };
  }

  if (ltv > 0.55 || depositRatio < 0.12) {
    return {
      level: "medium",
      label: "보통",
      detail:
        "조건마다 여유가 다소 부족합니다. 대출 상환 계획과 전세사기 징후(깡통전세 등)를 추가로 점검하는 것이 좋습니다."
    };
  }

  return {
    level: "low",
    label: "낮음",
    detail:
      "상대적으로 보증금 여력과 담보 여유가 있는 편입니다. 그래도 등기부·확정일자·실거래가는 꼭 확인하세요."
  };
}

router.get("/", (req, res) => {
  res.render("layouts/main", {
    pageTitle: "전세·매매 위험도 체크 | Real Estate Hub",
    metaDescription:
      "보증금, 대출, 집값을 입력하면 단순 위험도(낮음/보통/높음)를 빠르게 확인할 수 있습니다.",
    metaKeywords: "전세 위험도, LTV, 보증금, 전세사기 예방",
    canonicalUrl: `${res.app.locals.baseUrl}/check`,
    includeCalculatorsScript: false,
    bodyView: "../pages/check",
    checkResult: null,
    form: { deposit: "", loan: "", housePrice: "" }
  });
});

router.post("/", (req, res) => {
  const deposit = req.body.deposit;
  const loan = req.body.loan;
  const housePrice = req.body.housePrice;
  const checkResult = computeRiskLevel(deposit, loan, housePrice);

  res.render("layouts/main", {
    pageTitle: "전세·매매 위험도 체크 | Real Estate Hub",
    metaDescription:
      "보증금, 대출, 집값을 입력하면 단순 위험도(낮음/보통/높음)를 빠르게 확인할 수 있습니다.",
    metaKeywords: "전세 위험도, LTV, 보증금, 전세사기 예방",
    canonicalUrl: `${res.app.locals.baseUrl}/check`,
    includeCalculatorsScript: false,
    bodyView: "../pages/check",
    checkResult,
    form: { deposit, loan, housePrice }
  });
});

module.exports = router;
