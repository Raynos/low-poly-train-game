# Toy icon atlas

Generated with built-in imagegen on September 20, 2026. Runtime atlas:
public/ui/toy-icons.png (1254 × 1254 PNG). Source retained in the Codex generated_images directory.
25 equally spaced sprites. CSS atlas addressing preserves the generated pixels, with no SVG substitutes.

## Exact prompt

Use case: ui-mockup. Create a production sprite atlas for a premium low-poly wooden toy train game for toddlers. ONE perfectly square image with exactly 5 columns by 5 rows of equally sized square cells, precisely evenly spaced. Transparent background, no grid lines, no words, no letters, no numerals, no captions, no surrounding panel. Each item centered in its own cell, occupying 65% of its cell with equal empty margins so CSS can display each cell independently. Handcrafted high-quality stylized 3D miniature objects, soft rounded/beveled wood and painted enamel, readable chunky silhouettes, warm light, subtle contact shading. Cohesive teal, cream, sage, ochre palette. No thin outline SVG look. All controls read at 48px. EXACT ORDER left to right: ROW 1: green play triangle; two teal pause bars; teal back arrow pointing left; teal toy camera with brass lens; cream and teal speaker with two sound waves. ROW 2: sage settings cog; folded illustrated map with a little railway; coral close X; brass steam whistle; shiny red apple with leaf. ROW 3: friendly coral-shirt wooden peg person; friendly blue-shirt wooden peg person; friendly mustard-shirt wooden peg person; little wooden passenger seat; lush green tree. ROW 4: miniature blue stream with two pebbles; little wooden arched railway bridge; adorable fluffy ivory sheep; open cream picture book showing an apple; coral wooden heart. ROW 5: friendly waving hand; teal and ochre steam locomotive with cream roof; cream railway station with terracotta roof; little wooden crate holding three apples; wooden speech bubble with three raised cream dots. Preserve strict 5x5 grid and centers. Output a crisp large square transparent PNG sprite sheet.

## App icon

Second built-in imagegen call referenced the atlas and generated an opaque cream square.
Source: exec-c86b3b10-3536-4e4a-9600-dd4570824c2e.png in the same generated_images directory.
Standard sips resampling exported 512px, 192px and 180px app icons; original preserved.
Manifest uses `any` because the silhouette does not fit a circular mask's safe area.

Exact prompt:

Create ONE premium app icon for this toddler train game, using the exact illustrated toy locomotive from row 5 column 2 of the attached icon atlas as the style reference. Just one large teal and warm ochre steam locomotive with cream roof, chunky rounded wooden toy detailing, friendly handcrafted polished 3D miniature appearance, three-quarter view. Center it inside a square pale warm cream background with generous safe padding: all train parts inside central 70% of canvas. No border, no text, no letters, no extra symbols, no grid. Square high resolution image. Cohesive with reference atlas; crisp readable silhouette on a phone home screen. Opaque cream background.
