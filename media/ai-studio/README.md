# AI studio guest sprites

Seven community-inspired AI characters, adapted as code-drawn pixel art for
C0Feline1's personal homepage. The current map uses simplified code-drawn 48×64 game sprites from `js/ai-sprites.js`. The older detailed illustration atlas is retained for reference and optional portrait display only.
No external animation framework or image service is involved.

Rebuild: `python3 tools/build_ai_sprites.py` (Pillow required for authoring only).
The generator includes the original integer-grid polygon drawings, with
redrawn leg, arm and hand poses. It does not need the earlier standalone
`ai-pixel-party` directory to build.

## Current map sprites

`AIStudioSprites.draw(ctx,id,state,frame,x,y,width,facingLeft,direction)` renders cached code-drawn poses. Native dimensions are `48×64`; the room uses width27 and height36. Directions are front/back/left/right, with faceless rear views and soft three-quarter views with both eyes visible. All twelve shared states have twelve authored phases, including articulated walk/run, work, talk, wave, read, coffee, nap, sit, carry, cheer and idle. Each state declares frameMs and twelve phaseLabels; idle includes blinks, head turns and breathing. `drawPortrait()` optionally loads the old illustration atlas on demand. The map does not use cropped front-view illustrations for locomotion.

## Earlier illustration layout and authoring reference

- `characters.png`: 1344 × 784, 14 columns × 7 rows, each frame 96 × 112.
- Rows: GPT, DeepSeek, Claude, Grok, Gemini, Kimi, Doubao.
- Columns: idle × 2, walk × 4, run × 4, work × 2, wave × 2.
- Idle frame 1 is a blink; show it briefly rather than at a 50% duty cycle.
- Walk and run redraw alternating legs and feet, with swinging / bent arms.
- Work redraws forearms and alternating typing hands. Grok puts down the axe.
- Wave redraws a raised arm and a changing hand angle.
- `atlas.json`: machine-readable frame and character metadata.
- `frames-preview.png` and `*-preview.gif`: authoring review contact sheet and
  animations; not loaded by the homepage.

Earlier atlas layout, retained as an authoring reference (the current map API dimensions and pose counts are described above):
`draw(ctx, id, state, frame, x, y, width, facingLeft)` draws a pose or returns
false before loading / for unknown IDs. Height is `width * 112 / 96`.
`isReady()` returns the loaded status. Frame indexes wrap within their state.

## Character references and attribution

Pixel adaptation and animation are original code-drawn fan art, adapted from
the character references approved for this personal-page preview. These are
not official AI-brand character designs. Doubao alone follows its official
brown-black bob-haired avatar; its full outfit and bag are this adaptation's
supplementary design, not a reconstruction of the earliest 3D model.

| Character | Identifying reference | Upstream creator |
| --- | --- | --- |
| GPT | Silver-white long hair, dragon horns, wings, tail, white gown | ZipZipPipe |
| DeepSeek | Blue hair, maid headband, blue-white dress, forked whale tail | 上善无形 original character; ZipZipPipe and community derivatives |
| Claude | Copper hair, sunburst flower, cream/black/orange gown, book | ZipZipPipe |
| Grok | Blonde twin tails, bat wings, dark/red dress, X poleaxe | ZipZipPipe |
| Gemini | Blue-purple hair, cat ears/tail, mismatched eyes, four-point stars | ZipZipPipe |
| Kimi | Silver-white hair, midnight-blue maid dress, moon and K charm | ZipZipPipe |
| Doubao | Short brown-black bob, gentle smile, white inner top and dark outerwear | Doubao official avatar; original full-body adaptation |

Sources:

- [AI Moe Atlas reference index](https://selinlee.github.io/ai-moe-atlas/zh/)
- [ZipZipPipe original character collection](https://www.pixiv.net/artworks/148186519)
- [Original whale-girl author post](https://www.bilibili.com/opus/1231977657712771073)
- [Doubao official website](https://www.doubao.com/chat/)
- [Doubao official avatar](https://lf-flow-web-cdn.doubao.com/obj/flow-doubao/doubao/web/doubao_avatar.png)

The upstream atlas records whale-girl under CC BY-NC-SA 4.0 and the
ZipZipPipe characters under the author's noncommercial conditions. This
adaptation is noncommercial fan art. Retain the creator chain and sources
when redistributing; the whale-girl adaptation follows CC BY-NC-SA 4.0.
No commercial rights to upstream character designs or brands are granted.

The left/right views use a three-quarter face and torso rather than a one-eye profile. Dragon, whale and cat tails attach to the rear hip: a right-facing character has the tail on the screen-left rear side, and the left view mirrors it.

## Detailed studio cast and viewer

The map and `studio-characters.html` now share native48×64 art. Fine face, hair, clothing, accessory and tail pixels are drawn natively rather than produced solely by upscaling the earlier silhouette. The three original studio heroes are separately implemented in `js/studio-heroes.js`; gameplay sprites in `js/pixel.js` remain unchanged. The viewer supports character selection, four directions, all twelve motion states, stepping, slow playback, grid/logo/personality controls and transparent PNG export.

The viewer's portrait collection also preserves the seven original96×112 portraits, with new portraits of C0, X0 and F1 drawn natively at the same resolution. Click a portrait for a larger view, PNG download or the matching motion preview. `portraits/` holds these ten transparent PNG files; `ai-pixel-party-original.png` preserves the first seven-character poster byte for byte. `tools/build_studio_portraits.py` rebuilds the three new portraits. These display assets remain independent from the walking sprites.

All ten cast members now have10×10 code-drawn marks in `js/ai-badges.js`. C0 uses a cyan code terminal, X0 a pink bow with violet paintbrush, and F1 a white/pink paw. The marks appear above characters, in the homepage's follow selector, and throughout the viewer. Side-facing pupils look in the direction of travel; tail contours have separate shading and a clear inner gap where they curl beside skirts or hair.

## Shared and signature materials

The material viewer separates twelve shared actions from three character-specific actions per cast member (thirty signatures in total). `uniqueActions(id)` returns the selected character's action metadata; every signature has twelve phases in four directions. A signature requested for another owner falls back to idle. The homepage now schedules these actions through its local director; game integration remains deferred. The viewer exports either a single transparent frame or a576×256 transparent action sheet: twelve frame columns, with front/right/left/back direction rows.

## GBA-inspired motion study

Both kits now share `js/studio-gait.js`: walk/run12 poses with fixed-length joints, heel/flat/toe contact and a clear recovery arc. A walk cycle remains800ms and a run cycle560ms; the twelve pose durations divide these unchanged totals. `stridePixels`20/36 drives camera-relative movement and distance-based map gait, rather than merely raising animation playback speed. All other life actions and idle also have12 authored poses, with separate timing metadata. The authored colors stay grouped into deliberate material ramps without dithering. The viewer includes a12-pose breakdown for every selected action, named phase labels and optional moving ground for locomotion. Rear-facing props are drawn before the torso/head layers, with only spatially exposed edges visible; rear clothing excludes front chest/apron details. The homepage uses the same frameMs metadata for stationary actions and distance-based gait for locomotion. This is a fan-art style study, not Nintendo asset reuse or a promise of hardware-accurate GBA format. Official visual reference: https://www.nintendo.co.jp/event/e3/gbasoft/legendofzelda/index.html .

## Twelve-pose comparison

`js/studio-motion.js` samples body, joint and prop coordinates before redrawing on the native pixel grid; it never blends bitmap frames. Discrete expressions and contact events remain keyed. The viewer lazily loads a frozen V8 reference in `js/studio-reference8.js` for synchronized8/12 comparison at the same cycle duration. Reference renderers use a private namespace and never replace the live gait or kits. Quiet idle/nap poses can retain an intentional held beat. Exports follow the selected metadata: twelve columns by four direction rows,576×256 transparent pixels. Game integration remains deferred.

## Living studio choreography

`js/studio-director.js` now combines the material kits in the homepage scene: thirty rotating signatures and four paired stories (art, cookies, fish and tea). Actors use the existing furniture-aware navigation to reach the foreground, then perform two complete cycles with staggered responses. No more than two solo actors or one pair are reserved at once. Clicking a mark follows the actor; double-clicking requests a signature, and movement or the group photo takes priority. Scene logs are emitted only after real arrivals and starts, with localized labels. The former personality overlay is a fallback rather than a second effect stacked over the new gestures. All scheduling, animation and logs are local fiction, with no model requests.

## Individual workstations and camera

The homepage world is now1280×180 across four areas, with one named, decorated workstation for every cast member. `StudioWorld.workstations` is the shared source for desk drawing and actor home positions; furniture footprints also come from the world model. Common lounge, tea, greenhouse and cat areas remain separate. The right-hand foreground accommodates all ten photo poses.

Scene simulation runs at a fixed50ms step while rendering follows each display refresh. Actor positions and distance-based gait interpolate between simulation steps; a time-based critically damped camera shares one pixel-aligned transform with the world. The backing canvas uses an adaptive integer3–5 scale, with nearest-neighbour sampling, cached desks and viewport culling. Character art and action cycle durations are unchanged.


## Face and limb readability

The original three heroes now use a coherent forward-facing three-quarter eye plane, matching brows, nose, mouth and glasses. Both legs share the same fabric or skin base; narrow edge shadows and contact seams establish depth. The AI kits likewise use dedicated leg and shoe ramps instead of costume shadows or hair highlights. Native cuffs, wrists, palms and thumbs keep hands separate from clothing and held props. Existing hair, tail silhouettes, native dimensions, action IDs, twelve-pose counts and cycle timings are retained; intentional tail-grooming and tail-chasing glances remain.

The original heroes also use a dedicated three-quarter torso projection: shoulder line, collar, front pocket or bow, waist and skirt folds turn with the face. Shared shoulder anchors attach common and signature arm poses to the same rotated body; front and back clothing remain distinct.
