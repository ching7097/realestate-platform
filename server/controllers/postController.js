const postModel = require("../models/postModel");
const regionModel = require("../models/regionModel");

const NEW_POST_MS = 24 * 60 * 60 * 1000;
const HOT_VIEW_THRESHOLD = 1000;

function withCommunityPostBadges(posts) {
  const now = Date.now();
  return (posts || [])
    .filter((p) => p && typeof p === "object")
    .map((p) => {
      const createdMs = new Date(p.created_at).getTime();
      return {
        ...p,
        isNew: !Number.isNaN(createdMs) && createdMs > now - NEW_POST_MS,
        isHot: Number(p.views) > HOT_VIEW_THRESHOLD
      };
    });
}

function getWritePageData(overrides = {}) {
  return {
    pageTitle: "글쓰기 | 부동산 커뮤니티",
    metaDescription:
      "부동산 커뮤니티에 매매, 전세, 지역 관련 글을 직접 작성해 보세요.",
    metaKeywords: "부동산 글쓰기, 부동산 커뮤니티, 전세 글쓰기, 매매 글쓰기",
    canonicalUrl: overrides.canonicalUrl || "/community/write",
    includeCalculatorsScript: false,
    bodyView: "../pages/community-write",
    error: "",
    formData: {
      title: "",
      region: "전국",
      district: "",
      board: postModel.COMMUNITY_BOARDS?.[0]?.label || "자유게시판",
      content: ""
    },
    communityBoards: postModel.COMMUNITY_BOARDS,
    communityRegions: [],
    ...overrides
  };
}

async function renderCommunityPage(req, res, next) {
  try {
    const boards = Array.isArray(postModel.COMMUNITY_BOARDS) ? postModel.COMMUNITY_BOARDS : [];
    const rawDefaultBoard = boards[0] && typeof boards[0] === "object" ? boards[0] : {};
    const defaultBoard = {
      slug: String(rawDefaultBoard.slug || "free").trim() || "free",
      label: String(rawDefaultBoard.label || "자유게시판").trim() || "자유게시판"
    };

    let resolved;
    try {
      resolved = postModel.resolveBoardFromQuery(req.query.board);
    } catch {
      resolved = null;
    }
    const active =
      resolved && typeof resolved === "object"
        ? {
            slug:
              resolved?.slug != null && String(resolved.slug).trim()
                ? String(resolved.slug).trim()
                : defaultBoard.slug,
            label:
              resolved?.label != null && String(resolved.label).trim()
                ? String(resolved.label).trim()
                : defaultBoard.label
          }
        : { slug: defaultBoard.slug, label: defaultBoard.label };

    const boardLabel = active?.label || "free";
    const resolveFn = postModel?.resolveBoardFromQuery;
    const resolvedBoard =
      typeof resolveFn === "function" ? resolveFn.call(postModel, boardLabel) : null;
    const normalizeFn = postModel?.normalizeBoardLabel;
    const normalizedFromBoard =
      typeof normalizeFn === "function" ? normalizeFn.call(postModel, boardLabel) : boardLabel;
    const displayBoardSlug =
      (active?.slug && String(active?.slug || "").trim()) ||
      (resolvedBoard && String(resolvedBoard?.slug || "").trim()) ||
      defaultBoard?.slug ||
      "free";
    const displayBoardLabel =
      (active?.label && String(active?.label || "").trim()) ||
      (resolvedBoard && String(resolvedBoard?.label || "").trim()) ||
      normalizedFromBoard ||
      defaultBoard?.label ||
      "자유게시판";

    const [posts, popularWeek, recentGlobal, topViewedAll] = await Promise.all([
      postModel.getPostsByBoard(boardLabel),
      postModel.getPopularPostsLastDays(7, 10),
      postModel.getRecentPostsGlobal(10),
      postModel.getMostViewedPosts(8)
    ]);

    const safePosts = Array.isArray(posts) ? posts : [];
    const safePopular = Array.isArray(popularWeek) ? popularWeek : [];
    const safeRecent = Array.isArray(recentGlobal) ? recentGlobal : [];
    const safeTopViewed = Array.isArray(topViewedAll) ? topViewedAll : [];

    const baseUrl =
      res.app && res.app.locals && res.app.locals.baseUrl
        ? res.app.locals.baseUrl
        : "http://localhost:3000";

    let postsForView;
    try {
      postsForView = withCommunityPostBadges(safePosts);
    } catch {
      postsForView = [];
    }

    const safeDisplaySlug = String(displayBoardSlug || "free").trim() || "free";
    const safeDisplayLabel = String(displayBoardLabel || "자유게시판").trim() || "자유게시판";
    const navPath =
      typeof req.originalUrl === "string" ? req.originalUrl.split("?")[0] : "/community";

    const communityLocals = {
      posts: postsForView || [],
      displayBoardSlug: safeDisplaySlug || "free",
      displayBoardLabel: safeDisplayLabel || "자유게시판"
    };

    const locals = {
      pageTitle: `${safeDisplayLabel} | 커뮤니티 | Real Estate Hub`,
      metaDescription: `${safeDisplayLabel}에서 부동산 글을 확인하고 정보를 나눠 보세요.`,
      metaKeywords: `${safeDisplayLabel}, 부동산 커뮤니티, 전세, 매매`,
      canonicalUrl: `${baseUrl}/community?board=${encodeURIComponent(safeDisplaySlug)}`,
      baseUrl,
      includeCalculatorsScript: false,
      bodyView: "pages/community",
      currentPath: navPath || "/community",
      communityBoards: boards.length ? boards : [defaultBoard],
      ...communityLocals,
      activeBoardSlug: communityLocals.displayBoardSlug,
      activeBoardLabel: communityLocals.displayBoardLabel,
      popularWeek: safePopular,
      recentGlobal: safeRecent,
      topViewedAll: safeTopViewed,
      message: req.query.message || "",
      error: req.query.error || ""
    };

    for (const key of Object.keys(locals)) {
      if (locals[key] === undefined) {
        if (
          key === "posts" ||
          key === "popularWeek" ||
          key === "recentGlobal" ||
          key === "topViewedAll" ||
          key === "communityBoards"
        ) {
          locals[key] = [];
        } else {
          locals[key] = "";
        }
      }
    }

    console.log("[community] EJS locals (pre-render):", {
      pageTitle: locals.pageTitle,
      bodyView: locals.bodyView,
      displayBoardSlug: locals.displayBoardSlug,
      displayBoardLabel: locals.displayBoardLabel,
      postsCount: Array.isArray(locals.posts) ? locals.posts.length : -1,
      popularWeekCount: Array.isArray(locals.popularWeek) ? locals.popularWeek.length : -1,
      recentGlobalCount: Array.isArray(locals.recentGlobal) ? locals.recentGlobal.length : -1,
      topViewedAllCount: Array.isArray(locals.topViewedAll) ? locals.topViewedAll.length : -1,
      communityBoardsCount: Array.isArray(locals.communityBoards) ? locals.communityBoards.length : -1,
      undefinedKeys: Object.keys(locals).filter((k) => locals[k] === undefined)
    });

    await new Promise((resolve, reject) => {
      res.render("layouts/main", locals, (err, html) => {
        if (err) {
          return reject(err);
        }
        if (!res.headersSent) {
          res.send(html);
        }
        resolve();
      });
    });
  } catch (error) {
    if (typeof next === "function") {
      next(error);
    }
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
    const regionRows = await regionModel.getAllRegionLabels().catch(() => []);

    res.render(
      "layouts/main",
      getWritePageData({
        canonicalUrl: `${res.app.locals.baseUrl}/community/write`,
        communityBoards: postModel.COMMUNITY_BOARDS,
        communityRegions: ["전국", ...regionRows.map((row) => row.label)]
      })
    );
  } catch (error) {
    next(error);
  }
}

async function createPost(req, res) {
  const boardLabel = postModel.normalizeBoardLabel(req.body.board);
  const resolveNav = postModel?.resolveBoardFromQuery;
  const boardNav =
    typeof resolveNav === "function" ? resolveNav.call(postModel, boardLabel) : null;

  const formData = {
    authorName: "익명",
    title: req.body.title || "",
    category: req.body.category || "매매",
    region: req.body.region || "전국",
    district: req.body.district || "",
    board: boardLabel,
    content: req.body.content || ""
  };

  try {
    await postModel.createPost(formData);
    return res.redirect(
      `/community?board=${encodeURIComponent(boardNav?.slug || "free")}&message=${encodeURIComponent("게시글이 등록되었습니다.")}`
    );
  } catch (error) {
    const regionRows = await regionModel.getAllRegionLabels().catch(() => []);

    return res.status(400).render(
      "layouts/main",
      getWritePageData({
        canonicalUrl: `${res.app.locals.baseUrl}/community/write`,
        error: error.message,
        formData: {
          title: formData.title,
          region: formData.region,
          district: formData.district,
          board: formData.board,
          content: formData.content
        },
        communityBoards: postModel.COMMUNITY_BOARDS,
        communityRegions: ["전국", ...regionRows.map((row) => row.label)]
      })
    );
  }
}

module.exports = {
  renderCommunityPage,
  renderPostDetail,
  renderWritePage,
  createPost
};
