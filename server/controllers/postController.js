const postModel = require("../models/postModel");
const regionModel = require("../models/regionModel");

function getCommunityPageData(overrides = {}) {
  return {
    pageTitle: "부동산 커뮤니티 | 실거주와 투자 정보를 나누는 공간",
    metaDescription:
      "매매, 전세, 정책 정보를 공유하는 부동산 커뮤니티입니다. 질문과 후기, 지역 정보를 간단하게 남겨 보세요.",
    metaKeywords:
      "부동산 커뮤니티, 부동산 매매, 전세 정보, 부동산 정책, 지역 정보",
    canonicalUrl: "/community",
    includeCalculatorsScript: false,
    bodyView: "../pages/community",
    communityHighlights: [
      "매매 타이밍과 금리 흐름",
      "전세 계약 체크리스트",
      "최신 정책 요약",
      "실거주 지역 분석"
    ],
    message: "",
    error: "",
    formData: {
      authorName: "",
      title: "",
      category: "매매",
      region: "전국",
      content: ""
    },
    selectedRegionLabel: "전체 지역",
    communityRegions: [],
    ...overrides
  };
}

function getWritePageData(overrides = {}) {
  return {
    pageTitle: "글쓰기 | 부동산 커뮤니티",
    metaDescription:
      "부동산 커뮤니티에 매매, 전세, 지역 관련 글을 직접 작성해 보세요.",
    metaKeywords: "부동산 글쓰기, 부동산 커뮤니티, 전세 글쓰기, 매매 글쓰기",
    canonicalUrl: "/community/write",
    includeCalculatorsScript: false,
    bodyView: "../pages/community-write",
    error: "",
    formData: {
      title: "",
      region: "전국",
      content: ""
    },
    communityRegions: [],
    ...overrides
  };
}

async function renderCommunityPage(req, res, next) {
  try {
    const filters = {
      province: req.query.province || "",
      district: req.query.district || ""
    };
    const selectedRegionLabel =
      filters.province &&
      filters.province !== "전체" &&
      filters.district &&
      filters.district !== "전체"
        ? `${filters.province} ${filters.district}`
        : filters.province && filters.province !== "전체"
          ? filters.province
          : "전체 지역";
    const posts = await postModel.getAllPosts(filters);

    res.render(
      "layouts/main",
      getCommunityPageData({
        posts,
        canonicalUrl: `${res.locals.currentPath.startsWith("http") ? "" : res.app.locals.baseUrl}/community`,
        message: req.query.message || "",
        error: req.query.error || "",
        selectedRegionLabel
      })
    );
  } catch (error) {
    next(error);
  }
}

async function renderPostDetail(req, res, next) {
  try {
    const post = await postModel.getPostById(req.params.id);

    if (!post) {
      return res.redirect("/community?error=게시글을 찾을 수 없습니다.");
    }

    return res.render("layouts/main", {
      pageTitle: `${post.title} | 부동산 커뮤니티`,
      metaDescription: post.excerpt,
      metaKeywords: `부동산 커뮤니티, ${post.category}, ${post.title}`,
      canonicalUrl: `${res.app.locals.baseUrl}/community/${post.id}`,
      includeCalculatorsScript: false,
      bodyView: "../pages/post-detail",
      post,
      message: req.query.message || "",
      error: req.query.error || ""
    });
  } catch (error) {
    return next(error);
  }
}

async function renderWritePage(req, res, next) {
  try {
    const regionRows = await regionModel.getAllRegionLabels();

    res.render(
      "layouts/main",
      getWritePageData({
        communityRegions: ["전국", ...regionRows.map((row) => row.label)]
      })
    );
  } catch (error) {
    next(error);
  }
}

async function createPost(req, res) {
  const formData = {
    authorName: "익명",
    title: req.body.title || "",
    category: req.body.category || "매매",
    region: req.body.region || "전국",
    content: req.body.content || ""
  };

  try {
    await postModel.createPost(formData);
    return res.redirect("/community?message=게시글이 등록되었습니다.");
  } catch (error) {
    const regionRows = await regionModel.getAllRegionLabels().catch(() => []);

    return res.status(400).render(
      "layouts/main",
      getWritePageData({
        error: error.message,
        formData: {
          title: formData.title,
          region: formData.region,
          content: formData.content
        },
        communityRegions: ["전국", ...regionRows.map((row) => row.label)]
      })
    );
  }
}

async function createPostFromWritePage(req, res) {
  const formData = {
    title: req.body.title || "",
    region: req.body.region || "전국",
    content: req.body.content || ""
  };

  try {
    await postModel.createPost({
      authorName: "익명",
      title: formData.title,
      content: formData.content,
      category: "매매",
      region: formData.region
    });

    return res.redirect("/community?message=게시글이 등록되었습니다.");
  } catch (error) {
    const regionRows = await regionModel.getAllRegionLabels().catch(() => []);

    return res.status(400).render(
      "layouts/main",
      getWritePageData({
        error: error.message,
        formData,
        communityRegions: ["전국", ...regionRows.map((row) => row.label)]
      })
    );
  }
}

async function createComment(req, res) {
  try {
    await postModel.createComment(req.params.id, {
      authorName: req.body.authorName,
      content: req.body.content
    });

    return res.redirect(
      `/community/${req.params.id}?message=댓글이 등록되었습니다.#comments`
    );
  } catch (error) {
    return res.redirect(
      `/community/${req.params.id}?error=${encodeURIComponent(error.message)}#comments`
    );
  }
}

module.exports = {
  renderCommunityPage,
  renderPostDetail,
  renderWritePage,
  createPost,
  createPostFromWritePage,
  createComment
};
