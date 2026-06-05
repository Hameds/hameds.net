import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const site = String(context.site).replace(/\/$/, "");

  return rss({
    title: "وبلاگِ حامد",
    description: "یادداشت‌ها، ایده‌ها و روایت زیستن",
    site,
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: "/" + post.id,
    })),
  });
}
