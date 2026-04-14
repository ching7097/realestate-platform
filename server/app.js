const express = require("express");
const path = require("path");

const apiRoutes = require("./routes/api");
const indexRoutes = require("./routes/index");
const guideRoutes = require("./routes/guide");
const checkRoutes = require("./routes/check");
const communityRoutes = require("./routes/community");
const calcRoutes = require("./routes/calc");
const examRoutes = require("./routes/exam");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.locals.siteName = "Real Estate Hub";
app.locals.baseUrl = process.env.BASE_URL || "http://localhost:3000";
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
app.use("/guide", guideRoutes);
app.use("/check", checkRoutes);
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

function errorMessageFromUnknown(err) {
  if (err == null) {
    return "Server Error";
  }
  if (typeof err === "string") {
    return err;
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  if (typeof err === "object" && typeof err.message === "string" && err.message) {
    return err.message;
  }
  try {
    return String(err);
  } catch {
    return "Server Error";
  }
}

app.use((err, req, res, next) => {
  const stack = err instanceof Error ? err.stack : "";
  console.error("GLOBAL ERROR:", err);
  if (stack) {
    console.error(stack);
  }

  if (res.headersSent) {
    return;
  }

  const msg = errorMessageFromUnknown(err);
  const isDev = req.app.get("env") === "development";
  res.status(500).type("text/plain; charset=utf-8").send(isDev && stack ? `${msg}\n\n${stack}` : msg);
});

app
  .listen(3000, "0.0.0.0", () => {
    console.log("Real Estate Hub server is running at http://localhost:3000");
  })
  .on("error", (listenErr) => {
    if (listenErr && listenErr.code === "EADDRINUSE") {
      console.error("Port 3000 is already in use. Stop the other Node process using that port, then restart.");
    }
    console.error(listenErr);
  });

module.exports = app;
