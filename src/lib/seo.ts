import { getSiteUrl, siteConfig } from "@/lib/site";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function createBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function createCollectionJsonLd(
  name: string,
  description: string,
  pathname: string,
  itemUrls: string[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: getSiteUrl(pathname),
    mainEntity: itemUrls.map((url) => ({
      "@type": "Thing",
      url
    }))
  };
}

export function createArticleJsonLd(
  headline: string,
  description: string,
  pathname: string,
  publishedTime: string,
  modifiedTime: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    datePublished: publishedTime,
    dateModified: modifiedTime,
    url: getSiteUrl(pathname),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.defaultUrl
    }
  };
}

export function createWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.defaultUrl
  };
}
