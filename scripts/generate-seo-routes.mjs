import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '../dist');
const BASE_URL = 'https://basicfrench.org';

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

const indexPath = path.join(DIST_DIR, 'index.html');
if (!fs.existsSync(indexPath)) {
  throw new Error(`Missing built index.html at ${indexPath}`);
}

const template = fs.readFileSync(indexPath, 'utf-8');

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
      <p>${escapeHtml(route.summary)} Please enable JavaScript to use the full interactive app.</p>
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

  const outFile = path.join(DIST_DIR, `${route.path.replace(/^\/+/, '')}.html`);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, html, 'utf-8');
}

console.log(`Generated ${ROUTES.length} static SEO route HTML files in dist/`);
