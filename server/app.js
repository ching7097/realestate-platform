const express = require("express");
const path = require("path");

const apiRoutes = require("./routes/api");
const indexRoutes = require("./routes/index");
const communityRoutes = require("./routes/community");
const calcRoutes = require("./routes/calc");
const examRoutes = require("./routes/exam");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.locals.siteName = "Real Estate Hub";
app.locals.baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
app.locals.formatNumber = (value) =>
  new Intl.NumberFormat("ko-KR").format(Number(value) || 0);
app.locals.formatDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.use((req, res, next) => {
  res.locals.currentPath = req.originalUrl;
  res.locals.currentYear = new Date().getFullYear();
  next();
});

app.use("/api", apiRoutes);
app.use("/", indexRoutes);

const publicDir = path.join(__dirname, "..", "public");
app.get("/community", (req, res) => {
  res.sendFile(path.join(publicDir, "community.html"));
});
app.get("/community/:id(\\d+)", (req, res) => {
  res.sendFile(path.join(publicDir, "post.html"));
});

app.use("/community", communityRoutes);
app.use("/calc", calcRoutes);
app.use("/exam", examRoutes);

app.use((req, res) => {
  res.status(404).render("layouts/main", {
    pageTitle: "페이지를 찾을 수 없습니다 | Real Estate Hub",
    metaDescription:
      "요청하신 페이지를 찾을 수 없습니다. 부동산 계산기, 커뮤니티, 시험 정보를 다시 확인해 주세요.",
    metaKeywords: "부동산 사이트, 부동산 계산기, 부동산 커뮤니티",
    canonicalUrl: `${app.locals.baseUrl}${req.originalUrl}`,
    includeCalculatorsScript: false,
    bodyView: "../pages/exam",
    pageMode: "not-found",
    examCategories: [],
    studyPlan: [],
    faqItems: []
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).render("layouts/main", {
    pageTitle: "서버 오류 | Real Estate Hub",
    metaDescription: "일시적인 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    metaKeywords: "부동산 플랫폼, 서버 오류",
    canonicalUrl: `${app.locals.baseUrl}${req.originalUrl}`,
    includeCalculatorsScript: false,
    bodyView: "../pages/index",
    allPosts: [],
    latestPosts: [],
    policyCards: [],
    pageMode: "error"
  });
});

app.listen(PORT, () => {
  console.log(`Real Estate Hub server is running on port ${PORT}`);
});
