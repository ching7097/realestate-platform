document.addEventListener("DOMContentLoaded", () => {
  const autoDismissAlerts = document.querySelectorAll("[data-auto-dismiss='true']");
  const provinceSelect = document.querySelector("#province-select");
  const districtSelect = document.querySelector("#district-select");
  const regionStatus = document.querySelector("#region-status");
  const regionActionLinks = document.querySelectorAll("[data-region-action]");
  const homepagePostFeed = document.querySelector("#homepage-post-feed");
  const homepagePostRegionLabel = document.querySelector("#homepage-post-region-label");
  let regions = [];
  let districtsByRegionId = new Map();
  let regionSource = "api";

  autoDismissAlerts.forEach((alert) => {
    window.setTimeout(() => {
      alert.style.opacity = "0";
      alert.style.transform = "translateY(-6px)";
      alert.style.transition = "all 0.3s ease";

      window.setTimeout(() => {
        alert.remove();
      }, 300);
    }, 3500);
  });

  if (provinceSelect && districtSelect) {
    const params = new URLSearchParams(window.location.search);
    const initialProvince = params.get("province");
    const initialDistrict = params.get("district");

    const formatDate = (value) => {
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

    const escapeHtml = (value) =>
      String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

    const officialProvinceLabel = (province) => {
      if (regionSource === "static" && window.regionOfficialName) {
        return window.regionOfficialName[province] || province;
      }
      return province;
    };

    const renderHomepagePosts = () => {
      if (!homepagePostFeed || !Array.isArray(window.homePosts)) {
        return;
      }

      const province = provinceSelect.value;
      const district = districtSelect.value;
      const hasExactDistrict = district && district !== "전체";
      const official = officialProvinceLabel(province);
      let filterPrefix = hasExactDistrict ? `${official} ${district}`.trim() : official;
      if (regionSource === "static" && province === "세종") {
        filterPrefix = "세종특별자치시";
      }
      const labelRegion = hasExactDistrict
        ? `${province} ${district}`.trim()
        : province === "전체"
          ? "전체 지역"
          : `${province} 전체`;
      const filteredPosts =
        province === "전체"
          ? window.homePosts.slice(0, 5)
          : window.homePosts
              .filter((post) => String(post.region || "").startsWith(filterPrefix))
              .slice(0, 5);

      if (homepagePostRegionLabel) {
        homepagePostRegionLabel.textContent =
          province === "전체"
            ? `전체 지역 기준 최신 글 ${filteredPosts.length}개를 확인할 수 있습니다.`
            : `${labelRegion} 기준 최신 글 ${filteredPosts.length}개를 확인할 수 있습니다.`;
      }

      if (filteredPosts.length === 0) {
        homepagePostFeed.innerHTML = `
          <article class="post-item">
            <h3>선택한 지역 게시글이 아직 없습니다.</h3>
            <p>다른 지역을 선택하거나 자유게시판에서 첫 글을 작성해 보세요.</p>
            <div class="section-heading-actions" style="margin-top: 12px; justify-content: flex-start;">
              <a class="button button-secondary" href="/community">자유게시판</a>
              <a class="button button-primary" href="/community/write">글쓰기</a>
            </div>
          </article>
        `;
        return;
      }

      homepagePostFeed.innerHTML = filteredPosts
        .map(
          (post) => `
            <article class="post-item post-item-compact">
              <div class="post-meta">
                <span class="tag">${escapeHtml(post.region || "전국")}</span>
                <span>${escapeHtml(post.category || "")}</span>
                <span>${escapeHtml(formatDate(post.created_at))}</span>
              </div>
              <h3>
                <a href="/community/${post.id}">${escapeHtml(post.title)}</a>
              </h3>
              <p>${escapeHtml(post.excerpt || "")}</p>
              <a class="button button-secondary" href="/community/${post.id}">
                지금 읽기
              </a>
            </article>
          `
        )
        .join("");
    };

    const updateDistrictOptions = async () => {
      const province = provinceSelect.value;

      if (province === "전체") {
        districtSelect.innerHTML = `<option value="전체" selected>시/군/구 전체</option>`;
        updateRegionLinks();
        return;
      }

      if (regionSource === "static" && window.regionData) {
        const names = window.regionData[province] || [];
        districtSelect.innerHTML =
          `<option value="전체" selected>시/군/구 전체</option>` +
          names
            .map(
              (districtName) =>
                `<option value="${escapeHtml(districtName)}">${escapeHtml(districtName)}</option>`
            )
            .join("");

        if (
          initialProvince === province &&
          initialDistrict &&
          names.includes(initialDistrict)
        ) {
          districtSelect.value = initialDistrict;
        }

        updateRegionLinks();
        return;
      }

      const selectedRegion = regions.find((region) => region.name === province);

      if (!selectedRegion) {
        districtSelect.innerHTML = `<option value="전체" selected>시/군/구 전체</option>`;
        updateRegionLinks();
        return;
      }

      if (!districtsByRegionId.has(selectedRegion.id)) {
        const response = await fetch(`/api/districts?region_id=${selectedRegion.id}`);
        const districts = await response.json();
        districtsByRegionId.set(selectedRegion.id, districts);
      }

      const districts = districtsByRegionId.get(selectedRegion.id) || [];
      districtSelect.innerHTML =
        `<option value="전체" selected>시/군/구 전체</option>` +
        districts
          .map(
            (district) =>
              `<option value="${escapeHtml(district.name)}">${escapeHtml(district.name)}</option>`
          )
          .join("");

      if (
        initialProvince === province &&
        initialDistrict &&
        districts.some((district) => district.name === initialDistrict)
      ) {
        districtSelect.value = initialDistrict;
      }

      updateRegionLinks();
    };

    const updateRegionLinks = () => {
      const province = provinceSelect.value;
      const district = districtSelect.value;
      const selectedRegion =
        province === "전체"
          ? "전체 지역"
          : district && district !== "전체"
            ? `${province} ${district}`.trim()
            : `${province} 전체`;
      const statusSafe = escapeHtml(selectedRegion);

      if (regionStatus) {
        regionStatus.innerHTML = `<strong>${statusSafe}</strong> 기준으로 최근 정보와 커뮤니티 글을 확인할 수 있습니다.`;
      }

      regionActionLinks.forEach((link) => {
        const url = new URL(link.href, window.location.origin);
        url.searchParams.set("province", province);
        url.searchParams.set("district", district);
        link.href = url.pathname + url.search + url.hash;
      });

      renderHomepagePosts();
    };

    const hasClientRegionData = () => {
      const data = window.regionData;
      const official = window.regionOfficialName;
      return (
        data &&
        official &&
        typeof data === "object" &&
        Object.keys(data).length > 0
      );
    };

    const shortProvinceFromInitial = () => {
      if (!initialProvince || !window.regionOfficialName) {
        return initialProvince;
      }
      if (window.regionData && initialProvince in window.regionData) {
        return initialProvince;
      }
      const entry = Object.entries(window.regionOfficialName).find(
        ([, full]) => full === initialProvince
      );
      return entry ? entry[0] : initialProvince;
    };

    const loadRegions = async () => {
      districtsByRegionId = new Map();

      if (hasClientRegionData()) {
        regionSource = "static";
        regions = Object.keys(window.regionData).map((name) => ({ name }));

        provinceSelect.innerHTML =
          `<option value="전체" selected>전체</option>` +
          regions
            .map(
              (region) =>
                `<option value="${escapeHtml(region.name)}">${escapeHtml(region.name)}</option>`
            )
            .join("");

        const initProvince = shortProvinceFromInitial();
        if (initProvince && regions.some((region) => region.name === initProvince)) {
          provinceSelect.value = initProvince;
        }

        await updateDistrictOptions();
        return;
      }

      regionSource = "api";

      try {
        const response = await fetch("/api/regions");
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            regions = data;

            provinceSelect.innerHTML =
              `<option value="전체" selected>전체</option>` +
              regions
                .map(
                  (region) =>
                    `<option value="${escapeHtml(region.name)}">${escapeHtml(region.name)}</option>`
                )
                .join("");

            if (initialProvince && regions.some((region) => region.name === initialProvince)) {
              provinceSelect.value = initialProvince;
            }

            await updateDistrictOptions();
            return;
          }
        }
      } catch (_) {
        /* API unavailable */
      }

      provinceSelect.innerHTML = `<option value="전체" selected>전체</option>`;
      await updateDistrictOptions();
    };

    provinceSelect.addEventListener("change", () => {
      updateDistrictOptions();
    });
    districtSelect.addEventListener("change", updateRegionLinks);

    loadRegions();
  }

  document.querySelectorAll("[data-post-row-href]").forEach((row) => {
    const go = () => {
      const href = row.getAttribute("data-post-row-href");
      if (href) {
        window.location.assign(href);
      }
    };

    row.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) {
        return;
      }
      go();
    });

    row.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") {
        return;
      }
      if (e.target.closest("a, button") && e.target !== row) {
        return;
      }
      e.preventDefault();
      go();
    });
  });
});
