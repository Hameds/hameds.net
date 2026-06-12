import { getCollection } from "astro:content";

function normalizePersian(text: string): string {
  return text
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ة/g, "ه")
    .replace(/[إأآٱ]/g, "ا")
    .replace(/\u0640/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET() {
  const posts = await getCollection("posts", ({ data }) => {
    return data.draft !== true;
  });

  const searchIndex = posts
    .map((post) => ({
      id: post.id,
      title: normalizePersian(post.data.title),
      description: normalizePersian(post.data.description || ""),
      tags: (post.data.tags || []).map(normalizePersian),
      date: post.data.date.toISOString(),
      url: "/" + post.id,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return new Response(JSON.stringify(searchIndex), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
