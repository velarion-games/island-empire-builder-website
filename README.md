# Second Sailing website

The game's website at [secondsailinggame.com](https://secondsailinggame.com), served by GitHub Pages from `main`. A merge into `main` is a publish.

Plain HTML, CSS and JavaScript with no build step. The site copy mirrors the future Steam page, so copy changes go to the site and the Steam wireframe together.

## Preview locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. Opening the files directly also works, except for the newsletter forms.

## Layout

```
index.html            landing page
roadmap.html          past milestones and current targets
privacy.html          privacy note linked from the newsletter forms
CNAME                 custom domain for GitHub Pages
assets/css/site.css   shared chrome: tokens, fonts, nav, footer, newsletter, mist, rhumb lines, cursor, scrollbar
assets/css/home.css   landing page only
assets/css/page.css   header band and reading text for inner pages
assets/css/roadmap.css
assets/js/chart.js    rhumb lines and chart marks behind every page
assets/js/home.js     landing page header and voyage line
assets/js/newsletter.js
assets/fonts/         self-hosted Cormorant Garamond, Source Sans 3, Source Serif 4 (SIL Open Font License)
assets/img/           social preview card and icons
```

## Notes

- **Unlisted for now.** Every page has `<meta name="robots" content="noindex">` while the title isn't final. Remove those lines to let search engines index the site.
- **Newsletter.** The forms use the same EmailOctopus list and form as velarion.games. EmailOctopus's embed only supports one form per page, so `newsletter.js` drives one hidden copy of it from our own forms. The embed and Google reCAPTCHA load only when someone starts using a form.
- **Third-party requests.** Fonts are self-hosted. The only third-party script on page load is Umami (cookieless visitor stats, counts only on secondsailinggame.com). Update `privacy.html` if that changes.
- **Shared chrome** (nav, footer, newsletter) is repeated in each HTML page. Change all three pages together.
