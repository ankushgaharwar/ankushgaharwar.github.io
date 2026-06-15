# iamrossmason-mirror

Static mirror of `https://iamrossmason.com/` captured from the live Nuxt export on 2026-04-24.

## What is included

- Exported HTML for 17 routes
- Nuxt client bundles and static payload files
- Local copies of the site fonts and `foot-mobile.webp`
- Crawl metadata in `mirror-summary.txt`

## How to run locally

Use any static file server from the repo root.

PowerShell:

```powershell
.\serve.ps1
```

Then open `http://127.0.0.1:8123/`.

## Notes

- DatoCMS-hosted image assets used by the mirrored pages have been localized into `mirror-assets/`.
- The mirrored site still references some production services used by the live site, including Vimeo video files, Gumroad, Google Tag Manager, and social links.
- The hidden contact form markup is present in the mirror, but end-to-end form handling depends on the deployment platform and any backend integration used on the live site.
- `external-urls.txt` lists external URLs discovered during the crawl for follow-up if you want to localize more assets later.
- The mirror has been patched to work both at the domain root and from a GitHub Pages-style repo subpath such as `/iamrossmason-mirror/`, including runtime chunk loading from `_nuxt/`.
