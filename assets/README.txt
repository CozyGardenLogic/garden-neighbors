GARDEN NEIGHBORS
A Cozy Plant Puzzle

OPENING THE GAME
Unzip the entire package. Keep index.html beside assets/.
Open index.html in a browser with an internet connection for Phaser 3 from
cdnjs. For hosting, upload index.html and the complete assets/ folder.
No external font service is used while playing.

ARTWORK AND SLICES
README_NUEVOS_GRAFICOS.txt describes the supplied artwork.
ui/ui_slices.json is the source of all slice margins. The HTML contains an
identical embedded fallback so the game still opens if JSON loading fails.
Nine-slice borders preserve the source corners and scale only the centre
and edges. For top=bottom=0, the piece stretches horizontally; its source
height and end caps scale proportionally to the displayed height.
Round buttons and paper cards are proportional, un-stretched images, as
specified by stretch=false. All labels are rendered separately in code.

BOARD
The frame uses bed_frame.png with 110/110/125/140 source slice margins.
The visible opening uses left/right 91, top 105, bottom 118, scaled equally.
The opening is square for both 3x3 and 4x4. Its underlay is #46301C.
Terrain is cropped once at load using alpha >128. Gaps are 1.5% of the
nominal tile side, minimum 2 screen pixels; inner padding is 1% of the
opening. Sun/shade variants are deterministic per level and cell.
Rendering order: dark soil, cropped terrain and small symbols, wooden
frame, independent transparent Phaser canvas with plants and effects.
Plant colours never inherit soil tint, opacity, blend or filters.

PLANTS
plants/ contains 33 transparent 512 x 512 PNG images:
seed.png (one common seed) and four phases for each of eight plants:
tomato, lettuce, basil, mint, peas, onion, beans, pumpkin.
The phases are sprout, young, adult and wilted.
Full plant canvases keep their shared 50%/80% ground anchor. Card adults are
alpha-cropped once and cached. Rule icons keep the complete plant canvas
and share one composition with the ground symbol at the upper left.
Beans have long, thin, smooth PURPLE pods; peas stay green with round peas.

INTERFACE
The title is Garden Neighbors, subtitle A Cozy Plant Puzzle.
Start and game backgrounds select landscape/portrait art, using cover.
All text uses local fonts/PatrickHand-Regular.ttf (Patrick Hand, downloaded
from Google Fonts); fonts/OFL.txt contains the SIL Open Font License.
Wood/green buttons use cream #FFF6DC text and a soft brown shadow.
Paper uses dark brown #4A2A12 text.
Buttons retain at least 48 x 48 screen pixels. Press feedback is 94% scale
for 80 ms; reduced motion disables the press animation.
Decorative layers do not intercept pointer events.

MY GARDEN
The fixed background is the supplied game artwork. Miniatures reuse the
real wooden frame, cropped terrain, soil symbols and saved final layouts.
The current bed pulses softly; locked bed titles are hidden behind '?'.
Wheel, mouse drag and arrow keys scroll horizontally; touch scrolls the
portrait map from bottom to top. Reduce motion disables the entry effects.

OPTIONAL MAP ART (not supplied)
map/stepping_stone_1.png
map/stepping_stone_2.png
map/stepping_stone_3.png
map/deco_bench.png
map/deco_scarecrow.png
map/deco_pond.png
The stepping stones are drawn with canvas until their PNGs are present.
Missing decorations are omitted entirely. Adding these files later needs
no rule, level or save changes.

FALLBACKS
Missing images warn with their path and retain the provisional drawings.
Missing terrain variant 2 falls back to 1, then the legacy base file, then
the deterministic drawing. Missing backgrounds use a plain, unobtrusive fallback.
Missing UI pieces retain the CSS/provisional appearance; gameplay continues.

AUDIO AND PROGRESS
All 15 existing audio files in audio/ are preserved byte-for-byte.
Music, ambience and volume settings retain their existing behaviour.
All effects now pass through AudioManager: one button lane and one queued
action lane. Growth plays drop 0ms, pop 300ms, grow 550ms, fruit 1050ms.
Rapid planting cancels the interrupted sequence. A ding waits until 250ms
after fruit ends; completion replaces it with win after a 400ms gap, then
stars at 350ms intervals. File onsets and 60ms envelopes are handled in
code; no MP3 is edited. Music and ambience stay outside the effect queue.
The localStorage keys are deliberately unchanged to preserve existing saves:
cozy-garden-logic-v4 and cozy-garden-settings-v1.
All eight rules, all 20 maps/seeds, solver, victory predicate, progress
schema and saving logic remain unchanged.

CREDITS
Made with care by ZM.
Patrick Hand by Patrick Wagesreiter. SIL Open Font License 1.1.
Thanks:


PACKAGED ASSET FILES
README.txt
README_NUEVOS_GRAFICOS.txt
audio/ambience_garden.mp3
audio/music_game_1.mp3
audio/music_game_2.mp3
audio/music_menu.mp3
audio/sfx_button.mp3
audio/sfx_drop_1.mp3
audio/sfx_fruit.mp3
audio/sfx_grow.mp3
audio/sfx_hint.mp3
audio/sfx_pickup.mp3
audio/sfx_pop_1.mp3
audio/sfx_return.mp3
audio/sfx_star.mp3
audio/sfx_wilt.mp3
audio/sfx_win.mp3
bed_frame.png
bg_game_landscape.jpg
bg_game_portrait.jpg
bg_start_landscape.jpg
bg_start_portrait.jpg
fonts/OFL.txt
fonts/PatrickHand-Regular.ttf
logo.png
plants/basil_adult.png
plants/basil_sprout.png
plants/basil_wilted.png
plants/basil_young.png
plants/beans_adult.png
plants/beans_sprout.png
plants/beans_wilted.png
plants/beans_young.png
plants/lettuce_adult.png
plants/lettuce_sprout.png
plants/lettuce_wilted.png
plants/lettuce_young.png
plants/mint_adult.png
plants/mint_sprout.png
plants/mint_wilted.png
plants/mint_young.png
plants/onion_adult.png
plants/onion_sprout.png
plants/onion_wilted.png
plants/onion_young.png
plants/peas_adult.png
plants/peas_sprout.png
plants/peas_wilted.png
plants/peas_young.png
plants/pumpkin_adult.png
plants/pumpkin_sprout.png
plants/pumpkin_wilted.png
plants/pumpkin_young.png
plants/seed.png
plants/tomato_adult.png
plants/tomato_sprout.png
plants/tomato_wilted.png
plants/tomato_young.png
seed_drawer.png
soil_rocks.png
soil_shade_1.png
soil_shade_2.png
soil_sun_1.png
soil_sun_2.png
ui/icon_back.png
ui/icon_back_light.png
ui/icon_check.png
ui/icon_hint.png
ui/icon_lock.png
ui/icon_lock_light.png
ui/icon_question.png
ui/icon_question_light.png
ui/icon_reset.png
ui/icon_reset_light.png
ui/icon_settings.png
ui/icon_settings_light.png
ui/icon_shade.png
ui/icon_sound_off.png
ui/icon_sound_off_light.png
ui/icon_sound_on.png
ui/icon_sound_on_light.png
ui/icon_star.png
ui/icon_star_empty.png
ui/icon_star_empty_light.png
ui/icon_sun.png
ui/icon_undo.png
ui/icon_undo_light.png
ui/ui_bubble.png
ui/ui_button.png
ui/ui_button_gold.png
ui/ui_button_green.png
ui/ui_button_round.png
ui/ui_card.png
ui/ui_panel.png
ui/ui_sign.png
ui/ui_slices.json

MY GARDEN — PARCELS AND DAILY CARE
The parcel map uses a fine gravel texture generated once per page load.
Optional override: assets/map/field_tile.png (repeatable square texture).
Optional map decoration: assets/map/butterfly.png (transparent butterfly).
New UI art, extracted from the user-supplied watering sheet:
  assets/ui/icon_watering_can.png
  assets/ui/icon_watering_can_pour.png
  assets/ui/icon_arrow_down.png
  assets/ui/icon_drop.png
  assets/ui/icon_drop_empty.png
  assets/ui/fx_sparkle.png
All six files: 512 x 512 px, transparent PNG. They are cropped to alpha once
in memory for display. Missing files use SVG artwork and produce a console warning.
Optional water sound: assets/audio/sfx_water.mp3; absent files use low-pass
filtered Web Audio noise (0.9 seconds). Existing audio files are unchanged.
Plants scale from their soil anchor by 1.06, 1.12 and 1.18 after watering.
Care uses the separate localStorage key garden-neighbors-watering-v1.
The existing campaign save key, twenty level maps, rules and solver are unchanged.

MY GARDEN AUDIO
assets/audio/music_my_garden.mp3 — user-supplied ambience_garden(1).mp3.
Plays alone, looping, on My Garden; the original music_menu.mp3 remains
on the start screen. Music toggle and volume control this track too.
Opening and closing Settings preserves the current screen audio.

REWARDS AND DAILY GARDEN (2026-10-25)
Optional new UI art: assets/ui/icon_basket.png (256x256 transparent PNG).
A drawn basket is used automatically until this image exists.
Daily generation uses UTC dates and a deterministic candidate sequence.
Only plants from completed campaign gardens are accepted for each player.
DAILY_LAUNCH in index.html is fixed to 2026-10-25 and controls Daily #N.
Stars: finish = 1; no Hint = 2; no Hint and no wilted plants = 3.
Undo does not add penalties; Reset clears wilted plants for that attempt.
Existing campaign stars always keep their best result.
Daily Garden unlocks after completing garden 4.
Decoration totals: bench 10, scarecrow 25, pond 45 stars.
Harvest, optional best times and daily results use separate versioned local saves.
Campaign maps, plant rules and the solver are unchanged.

WAITING PLANTS AND VISIBLE REWARDS (2026-10-25)
Basil without a tomato and peas without a pea remain sprouts in waiting state.
They do not wilt or reduce stars; adding their partner starts normal growth.
Wrong soil and forbidden neighbors still count as wilt errors.
Missing map/deco_bench.png, deco_scarecrow.png and deco_pond.png use cached
canvas illustrations, visible on the My Garden decoration shelf.

CUSTOM FONT — FILES STILL REQUIRED
The game is prepared to load Garden Neighbors Regular and Bold from:
  assets/fonts/GardenNeighbors-Regular.ttf (or .woff2 / .otf)
  assets/fonts/GardenNeighbors-Bold.ttf (or .woff2 / .otf)
These custom font files were not present in the supplied assets or repository.
The included Patrick Hand font remains the fallback until they are supplied.
No font file has been renamed or passed off as the custom font.
