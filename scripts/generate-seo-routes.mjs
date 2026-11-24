import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');
const BASE_URL = 'https://basicfrench.org';
const SITE_NAME = 'Basic French';
const PERSON_ID = 'https://johnbendfeldt.com/#person';

const ROUTES = [
  {
    path: '/alphabet',
    title: 'French Alphabet & Phonetics | Basic French',
    description:
      'Learn the 26 letters of the French alphabet with IPA pronunciation, nasal vowels, accents, and native French audio examples.',
    heading: 'French Alphabet & Phonetics',
    summary:
      'Learn all 26 letters of the French alphabet with IPA pronunciation guides, nasal vowels, French accents, and native studio neural audio.',
  },
  {
    path: '/phrases',
    title: 'Basic French Phrases | Basic French',
    description:
      'Learn essential French phrases for beginners with native neural audio pronunciation. Greetings, polite expressions, café orders, and travel essentials.',
    heading: 'Basic French Phrases for Beginners',
    summary:
      'Master essential French greetings, polite expressions, café orders, and travel phrases with native neural audio pronunciation.',
  },
  {
    path: '/numbers',
    title: 'French Numbers (0–1,000) | Basic French',
    description:
      'Learn French numbers from 0 to 1,000 including soixante-dix, quatre-vingts, and quatre-vingt-dix with native French audio.',
    heading: 'French Numbers (0–1,000)',
    summary:
      'Learn how to count in French from 0 to 1,000 including vigesimal forms (soixante-dix, quatre-vingts, quatre-vingt-dix) with native audio.',
  },
  {
    path: '/time',
    title: 'Telling Time in French | Basic French',
    description:
      'Learn how to tell time in French (Quelle heure est-il ?, midi, minuit, et quart, et demie) with grammar rules and native audio.',
    heading: 'Telling Time in French',
    summary:
      'Learn how to ask and tell time in French using the 12-hour and 24-hour clock, midi, minuit, et quart, and et demie with native audio.',
  },
  {
    path: '/words',
    title: 'Common French Words | Basic French',
    description:
      'Build everyday French vocabulary with 240+ high-frequency words, beginner phonetic guides, and native French neural audio.',
    heading: 'Common French Words & Vocabulary',
    summary:
      'Build everyday French vocabulary with 240+ high-frequency words, phonetic pronunciation guides, and native French neural audio.',
  },
  {
    path: '/quiz',
    title: 'Interactive French Quiz | Basic French',
    description:
      'Test your French with adaptive spaced-repetition quizzes, an interactive French accent bar, and accent-forgiving answer grading.',
    heading: 'Interactive French Practice Quiz',
    summary:
      'Test your French alphabet, phrases, numbers, telling time, and vocabulary with adaptive spaced-repetition quizzes and accent helpers.',
  },
];

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export function buildRouteJsonLd(baseJsonLd, route) {
  const canonicalUrl = `${BASE_URL}${route.path}`;
  const breadcrumbId = `${canonicalUrl}#breadcrumb`;
  const graph = Array.isArray(baseJsonLd['@graph']) ? [...baseJsonLd['@graph']] : [];

  graph.push(
    {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: route.title,
      description: route.description,
      inLanguage: ['en', 'fr'],
      isPartOf: { '@id': `${BASE_URL}/#website` },
      about: { '@id': `${BASE_URL}/#course` },
      author: { '@id': PERSON_ID },
      breadcrumb: { '@id': breadcrumbId },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': breadcrumbId,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: SITE_NAME,
          item: `${BASE_URL}/`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: route.heading,
          item: canonicalUrl,
        },
      ],
    }
  );

  return {
    ...baseJsonLd,
    '@graph': graph,
  };
}

export function generateSeoRoutes() {
  const indexPath = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error(`Missing built index.html at ${indexPath}`);
  }

  const template = fs.readFileSync(indexPath, 'utf-8');
  const ldMatch = template.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  const baseJsonLd = ldMatch ? JSON.parse(ldMatch[1]) : null;

  for (const route of ROUTES) {
    const canonicalUrl = `${BASE_URL}${route.path}`;
    const escapedTitle = escapeHtml(route.title);
    const escapedDesc = escapeHtml(route.description);

    let html = template
      .replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${escapedTitle}</title>`)
      .replace(
        /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
        () => `<meta name="description" content="${escapedDesc}" />`
      )
      .replace(
        /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
        () => `<link rel="canonical" href="${canonicalUrl}" />`
      )
      .replace(
        /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
        () => `<meta property="og:url" content="${canonicalUrl}" />`
      )
      .replace(
        /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
        () => `<meta property="og:title" content="${escapedTitle}" />`
      )
      .replace(
        /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
        () => `<meta property="og:description" content="${escapedDesc}" />`
      )
      .replace(
        /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
        () => `<meta name="twitter:title" content="${escapedTitle}" />`
      )
      .replace(
        /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
        () => `<meta name="twitter:description" content="${escapedDesc}" />`
      )
      .replace(
        /<noscript>[\s\S]*?<\/noscript>/i,
        () => `<noscript>
      <h1>${escapeHtml(route.heading)}</h1>
      <p>${escapeHtml(route.summary)} Created by <a href="https://johnbendfeldt.com/" rel="author">John Bendfeldt</a>. Please enable JavaScript to use the full interactive app.</p>
      <nav aria-label="Lessons and resources">
        <ul>
          <li><a href="/">Basic French Home</a></li>
          <li><a href="/alphabet">French Alphabet &amp; Phonetics</a></li>
          <li><a href="/phrases">Basic French Phrases</a></li>
          <li><a href="/numbers">French Numbers (0–1,000)</a></li>
          <li><a href="/time">Telling Time in French</a></li>
          <li><a href="/words">Common French Words</a></li>
          <li><a href="/quiz">Interactive French Quiz</a></li>
          <li><a href="/privacy">Privacy Policy</a></li>
          <li><a href="/terms">Terms of Service</a></li>
        </ul>
      </nav>
    </noscript>`
      );

    if (baseJsonLd) {
      const routeJsonLd = buildRouteJsonLd(baseJsonLd, route);
      const serializedLd = JSON.stringify(routeJsonLd, null, 2).replace(/</g, '\\u003c');
      html = html.replace(
        /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
        () => `<script type="application/ld+json">\n${serializedLd}\n    </script>`
      );
    }

    const outFile = path.join(DIST_DIR, `${route.path.replace(/^\/+/, '')}.html`);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, html, 'utf-8');
  }

  // Stamp dist/sitemap.xml <lastmod> with the build date so deploys stay fresh
  const distSitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  if (fs.existsSync(distSitemapPath)) {
    const today = new Date().toISOString().slice(0, 10);
    const sitemapXml = fs
      .readFileSync(distSitemapPath, 'utf-8')
      .replace(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g, `<lastmod>${today}</lastmod>`);
    fs.writeFileSync(distSitemapPath, sitemapXml, 'utf-8');
  }

  console.log(`Generated ${ROUTES.length} static SEO route HTML files in dist/`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  generateSeoRoutes();
}

