import Fuse from "fuse.js";
import { toPersianDate, toPersianDigits } from "../utils/date";

const params = new URLSearchParams(window.location.search);
const query = params.get("q") || "";
const input = document.querySelector<HTMLInputElement>("#search-page-input");
const resultsDiv = document.querySelector("#search-results");
const countDiv = document.querySelector("#search-results-count");

if (input) {
  input.value = query;
}

const emptyMsg = '<p class="search-empty">برای جستجو در نوشته‌ها تایپ کن</p>';

let fuseInstance: Fuse<any> | null = null;
let searchIndex: any[] | null = null;

async function loadIndex() {
  if (searchIndex) return searchIndex;
  try {
    const resp = await fetch("/search-index.json");
    searchIndex = await resp.json();
    return searchIndex;
  } catch (e) {
    console.error("Failed to load search index:", e);
    return [];
  }
}

function createFuse(data: any[]) {
  return new Fuse(data, {
    keys: [
      { name: "title", weight: 0.6 },
      { name: "description", weight: 0.3 },
      { name: "tags", weight: 0.1 },
    ],
    threshold: 0.3,
    ignoreLocation: true,
    distance: 1000,
    minMatchCharLength: 2,
    includeScore: true,
    shouldSort: true,
    useTokenSearch: true,
    tokenMatch: "any",
  });
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function highlight(text: string, q: string): string {
  if (!q.trim()) return escapeHtml(text);
  const escaped = escapeHtml(text);
  const terms = q
    .trim()
    .split(/\s+/)
    .filter((t) => t.length >= 2)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (terms.length === 0) return escaped;
  const regex = new RegExp("(" + terms.join("|") + ")", "gi");
  return escaped.replace(regex, "<mark>$1</mark>");
}

async function doSearch(q: string) {
  if (!resultsDiv) return;
  if (!q.trim()) {
    if (countDiv) countDiv.textContent = "";
    resultsDiv.innerHTML = emptyMsg;
    return;
  }

  resultsDiv.innerHTML = '<p class="search-empty">در حال جستجو. لطفا کمی صبر کنید<span class="loading-dots"><span>.</span><span>.</span><span>.</span></span></p>';

  try {
    const data = await loadIndex();
    if (!fuseInstance && data) {
      fuseInstance = createFuse(data);
    }

    const results = fuseInstance!.search(q);

    if (results.length === 0) {
      if (countDiv) countDiv.textContent = "";
      resultsDiv.innerHTML = '<p class="search-empty">نتیجه‌ای پیدا نشد</p>';
      return;
    }

    if (countDiv) {
      countDiv.textContent = toPersianDigits(results.length) + " نتیجه";
    }

    let html = "";
    for (let i = 0; i < results.length; i++) {
      const item = results[i].item;
      html += '<div class="search-result">';
      html +=
        '<a href="' +
        item.url +
        '">' +
        '<h3 class="search-result-title">' +
        highlight(item.title, q) +
        "</h3>";
      if (item.description) {
        html +=
          '<p class="search-result-snippet">' +
          highlight(item.description, q) +
          "</p>";
      }
      html +=
        '<span class="search-result-date">' +
        toPersianDate(new Date(item.date)) +
        "</span>";
      html += "</a>";
      html += "</div>";
    }
    resultsDiv.innerHTML = html;
  } catch (e) {
    console.error("Search error:", e);
    resultsDiv.innerHTML =
      '<p class="search-empty">خطا در جستجو. دوباره تلاش کن.</p>';
  }
}

const form = document.querySelector("#search-page-form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
  });
}

if (input) {
  input.addEventListener("input", () => {
    const q = input.value.trim();
    const url = q ? "/search?q=" + encodeURIComponent(q) : "/search";
    history.replaceState(null, "", url);
    doSearch(q);
  });
}

if (query) {
  doSearch(query);
} else if (resultsDiv) {
  resultsDiv.innerHTML = emptyMsg;
}
