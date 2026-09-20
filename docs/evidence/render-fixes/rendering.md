# Edge clarity and HDR follow-up

Compared against the actual local Wildshard singleplayer implementation:
`src/core/Game.ts` uses a HalfFloat composer, AgX tone mapping and SMAA. Its resolution
settings are in `src/core/tier.ts`. This game now uses Three.js's bundled equivalents
without adding remote assets or importing Wildshard's heavier atmosphere effects.

The first SMAA-only screen review still showed visible stepping at devicePixelRatio1.
The final pipeline adds up to4x MSAA on the HDR scene target before SMAA, and uses a
1.5 minimum render scale /2 maximum with a6M-pixel ceiling. OutputPass applies AgX
and sRGB conversion once after linear-space SMAA. Devices without float render-target
support use byte buffers, MSAA and FXAA after output conversion.

Resize updates renderer/composer dimensions together. Place thumbnails use multisampled
HDR and the same tone-map/output conversion. Renderer statistics include all post passes.
Debug snapshots expose actual ratio, dimensions, HDR support, sample count and AA mode.
SMAA lookup textures are embedded in the JS bundle and remain offline.

Initial screenshot review at844×390 confirms much smoother rails, roof and boiler outlines
after MSAA plus supersampling. Final browser performance/compatibility checks follow.
Physical iPhone/iPad frame-time and memory acceptance still require device measurement.
