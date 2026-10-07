# kasseygc.github.io

Personal site of Kassey Guertin-Chang. Jekyll 3.10 + [jekyll-polyglot](https://github.com/untra/polyglot)
(English, French-Canadian, German, Cantonese), built and deployed by
`.github/workflows/pages.yml` on every push to `master`.

## Where the words live

| What | File |
| --- | --- |
| Home page: opening sentence (`intro`), About (`lead`), Now / Before / Education (`facts`), selected work | `_pages/about.md`, `about.fr-CA.md`, `about.de.md`, `about.zh-HK.md` |
| CV, language services | `_pages/cv*.md`, `_pages/langservices*.md` |
| Engineering projects | `_data/tech_projects.yml` (a project without `url` is listed without a link) |
| Linguistics papers | `_portfolio/*.md` (`field`, `studied`, `pdfs` in front matter) |
| Essays | `_posts/*.md` |
| Header links | `_data/navigation.yml` |
| Small interface text (buttons, labels, footer, languages list) | `_data/i18n.yml` |

Fields ending in `_<lang>` (for example `title_fr-CA`, `role_de`) override the English value
for that language.

## Artwork

Kassey's photographs and paintings live in `images/art/` and are listed in `_data/art.yml`.
They are decoration only and each piece appears once: `sky` and `blinds` on the home page,
`chandelier` on Engineering, `cable_car` on Linguistics, `painting` on Writing (set with
`decor: <key>` in a page's front matter).

## Look

`assets/css/site.css` and `assets/js/site.js` — no build step, no dependencies. Type is
Instrument Serif (headings), Geist (text) and Gentium Book Plus (essays and papers, for IPA).
Each section has a `data-tint` colour that the page background fades to while it is on screen.

## Local preview

```bash
bundle install
bundle exec jekyll serve
```

The `github-pages` gem pins Jekyll 3.10, which wants Ruby ≤ 3.3; CI uses Ruby 3.2.
