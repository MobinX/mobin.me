import { server } from "config";
import type { Article } from "contentlayer/generated";

export default function ArticleSchema({
  article,
}: {
  article: Article;
}): JSX.Element {
  const coverUrl = article.covers?.[0]?.url;
  const image = coverUrl
    ? `${server}/images/${coverUrl}`
    : `${server}/images/og-image.png`;
  const url = `${server}/articles/${article.slug}`;
  const description = article.seoDescription || article.description;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: article.title,
        description,
        image: [image],
        datePublished: article.publishedAt,
        dateModified: article.publishedAt,
        author: {
          "@type": "Person",
          name: article.author?.name,
          url: server,
        },
        publisher: {
          "@type": "Organization",
          name: "Md. Mobin Chowdhury",
          logo: {
            "@type": "ImageObject",
            url: `${server}/images/profile.png`,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
        url,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: server,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Articles",
            item: `${server}/articles`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: article.title,
            item: url,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
