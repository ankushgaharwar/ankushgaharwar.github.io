# Poster wall

Open `/posters/` on the portfolio site. `/posters.html` redirects to the same page and preserves individual poster links such as `/posters/#90`.

The page is static HTML, CSS, and JavaScript; no build or package installation is needed. It contains 200 compositions using ten SVG layouts and 32 images from fifteen existing portfolio projects. A seeded shuffle mixes subjects, layouts, and image order while keeping poster links stable across reloads. `image-sources.json` records the original file behind each optimized WebP. Image color treatments are applied only in the page; original portfolio files are unchanged. The bundled Inter fonts include their SIL Open Font License.

Drag to move around the wall, scroll or pinch to zoom, and select a poster for its animated detail view. Arrow keys navigate posters, Enter opens one, Escape closes it, +/− zoom, and 0 resets the wall. The detail view supports previous/next, replay, and a link to the original project. Animation respects reduced-motion preferences.

On a mouse, moving into the outer 28% of the viewport pans toward that direction, with zones capped at 300px on the left/right and 240px on the top/bottom. Speed increases smoothly toward the edges. Movement stops in the center, over controls, while dragging or viewing a poster, when the pointer leaves, or when the page loses focus. The Auto-pan button pauses/resumes this behavior. It is disabled by default for reduced-motion preferences and never activates from touch input.

Edit the project list and layout functions in `posters.js` to change the artwork, text, or compositions. The wall only mounts SVG artwork close to the viewport to keep the collection responsive.

The wall also drifts diagonally on its own at 12 horizontal / 7.2 vertical pixels per second, like the reference. Interacting pauses the idle drift; it resumes after 1.8 seconds of inactivity. Edge panning takes priority. Drift pauses for poster details, hovered controls, hidden tabs, and lost focus, and reverses at the collection boundaries. Auto-pan controls both drift and edge panning, including on touch screens. Reduced-motion preferences disable both by default.
