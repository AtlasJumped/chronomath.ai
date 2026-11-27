# chronomath.ai

A human-readable map of the mathematics and physics of the Holistic Model of Reality (HMR). The work itself is called HMR math and HMR physics. The domain name is older than the work.

The site exists so that a reader can see, step by step, where the human idea ends, where AI derivation takes over, where AI is guessing, and where the work has hit a wall.

## Pages

| Page | File |
|---|---|
| Home: the premise, the binary framing, the God question | `index.html` |
| Assumptions | `assumptions.html` |
| Where it runs away: the map from premise to frontier | `map.html` |
| Open problems, with approach, progress, and status | `open-problems.html` |
| Primer: objects, operators, worked examples, Version 2 definitions | `primer.html` |
| Other math: what is reused, and a conjecture about kinds of math | `other-math.html` |
| Tracker: HMR, math, physics, in three columns | `tracker.html` |
| Glossary | `glossary.html` |
| HMR physics | `physics.html` |

## How it is built

Static HTML, one stylesheet, one script, no framework. Page bodies live in `src/*.body.html`. `python3 tools/build.py` wraps each body in the shared header and footer and writes the pages to the repository root. Tracker rows live in `tracker-data.js`. Rows drafted in the tracker form are saved in the reader's browser only.

## Sources

- The live Version 2 pages: the HMR source pages
- Proofs, checks, and runs: [HMR Math](https://github.com/AtlasJumped/hmr-math) and [HMR Physics](https://github.com/AtlasJumped/hmr-physics)
- History only: the first attempt, from late 2025, is kept at [the first-attempt repository](https://github.com/AtlasJumped/Leos-HMR). Its own README says, "Much of it is garbage AI circa late 2025." Nothing on this site is taken from it.

## Status

Every claim on the site carries a label: established, HMR's view, AI derivation that was checked, AI guess, or open. The colors on the map page have not yet been reviewed by HMR's author.

## Hosting

`CNAME` holds `chronomath.ai` for GitHub Pages. Pages and DNS are switched on outside this repository.

## License

See `LICENSE`.
