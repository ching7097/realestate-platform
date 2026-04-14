const db = require("../../config/db");
const userModel = require("./userModel");

const COMMUNITY_BOARDS = [
  { slug: "free", label: "자유게시판" },
  { slug: "jeonse", label: "전세/월세 질문" },
  { slug: "sale", label: "매매 고민" },
  { slug: "region", label: "지역 정보" },
  { slug: "review", label: "후기" }
];

const BOARD_LABELS_CYCLE = COMMUNITY_BOARDS.map((b) => b.label);

function defaultBoardPair() {
  const first = COMMUNITY_BOARDS[0];
  return {
    slug: String(first?.slug || "free").trim() || "free",
    label: String(first?.label || "자유게시판").trim() || "자유게시판"
  };
}

function resolveBoardFromQuery(queryVal) {
  const v = String(queryVal ?? "").trim();
  const fallback = defaultBoardPair();
  if (!COMMUNITY_BOARDS.length) {
    return fallback;
  }
  if (!v) {
    return fallback;
  }
  const lower = v.toLowerCase();
  const bySlug = COMMUNITY_BOARDS.find((b) => b.slug === lower);
  if (bySlug) {
    return {
      slug: String(bySlug?.slug || fallback.slug).trim() || fallback.slug,
      label: String(bySlug?.label || fallback.label).trim() || fallback.label
    };
  }
  const byLabel = COMMUNITY_BOARDS.find((b) => b.label === v);
  if (byLabel) {
    return {
      slug: String(byLabel?.slug || fallback.slug).trim() || fallback.slug,
      label: String(byLabel?.label || fallback.label).trim() || fallback.label
    };
  }
  return fallback;
}

function normalizeBoardLabel(value) {
  const v = String(value ?? "").trim();
  const fallback = defaultBoardPair().label;
  if (!COMMUNITY_BOARDS.length) {
    return fallback;
  }
  const byLabel = COMMUNITY_BOARDS.find((b) => b.label === v);
  if (byLabel) {
    return String(byLabel?.label || fallback).trim() || fallback;
  }
  const lower = v.toLowerCase();
  const bySlug = COMMUNITY_BOARDS.find((b) => b.slug === lower);
  if (bySlug) {
    return String(bySlug?.label || fallback).trim() || fallback;
  }
  return fallback;
}

function fallbackBoardForPost(post) {
  if (post.board) {
    return post.board;
  }
  return BOARD_LABELS_CYCLE[(Number(post.id) - 1) % BOARD_LABELS_CYCLE.length];
}

let fallbackUserId = 3;
let fallbackPostId = 12;
let fallbackCommentId = 4;

const fallbackUsers = [
  { id: 1, username: "관리자" },
  { id: 2, username: "투자연구소" },
  { id: 3, username: "집토끼" }
];

const fallbackPosts = [
  {
    id: 1,
    user_id: 1,
    title: "서울 강남구 전세 계약 직전, 등기부에서 꼭 봐야 할 3가지",
    slug: "seoul-gangnam-jeonse-title-check",
    excerpt: "서울 강남구 전세 계약 전이라면 시세보다 먼저 권리관계와 선순위 채권을 확인해야 합니다.",
    content:
      "서울 강남구 전세 계약에서는 집주인 명의, 근저당 설정 여부, 확정일자 순서를 먼저 보는 것이 중요합니다.\n\n특히 보증금이 큰 매물일수록 보증보험 가입 가능 여부까지 함께 확인해야 안전합니다.",
    category: "전세",
    region: "서울특별시 강남구",
    views_count: 214,
    created_at: "2026-04-14T08:20:00.000Z"
  },
  {
    id: 2,
    user_id: 2,
    title: "서울 송파구 매매 고민이라면 복비와 취득세부터 계산하세요",
    slug: "seoul-songpa-buy-cost-guide",
    excerpt: "서울 송파구 매매는 집값 외에도 복비, 취득세, 대출 비용이 실제 예산을 크게 좌우합니다.",
    content:
      "서울 송파구 매매를 준비할 때는 매물 가격만 보면 판단이 흔들릴 수 있습니다.\n\n복비와 취득세, 대출 이자를 함께 계산해 봐야 실제 거주 가능한 예산이 보입니다.",
    category: "매매",
    region: "서울특별시 송파구",
    views_count: 189,
    created_at: "2026-04-14T07:10:00.000Z"
  },
  {
    id: 3,
    user_id: 3,
    title: "서울 마포구 전세가 내려갈 때 실수요자가 먼저 확인할 것",
    slug: "seoul-mapo-jeonse-buyer-check",
    excerpt: "서울 마포구 전세가가 조정될 때는 가격보다 보증금 보호 구조를 먼저 체크해야 합니다.",
    content:
      "서울 마포구는 전세 수요가 꾸준한 편이지만 가격이 내려간 시기일수록 계약 구조를 더 꼼꼼히 봐야 합니다.\n\n시세와 권리관계, 주변 공실률까지 함께 확인하면 판단이 훨씬 쉬워집니다.",
    category: "전세",
    region: "서울특별시 마포구",
    views_count: 143,
    created_at: "2026-04-13T18:40:00.000Z"
  },
  {
    id: 4,
    user_id: 1,
    title: "경기 성남시 신혼부부가 매매 전에 가장 먼저 보는 숫자",
    slug: "gyeonggi-seongnam-newlywed-buy-number",
    excerpt: "경기 성남시 실거주 매매에서는 월 상환액과 초기 비용이 집값보다 더 중요할 수 있습니다.",
    content:
      "경기 성남시에서 신혼부부가 실거주 매매를 준비한다면 대출 가능액보다 월 상환액을 먼저 확인해야 합니다.\n\n특히 관리비와 생활비까지 포함한 총 주거비를 계산해야 무리 없는 선택이 가능합니다.",
    category: "매매",
    region: "경기도 성남시",
    views_count: 172,
    created_at: "2026-04-13T12:30:00.000Z"
  },
  {
    id: 5,
    user_id: 2,
    title: "경기 수원시 전세 대출 금리 비교할 때 놓치기 쉬운 비용",
    slug: "gyeonggi-suwon-jeonse-loan-hidden-cost",
    excerpt: "경기 수원시 전세 대출은 보증료와 우대금리 유지 조건까지 같이 비교해야 체감 비용이 보입니다.",
    content:
      "경기 수원시 전세 수요자는 명목 금리만 보고 선택하기 쉽지만 실제 부담은 보증료와 부대비용에서 차이가 납니다.\n\n중도상환수수료와 우대 조건 유지 여부도 함께 확인해야 합니다.",
    category: "전세",
    region: "경기도 수원시",
    views_count: 158,
    created_at: "2026-04-12T16:00:00.000Z"
  },
  {
    id: 6,
    user_id: 3,
    title: "경기 용인시 매매 타이밍, 입주 물량 하나만 봐도 달라집니다",
    slug: "gyeonggi-yongin-buy-timing-supply",
    excerpt: "경기 용인시 매매 타이밍은 입주 물량과 전세가 흐름을 같이 보면 판단이 쉬워집니다.",
    content:
      "경기 용인시 매매에서는 금리뿐 아니라 인근 입주 물량과 전세가율을 함께 보는 것이 중요합니다.\n\n실거주 목적이라면 3년 이상 거주 계획이 있는지도 같이 확인해야 합니다.",
    category: "매매",
    region: "경기도 용인시",
    views_count: 133,
    created_at: "2026-04-12T09:15:00.000Z"
  },
  {
    id: 7,
    user_id: 1,
    title: "부산 해운대구 전세, 시세보다 먼저 봐야 할 보증금 안전선",
    slug: "busan-haeundae-jeonse-safety-line",
    excerpt: "부산 해운대구 전세 계약에서는 시세 차이보다 보증금 회수 가능성을 먼저 따져야 합니다.",
    content:
      "부산 해운대구 전세 매물은 지역 선호도가 높아 보여도 권리관계가 복잡할 수 있습니다.\n\n실거래가와 보증보험 가입 가능 여부를 함께 보면 안전한 계약 판단에 도움이 됩니다.",
    category: "전세",
    region: "부산광역시 해운대구",
    views_count: 147,
    created_at: "2026-04-11T18:05:00.000Z"
  },
  {
    id: 8,
    user_id: 2,
    title: "부산 수영구 실거주 매매, 지금 사도 되는지 계산부터 해봤습니다",
    slug: "busan-suyeong-buy-calculation-first",
    excerpt: "부산 수영구 실거주 매매는 월 상환액과 보유 기간을 함께 계산해야 결론이 보입니다.",
    content:
      "부산 수영구는 인기 지역이라 매수 결정을 서두르기 쉽지만, 실제로는 보유 기간과 대출 부담을 함께 계산해야 합니다.\n\n매매가 오르더라도 월 현금흐름이 버티지 못하면 좋은 선택이 아닐 수 있습니다.",
    category: "매매",
    region: "부산광역시 수영구",
    views_count: 126,
    created_at: "2026-04-11T10:40:00.000Z"
  },
  {
    id: 9,
    user_id: 3,
    title: "부산 부산진구 청년 전월세 지원, 이번 달에 꼭 체크할 조건",
    slug: "busan-busanjin-youth-policy-check",
    excerpt: "부산 부산진구 청년이라면 전월세 지원의 소득 기준과 신청 시기를 먼저 확인해야 합니다.",
    content:
      "부산 부산진구 청년 정책은 보증금 지원과 월세 지원이 나뉘어 있어 본인 상황에 맞는 제도를 먼저 골라야 합니다.\n\n신청 시기와 제출 서류를 놓치면 혜택을 받기 어려울 수 있습니다.",
    category: "정책",
    region: "부산광역시 부산진구",
    views_count: 118,
    created_at: "2026-04-10T19:30:00.000Z"
  },
  {
    id: 10,
    user_id: 1,
    title: "전국 수도권 전세 사기 예방 정책, 달라진 핵심만 정리했습니다",
    slug: "nationwide-capital-policy-key-summary",
    excerpt: "전국 수도권 전세 사기 예방 정책은 계약 전 확인 항목과 보증금 보호 장치 강화가 핵심입니다.",
    content:
      "전국 수도권 정책은 등기 정보 확인과 보증보험 활용을 더 강조하는 방향으로 바뀌고 있습니다.\n\n실수요자라면 계약 전에 챙겨야 할 서류 목록을 미리 정리해 두는 것이 좋습니다.",
    category: "정책",
    region: "전국 수도권",
    views_count: 166,
    created_at: "2026-04-10T11:10:00.000Z"
  },
  {
    id: 11,
    user_id: 2,
    title: "전국 역세권 전세가 비싸도 찾는 이유, 결국 이것 때문입니다",
    slug: "nationwide-station-jeonse-demand-reason",
    excerpt: "전국 역세권 전세 수요는 통근 편의성과 공실 위험이 낮다는 점 때문에 꾸준합니다.",
    content:
      "전국 역세권 전세는 가격이 높아도 이동 편의성과 수요 안정성 때문에 선호도가 유지됩니다.\n\n다만 빠르게 오른 지역은 보증금 회수 가능성까지 반드시 따져봐야 합니다.",
    category: "전세",
    region: "전국 역세권",
    views_count: 139,
    created_at: "2026-04-09T14:25:00.000Z"
  },
  {
    id: 12,
    user_id: 3,
    title: "전국 실거주자들이 많이 보는 매매 지원 정책 5분 요약",
    slug: "nationwide-buy-support-policy-quick-summary",
    excerpt: "전국 매매 지원 정책은 신혼부부와 생애최초 구입자에게 유리한 조건이 많아 먼저 보는 것이 좋습니다.",
    content:
      "전국 매매 지원 정책은 대출 우대와 세금 혜택이 함께 붙는 경우가 많습니다.\n\n내 집 마련을 준비하는 실거주자라면 현재 가능한 우대 조건부터 먼저 체크하는 것이 효율적입니다.",
    category: "정책",
    region: "전국 수도권",
    views_count: 122,
    created_at: "2026-04-08T08:45:00.000Z"
  }
];

const fallbackComments = [
  {
    id: 1,
    post_id: 1,
    user_id: 2,
    content: "전세가율까지 같이 봐야 한다는 점이 특히 도움됐습니다.",
    created_at: "2026-04-14T09:10:00.000Z"
  },
  {
    id: 2,
    post_id: 1,
    user_id: 3,
    content: "실거주 계획을 먼저 정리하라는 포인트가 현실적이네요.",
    created_at: "2026-04-14T10:25:00.000Z"
  },
  {
    id: 3,
    post_id: 2,
    user_id: 1,
    content: "보증료까지 합산하는 계산기를 함께 쓰면 더 좋을 것 같습니다.",
    created_at: "2026-04-13T11:00:00.000Z"
  }
];

function createSlug(title) {
  const slugBase = String(title || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u3131-\u318E\uAC00-\uD7A3-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slugBase || `post-${Date.now()}`;
}

function createExcerpt(content) {
  return String(content || "").replace(/\s+/g, " ").trim().slice(0, 120);
}

function getFallbackUserById(userId) {
  return fallbackUsers.find((user) => user.id === userId) || fallbackUsers[0];
}

function getOrCreateFallbackUser(username) {
  const cleanName = String(username || "").trim();
  const existingUser = fallbackUsers.find((user) => user.username === cleanName);

  if (existingUser) {
    return existingUser;
  }

  fallbackUserId += 1;

  const newUser = {
    id: fallbackUserId,
    username: cleanName
  };

  fallbackUsers.push(newUser);
  return newUser;
}

function getFallbackPostSummary(post) {
  const author = getFallbackUserById(post.user_id);
  const commentCount = fallbackComments.filter(
    (comment) => comment.post_id === post.id
  ).length;

  return {
    ...post,
    author_name: author.username,
    comment_count: commentCount,
    district: post.district || "",
    board: fallbackBoardForPost(post),
    views: post.views_count ?? post.views ?? 0
  };
}

function buildRegionFilter(filters = {}) {
  const province = String(filters.province || "").trim();
  const district = String(filters.district || "").trim();
  const hasExactDistrict = district && district !== "전체";

  if (!province || province === "전체") {
    return null;
  }

  if (hasExactDistrict) {
    return {
      value: `${province} ${district}%`
    };
  }

  return {
    value: `${province}%`
  };
}

function matchesRegion(postRegion, filters = {}) {
  const province = String(filters.province || "").trim();
  const district = String(filters.district || "").trim();
  const hasExactDistrict = district && district !== "전체";

  if (!province || province === "전체") {
    return true;
  }

  if (hasExactDistrict) {
    return postRegion.startsWith(`${province} ${district}`.trim());
  }

  return postRegion.startsWith(province);
}

async function getAllPosts(filters = {}) {
  const regionFilter = buildRegionFilter(filters);

  try {
    const queryText = regionFilter
      ? `SELECT
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.category,
        p.region,
        p.district,
        p.board,
        p.views_count AS views,
        p.created_at,
        u.username AS author_name,
        COUNT(c.id) AS comment_count
      FROM posts p
      INNER JOIN users u ON u.id = p.user_id
      LEFT JOIN comments c ON c.post_id = p.id
      WHERE p.region LIKE ?
      GROUP BY p.id, p.title, p.slug, p.excerpt, p.category, p.region, p.district, p.board, p.views_count, p.created_at, u.username
      ORDER BY p.created_at DESC`
      : `SELECT
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.category,
        p.region,
        p.district,
        p.board,
        p.views_count AS views,
        p.created_at,
        u.username AS author_name,
        COUNT(c.id) AS comment_count
      FROM posts p
      INNER JOIN users u ON u.id = p.user_id
      LEFT JOIN comments c ON c.post_id = p.id
      GROUP BY p.id, p.title, p.slug, p.excerpt, p.category, p.region, p.district, p.board, p.views_count, p.created_at, u.username
      ORDER BY p.created_at DESC`;

    return await db.query(queryText, regionFilter ? [regionFilter.value] : []);
  } catch (error) {
    return [...fallbackPosts]
      .filter((post) => matchesRegion(post.region, filters))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(getFallbackPostSummary);
  }
}

async function getPostsByBoard(boardLabel, filters = {}, options = {}) {
  const label = normalizeBoardLabel(boardLabel);
  const regionFilter = buildRegionFilter(filters);
  const propagateDbError = Boolean(options.propagateDbError);

  try {
    const queryText = regionFilter
      ? `SELECT
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.category,
        p.region,
        p.district,
        p.board,
        p.views_count AS views,
        p.created_at,
        u.username AS author_name,
        COUNT(c.id) AS comment_count
      FROM posts p
      INNER JOIN users u ON u.id = p.user_id
      LEFT JOIN comments c ON c.post_id = p.id
      WHERE p.board = ? AND p.region LIKE ?
      GROUP BY p.id, p.title, p.slug, p.excerpt, p.category, p.region, p.district, p.board, p.views_count, p.created_at, u.username
      ORDER BY p.created_at DESC`
      : `SELECT
        p.id,
        p.title,
        p.slug,
        p.excerpt,
        p.category,
        p.region,
        p.district,
        p.board,
        p.views_count AS views,
        p.created_at,
        u.username AS author_name,
        COUNT(c.id) AS comment_count
      FROM posts p
      INNER JOIN users u ON u.id = p.user_id
      LEFT JOIN comments c ON c.post_id = p.id
      WHERE p.board = ?
      GROUP BY p.id, p.title, p.slug, p.excerpt, p.category, p.region, p.district, p.board, p.views_count, p.created_at, u.username
      ORDER BY p.created_at DESC`;

    return await db.query(
      queryText,
      regionFilter ? [label, regionFilter.value] : [label]
    );
  } catch (error) {
    console.error("[postModel.getPostsByBoard] DB error:", error);
    if (propagateDbError) {
      throw error;
    }
    return [...fallbackPosts]
      .filter(
        (post) =>
          fallbackBoardForPost(post) === label && matchesRegion(post.region, filters)
      )
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .map(getFallbackPostSummary);
  }
}

function mapFallbackSidebarRow(post) {
  return {
    id: post.id,
    title: post.title,
    views: post.views_count ?? 0,
    created_at: post.created_at,
    board: fallbackBoardForPost(post)
  };
}

async function getPopularPostsLastDays(days = 7, limit = 10, options = {}) {
  const safeDays = Math.min(Math.max(Number(days) || 7, 1), 90);
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const propagateDbError = Boolean(options.propagateDbError);

  try {
    return await db.query(
      `SELECT
        p.id,
        p.title,
        p.board,
        p.views_count AS views,
        p.created_at
      FROM posts p
      INNER JOIN users u ON u.id = p.user_id
      WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL ${safeDays} DAY)
      ORDER BY p.views_count DESC, p.created_at DESC
      LIMIT ?`,
      [safeLimit]
    );
  } catch (error) {
    console.error("[postModel.getPopularPostsLastDays] DB error:", error);
    if (propagateDbError) {
      throw error;
    }
    const cutoff = Date.now() - safeDays * 86400000;
    return [...fallbackPosts]
      .filter((post) => new Date(post.created_at).getTime() >= cutoff)
      .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
      .slice(0, safeLimit)
      .map(mapFallbackSidebarRow);
  }
}

async function getRecentPostsGlobal(limit = 10, options = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const propagateDbError = Boolean(options.propagateDbError);

  try {
    return await db.query(
      `SELECT
        p.id,
        p.title,
        p.board,
        p.views_count AS views,
        p.created_at
      FROM posts p
      INNER JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC
      LIMIT ?`,
      [safeLimit]
    );
  } catch (error) {
    console.error("[postModel.getRecentPostsGlobal] DB error:", error);
    if (propagateDbError) {
      throw error;
    }
    return [...fallbackPosts]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, safeLimit)
      .map(mapFallbackSidebarRow);
  }
}

async function getMostViewedPosts(limit = 10) {
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

  try {
    return await db.query(
      `SELECT
        p.id,
        p.title,
        p.board,
        p.views_count AS views,
        p.created_at
      FROM posts p
      INNER JOIN users u ON u.id = p.user_id
      ORDER BY p.views_count DESC, p.created_at DESC
      LIMIT ?`,
      [safeLimit]
    );
  } catch (error) {
    return [...fallbackPosts]
      .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
      .slice(0, safeLimit)
      .map(mapFallbackSidebarRow);
  }
}

async function incrementPostViews(postId) {
  const numericId = Number(postId);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    return;
  }
  await db.query("UPDATE posts SET views_count = views_count + 1 WHERE id = ?", [numericId]);
}

async function getPostById(postId) {
  const numericId = Number(postId);

  try {
    await incrementPostViews(numericId);

    const posts = await db.query(
      `SELECT
        p.id,
        p.title,
        p.slug,
        p.content,
        p.excerpt,
        p.category,
        p.region,
        p.district,
        p.board,
        p.views_count AS views,
        p.views_count,
        p.created_at,
        u.username AS author_name
      FROM posts p
      INNER JOIN users u ON u.id = p.user_id
      WHERE p.id = ?
      LIMIT 1`,
      [numericId]
    );

    if (posts.length === 0) {
      return null;
    }

    const comments = await db.query(
      `SELECT
        c.id,
        c.post_id,
        c.content,
        c.created_at,
        u.username AS author_name
      FROM comments c
      INNER JOIN users u ON u.id = c.user_id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC`,
      [numericId]
    );

    return {
      ...posts[0],
      comments
    };
  } catch (error) {
    const post = fallbackPosts.find((item) => item.id === numericId);

    if (!post) {
      return null;
    }

    post.views_count += 1;

    const author = getFallbackUserById(post.user_id);
    const comments = fallbackComments
      .filter((comment) => comment.post_id === numericId)
      .map((comment) => ({
        ...comment,
        author_name: getFallbackUserById(comment.user_id).username
      }));

    return {
      ...post,
      views: post.views_count,
      board: fallbackBoardForPost(post),
      author_name: author.username,
      comments
    };
  }
}

async function createPost({
  title,
  content,
  authorName,
  category,
  region,
  district = "",
  board
}) {
  const cleanTitle = String(title || "").trim();
  const cleanContent = String(content || "").trim();
  const cleanAuthorName = String(authorName || "").trim();
  const cleanCategory = String(category || "매매").trim();
  const cleanRegion = String(region || "전국").trim();
  const cleanDistrict = String(district || "").trim();
  const cleanBoard = normalizeBoardLabel(board);
  const slug = createSlug(cleanTitle);
  const excerpt = createExcerpt(cleanContent);

  if (!cleanTitle || !cleanContent || !cleanAuthorName) {
    throw new Error("제목, 닉네임, 내용을 모두 입력해 주세요.");
  }

  try {
    const author = await userModel.findOrCreateByUsername(cleanAuthorName);
    const result = await db.query(
      `INSERT INTO posts (user_id, title, slug, excerpt, content, category, region, district, board, views_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        author.id,
        cleanTitle,
        slug,
        excerpt,
        cleanContent,
        cleanCategory,
        cleanRegion,
        cleanDistrict,
        cleanBoard
      ]
    );

    return {
      id: result.insertId,
      title: cleanTitle,
      slug,
      excerpt,
      content: cleanContent,
      category: cleanCategory,
      region: cleanRegion,
      district: cleanDistrict,
      board: cleanBoard,
      author_name: author.username
    };
  } catch (error) {
    const author = getOrCreateFallbackUser(cleanAuthorName);

    fallbackPostId += 1;

    const newPost = {
      id: fallbackPostId,
      user_id: author.id,
      title: cleanTitle,
      slug,
      excerpt,
      content: cleanContent,
      category: cleanCategory,
      region: cleanRegion,
      district: cleanDistrict,
      board: cleanBoard,
      views_count: 0,
      created_at: new Date().toISOString()
    };

    fallbackPosts.unshift(newPost);
    return {
      ...newPost,
      author_name: author.username
    };
  }
}

async function createComment(postId, { content, authorName }) {
  const numericId = Number(postId);
  const cleanContent = String(content || "").trim();
  const cleanAuthorName = String(authorName || "").trim();

  if (!cleanContent || !cleanAuthorName) {
    throw new Error("댓글 작성자와 내용을 모두 입력해 주세요.");
  }

  try {
    const author = await userModel.findOrCreateByUsername(cleanAuthorName);
    const result = await db.query(
      "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)",
      [numericId, author.id, cleanContent]
    );

    return {
      id: result.insertId,
      post_id: numericId,
      author_name: author.username,
      content: cleanContent,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    const post = fallbackPosts.find((item) => item.id === numericId);

    if (!post) {
      throw new Error("게시글을 찾을 수 없습니다.");
    }

    const author = getOrCreateFallbackUser(cleanAuthorName);

    fallbackCommentId += 1;

    const newComment = {
      id: fallbackCommentId,
      post_id: numericId,
      user_id: author.id,
      content: cleanContent,
      created_at: new Date().toISOString()
    };

    fallbackComments.push(newComment);

    return {
      ...newComment,
      author_name: author.username
    };
  }
}

module.exports = {
  COMMUNITY_BOARDS,
  resolveBoardFromQuery,
  normalizeBoardLabel,
  getAllPosts,
  getPostsByBoard,
  getPopularPostsLastDays,
  getRecentPostsGlobal,
  getMostViewedPosts,
  incrementPostViews,
  getPostById,
  createPost,
  createComment
};
