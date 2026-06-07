(function () {
  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";
  var input = document.querySelector("#search-page-input");
  var resultsDiv = document.querySelector("#search-results");

  if (input) {
    input.value = query;
  }

  var emptyMsg = '<p class="search-empty">برای جستجو در نوشته‌ها تایپ کن</p>';

  async function doSearch(q) {
    if (!q.trim()) {
      resultsDiv.innerHTML = emptyMsg;
      return;
    }

    resultsDiv.innerHTML = '<p class="search-empty">جستجو…</p>';

    try {
      var pagefind = await import("/pagefind/pagefind.js");
      var search = await pagefind.search(q);

      if (!search.results || search.results.length === 0) {
        resultsDiv.innerHTML = '<p class="search-empty">نتیجه‌ای پیدا نشد</p>';
        return;
      }

      var html = "";
      for (var i = 0; i < Math.min(search.results.length, 30); i++) {
        var data = await search.results[i].data();
        var title = data.meta && data.meta.title ? data.meta.title : "بدون عنوان";
        var url = data.url;
        var excerpt = data.excerpt ? data.excerpt.replace(/\[.*?\]/g, "").trim() : "";

        html += '<div class="search-result">';
        html += '<a href="' + url + '"><h3>' + title + "</h3></a>";
        if (excerpt) {
          html += '<p class="search-result-snippet">' + excerpt + "</p>";
        }
        html += "</div>";
      }
      resultsDiv.innerHTML = html;
    } catch (e) {
      resultsDiv.innerHTML =
        '<p class="search-empty">خطا در جستجو. دوباره تلاش کن.</p>';
    }
  }

  var form = document.querySelector("#search-page-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });
  }

  if (input) {
    input.addEventListener("input", function () {
      var q = input.value.trim();
      var url = q ? "/search?q=" + encodeURIComponent(q) : "/search";
      history.replaceState(null, "", url);
      doSearch(q);
    });
  }

  if (query) {
    doSearch(query);
  } else {
    resultsDiv.innerHTML = emptyMsg;
  }
})();
