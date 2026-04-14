const express = require("express");
const postModel = require("../models/postModel");

const router = express.Router();

const policyCards = [
  {
    title: "전세 사기 예방 대책 강화, 계약 전 확인 항목 다시 늘어났다",
    description:
      "전세 계약 전에 확인해야 할 권리관계와 보증금 보호 절차가 더 중요해졌습니다.",
    summary: "등기부, 선순위 채권, 보증보험 가능 여부까지 한 번에 체크할 수 있는 핵심 포인트입니다.",
    buttonText: "핵심 체크 보기",
    buttonLink: "/guide#jeonse-scam"
  },
  {
    title: "청년 전월세 지원 확대, 보증금 대출과 월세 지원 함께 비교해야",
    description:
      "청년층이 자주 찾는 전월세 지원 제도는 신청 시기와 소득 기준을 같이 봐야 합니다.",
    summary: "보증금 지원, 월세 지원, 우대금리 조건을 한 번에 확인할 수 있도록 정리했습니다.",
    buttonText: "지원 내용 보기",
    buttonLink: "/exam"
  },
  {
    title: "주택담보대출 금리 다시 변동, 실수요자는 월 상환액부터 점검해야",
    description:
      "금리가 조금만 움직여도 체감 상환액은 크게 달라질 수 있어 미리 계산이 필요합니다.",
    summary: "대출 부담을 숫자로 확인하고 예산 범위를 빠르게 가늠할 수 있는 카드입니다.",
    buttonText: "상환액 계산",
    buttonLink: "/calc"
  },
  {
    title: "서울·경기·부산 전세가 흐름 비교, 지역별 체감 분위기 달라졌다",
    description:
      "같은 시기라도 지역별 전세가 흐름은 다르게 움직여 계약 타이밍 판단이 달라집니다.",
    summary: "실거주자가 많이 보는 서울, 경기, 부산 지역 흐름을 중심으로 요약했습니다.",
    buttonText: "지역 흐름 보기",
    buttonLink: "/community"
  },
  {
    title: "신혼부부 매매 지원 조건 정리, 지금 확인하면 놓치지 않는 혜택들",
    description:
      "실거주 매매를 준비하는 신혼부부라면 특별공급과 대출 우대 조건을 함께 봐야 합니다.",
    summary: "생애최초, 신혼부부, 실거주자에게 유리한 지원 포인트를 5분 안에 확인할 수 있습니다.",
    buttonText: "혜택 요약 보기",
    buttonLink: "/exam"
  }
];

router.get("/", async (req, res, next) => {
  try {
    const allPosts = await postModel.getAllPosts();
    const selectedPosts = await postModel.getAllPosts({
      province: req.query.province || "",
      district: req.query.district || ""
    });
    const latestPosts = selectedPosts.slice(0, 5);

    res.render("layouts/main", {
      pageTitle: "전세 사기 체크, 복비 계산, 지역 정보 | Real Estate Hub",
      metaDescription:
        "전세 사기 체크, 복비 계산기, 지역 정보, 최신 부동산 정책과 커뮤니티 글을 한 번에 확인하세요.",
      metaKeywords:
        "전세 사기, 복비 계산기, 지역 정보, 부동산 정책, 부동산 커뮤니티",
      canonicalUrl: `${res.app.locals.baseUrl}/`,
      includeCalculatorsScript: false,
      bodyView: "../pages/index",
      allPosts,
      latestPosts,
      policyCards,
      pageMode: "default"
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
