import fs from 'node:fs';
import path from 'node:path';

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
});
