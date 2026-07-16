/** JSON-LD helpers for compare pages (Article + Product + FAQPage). */

type Aff = {
  link_key: string;
  amazon_asin: string | null;
  uk_price_gbp: number | null;
  image_url: string | null;
} | undefined;

function productNode(name: string, rating: number | null, link: Aff) {
  return {
    '@type': 'Product',
    name,
    ...(link?.image_url ? { image: link.image_url } : {}),
    ...(link?.uk_price_gbp && link?.amazon_asin
      ? {
          offers: {
            '@type': 'Offer',
            price: link.uk_price_gbp,
            priceCurrency: 'GBP',
            availability: 'https://schema.org/InStock',
            url: `https://gearversustech.com/c/amazon/${link.link_key}`,
          },
        }
      : {}),
    ...(rating
      ? {
          review: {
            '@type': 'Review',
            reviewRating: { '@type': 'Rating', ratingValue: rating, bestRating: 10, worstRating: 1 },
            author: { '@type': 'Organization', name: 'Gear Versus Tech' },
          },
        }
      : {}),
  };
}

export function buildCompareSchema(opts: {
  title: string;
  description: string;
  pageUrl: string;
  createdAt: string;
  updatedAt: string;
  winnerName: string | null;
  winnerRating: number | null;
  runnerupName: string | null;
  runnerupRating: number | null;
  winner?: Aff;
  runnerup?: Aff;
}): string {
  const {
    title,
    description,
    pageUrl,
    createdAt,
    updatedAt,
    winnerName,
    winnerRating,
    runnerupName,
    runnerupRating,
    winner,
    runnerup,
  } = opts;

  const faqEntities = [
    winnerName && runnerupName
      ? {
          '@type': 'Question',
          name: `Which is better: ${winnerName} or ${runnerupName}?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `${winnerName} is our pick${winnerRating ? ` (${winnerRating}/10)` : ''}. ${description}`,
          },
        }
      : null,
    winnerName
      ? {
          '@type': 'Question',
          name: `How much does the ${winnerName} cost in the UK?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text:
              winner?.uk_price_gbp != null
                ? `Around £${winner.uk_price_gbp} on Amazon UK at last check. Confirm on the retailer.`
                : 'UK price is updating — check the buy boxes on this page.',
          },
        }
      : null,
    {
      '@type': 'Question',
      name: 'How does Gear Versus Tech score products?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Performance 40%, value 25%, build 20%, ease of use 15% — out of 10. Rankings are never sold.',
      },
    },
  ].filter(Boolean);

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: title,
        description,
        datePublished: createdAt,
        dateModified: updatedAt,
        author: { '@type': 'Organization', name: 'Gear Versus Tech' },
        publisher: { '@type': 'Organization', name: 'Gear Versus Tech', url: 'https://gearversustech.com' },
        mainEntityOfPage: pageUrl,
      },
      ...(winnerName && winnerRating ? [productNode(winnerName, winnerRating, winner)] : []),
      ...(runnerupName && runnerupRating ? [productNode(runnerupName, runnerupRating, runnerup)] : []),
      { '@type': 'FAQPage', mainEntity: faqEntities },
    ],
  });
}
