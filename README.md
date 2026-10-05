# kasseygc.github.io

Personal site of Kassey Guertin-Chang. Jekyll 3.10 + [jekyll-polyglot](https://github.com/untra/polyglot)
(English, French-Canadian, German, Cantonese), built and deployed by
`.github/workflows/pages.yml` on every push to `master`.

## Where things live

| What | File |
| --- | --- |
| Home page copy (per language) | `_pages/about.md`, `about.fr-CA.md`, `about.de.md`, `about.zh-HK.md` |
| CV, language services | `_pages/cv*.md`, `_pages/langservices*.md` |
| Engineering projects | `_data/tech_projects.yml` |
| Linguistics papers | `_portfolio/*.md` (`field`, `studied`, `kind`, `pdfs` in front matter) |
| Essays | `_posts/*.md` (`kw` = the word the concordance aligns the title on) |
| Experience log on the home page | `_data/experience.yml` |
| Header navigation | `_data/navigation.yml` |
| Interface strings (all languages) | `_data/i18n.yml` |
| Parsed hero sentence | `_data/specimen.yml` (Universal Dependencies + o200k_base tokens) |
| IPA-glyph portrait | `_includes/portrait/*.txt`, regenerate with `scripts/portrait.py` |
| Styles / behaviour | `assets/css/site.css`, `assets/js/site.js` (no build step, no dependencies) |
| Fonts | `assets/fonts/` — Source Code Pro and Gentium Book Plus, subset to Latin + IPA |

Text fields that end in `_<lang>` (for example `title_fr-CA`, `role_de`) override the
English value for that language. Polyglot prefixes `href="/…"` links with the active
language automatically; use `{% static_href %}` when a link must not be rewritten.

## Interactive pieces

- **Specimen** (home hero): the sentence is parsed by hand in `_data/specimen.yml`;
  `site.js` draws the dependency arcs. Token ids come from `tiktoken`'s `o200k_base`.
- **Concordance** (home, `/year-archive/`): searches `assets/corpus.json`, which is built
  from all essays and papers. Hits link to `#kwic=<query>~<n>` and the article page
  highlights that occurrence.
- **Command palette**: Ctrl/⌘ K. `/` focuses the page's search field, `g` toggles the layout
  grid, `j`/`k` move through the engineering and linguistics indexes.

## Local preview

```bash
bundle install
bundle exec jekyll serve
```

The `github-pages` gem pins Jekyll 3.10, which wants Ruby ≤ 3.3; CI uses Ruby 3.2.
