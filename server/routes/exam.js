const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.render("layouts/main", {
    pageTitle: "공인중개사 시험 정보 | 과목, 일정, 공부 전략",
    metaDescription:
      "공인중개사 시험 과목, 학습 전략, 합격 루틴, 자주 묻는 질문을 정리한 SEO형 정보 페이지입니다.",
    metaKeywords:
      "공인중개사 시험, 공인중개사 과목, 공인중개사 공부법, 부동산 자격증",
    canonicalUrl: `${res.app.locals.baseUrl}/exam`,
    includeCalculatorsScript: false,
    bodyView: "../pages/exam",
    pageMode: "default",
    examCategories: [
      {
        title: "민법 및 민사특별법",
        description: "기본 개념과 판례 중심으로 반복 학습해야 하는 핵심 과목입니다."
      },
      {
        title: "공인중개사법 및 실무",
        description: "실무 지문 비중이 높아 출제 포인트를 정리해 두면 효율이 좋습니다."
      },
      {
        title: "부동산공법",
        description: "용어가 많아 암기 카드와 기출 반복이 특히 중요한 영역입니다."
      },
      {
        title: "부동산공시법 및 세법",
        description: "등기와 세율 체계를 함께 정리하면 점수 확보에 유리합니다."
      }
    ],
    studyPlan: [
      "1개월 차: 민법과 중개사법 기본 이론 정리",
      "2개월 차: 공법 개념 정리와 기출문제 시작",
      "3개월 차: 세법과 공시법 암기 카드 정리",
      "시험 전 4주: 전과목 기출 회독과 약점 보완"
    ],
    faqItems: [
      {
        question: "직장인도 공인중개사 시험 준비가 가능한가요?",
        answer:
          "매일 2시간 이상 확보가 가능하다면 충분히 준비할 수 있습니다. 주말에는 기출문제 회독 시간을 길게 확보하는 것이 좋습니다."
      },
      {
        question: "합격선에 도달하려면 무엇을 우선해야 하나요?",
        answer:
          "기본서 완독보다 기출문제 반복이 더 중요합니다. 자주 나오는 판례와 숫자, 세율, 절차를 우선 암기하세요."
      },
      {
        question: "공법이 가장 어려운데 어떻게 접근해야 하나요?",
        answer:
          "큰 틀을 먼저 외우고 세부 규정을 나중에 붙이는 방식이 좋습니다. 표와 요약 노트를 적극 활용해 보세요."
      }
    ]
  });
});

module.exports = router;
