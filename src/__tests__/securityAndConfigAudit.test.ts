import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { levenshteinDistance } from '../utils/frenchText';
import { ProgressService } from '../services/progressService';

const ROOT_DIR = path.resolve(__dirname, '../..');

describe('Production Security, Netlify Pre-Deploy Gate & PostgreSQL RLS Audit', () => {
  it('enforces pre-deploy npm test gate, basicfrench.org HTTPS redirects, and strict OWASP CSP in netlify.toml', () => {
    const netlifyToml = fs.readFileSync(path.join(ROOT_DIR, 'netlify.toml'), 'utf-8');

    expect(netlifyToml).toContain('command = "npm test && npm run build"');
    expect(netlifyToml).toContain('https://basicfrench.org/:splat');
    expect(netlifyToml).toContain('X-Frame-Options = "DENY"');
    expect(netlifyToml).toContain('X-Content-Type-Options = "nosniff"');
    expect(netlifyToml).toContain('Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"');
    expect(netlifyToml).toContain("script-src 'self'");
    expect(netlifyToml).toContain("manifest-src 'self'");
    expect(netlifyToml).toContain('for = "/*.html"');
    expect(netlifyToml).not.toContain("'unsafe-inline' 'unsafe-eval'");
  });

  it('contains zero inline executable <script> tags in index.html, public/privacy/index.html, and public/terms/index.html', () => {
    const htmlFiles = [
      'index.html',
      'public/privacy/index.html',
      'public/terms/index.html',
    ];

    for (const relPath of htmlFiles) {
      const html = fs.readFileSync(path.join(ROOT_DIR, relPath), 'utf-8');
      const scriptTags = html.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) || [];
      for (const tag of scriptTags) {
        const isJsonLd = /type=["']application\/ld\+json["']/i.test(tag);
        const isExternalModule = /\bsrc=["'][^"']+["']/i.test(tag);
        expect(isJsonLd || isExternalModule).toBe(true);
      }
    }

    // Static legal pages link back to Basic French and Basic Language School
    const privacyHtml = fs.readFileSync(path.join(ROOT_DIR, 'public/privacy/index.html'), 'utf-8');
    const termsHtml = fs.readFileSync(path.join(ROOT_DIR, 'public/terms/index.html'), 'utf-8');
    expect(privacyHtml).toContain('https://basiclanguage.school');
    expect(termsHtml).toContain('https://basiclanguage.school');
  });

  it('enforces Row-Level Security, REVOKE FROM anon, and CHECK constraints in docs/schema.sql', () => {
    const schemaSql = fs.readFileSync(path.join(ROOT_DIR, 'docs/schema.sql'), 'utf-8');

    expect(schemaSql).toContain('ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;');
    expect(schemaSql).toContain('ALTER TABLE public.word_progress ENABLE ROW LEVEL SECURITY;');
    expect(schemaSql).toContain('REVOKE ALL ON public.quiz_sessions FROM anon;');
    expect(schemaSql).toContain('REVOKE ALL ON public.word_progress FROM anon;');
    expect(schemaSql).toContain('auth.uid() = user_id');
    expect(schemaSql).toContain('mastery_level BETWEEN 0 AND 5');
  });

  it('configures GitHub Actions CI to run npm test and npm run build on push and pull_request', () => {
    const ciYaml = fs.readFileSync(path.join(ROOT_DIR, '.github/workflows/ci.yml'), 'utf-8');
    expect(ciYaml).toContain('npm test');
    expect(ciYaml).toContain('npm run build');
  });

  describe('Input Hardening, Prototype Guards & Service Worker No-Reload Regression', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('never triggers window.location.reload from service worker controllerchange in src/index.tsx', () => {
      const indexTsx = fs.readFileSync(path.join(ROOT_DIR, 'src/index.tsx'), 'utf-8');
      expect(indexTsx).not.toContain('window.location.reload');
      expect(indexTsx).not.toContain('controllerchange');
    });

    it('bounds 20,000-character bad inputs in levenshteinDistance', () => {
      expect(levenshteinDistance('a'.repeat(20000), 'b'.repeat(20000))).toBe(250);
    });

    it('sanitizes unsafe localStorage keys, arrays, and out-of-range metrics in ProgressService', async () => {
      await ProgressService.recordWordAttempt({
        category: 'phrases',
        wordId: 'constructor',
        prompt: 'bonjour',
        answer: 'hello',
        isCorrect: true,
      });
      await ProgressService.recordWordAttempt({
        category: 'phrases',
        wordId: '__proto__',
        prompt: 'merci',
        answer: 'thanks',
        isCorrect: true,
      });
      expect(localStorage.getItem('french_word_progress')).toBeNull();

      localStorage.setItem(
        'french_word_progress',
        JSON.stringify({
          __proto__: { wordId: '__proto__', masteryLevel: 5 },
          constructor: { wordId: 'constructor', masteryLevel: 5 },
          badArray: [1, 2, 3],
          ok_word: { wordId: 'ok_word', masteryLevel: 99, timesCorrect: -3 },
        })
      );
      localStorage.setItem(
        'french_quiz_sessions',
        JSON.stringify([
          null,
          'bad',
          { category: 'phrases', score: 999, totalQuestions: 10, percentage: 999 },
        ])
      );

      const mastered = await ProgressService.getMasteredWordIds();
      expect(mastered.has('ok_word')).toBe(true);
      expect(mastered.has('constructor')).toBe(false);
      expect(mastered.has('__proto__')).toBe(false);

      const stats = await ProgressService.getUserStats();
      expect(stats.wordsMasteredCount).toBe(1);
      expect(stats.recentSessions[0].score).toBe(10);
      expect(stats.recentSessions[0].percentage).toBe(100);
    });
  });
});
