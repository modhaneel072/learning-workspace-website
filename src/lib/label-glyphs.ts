/**
 * Atkinson Hyperlegible Next outlines (SIL Open Font License 1.1) for the few characters used as
 * axis labels in the static 3D figure. An <img> SVG cannot use the page web font, so the labels
 * are drawn as paths to match the rest of the page. Units: 1/upm em, y down, baseline at 0.
 * Generated with fontTools from Google Fonts subsets (weight 400 for ticks, 600 for axis names).
 */
type Glyph = { d: string; adv: number };

export const LABEL_FONT_UPM = 1000;

export const TICK_GLYPHS: Record<string, Glyph> = {
  "0": {
    "d": "M324 12Q238 12 179 -28Q120 -68 90 -145.5Q60 -223 60 -335Q60 -447 90 -524.5Q120 -602 179 -642Q238 -682 324 -682Q410 -682 469 -642Q528 -602 558 -524.5Q588 -447 588 -335Q588 -223 558 -145.5Q528 -68 469 -28Q410 12 324 12ZM324 -62Q363 -62 392.5 -76Q422 -90 443 -116L176 -501Q163 -469 157 -427Q151 -385 151 -335Q151 -248 169.5 -187Q188 -126 226.5 -94Q265 -62 324 -62ZM211 -561 476 -180Q487 -212 492 -250.5Q497 -289 497 -335Q497 -401 486.5 -451.5Q476 -502 454.5 -537Q433 -572 400.5 -590Q368 -608 324 -608Q288 -608 260 -596Q232 -584 211 -561Z",
    "adv": 648
  },
  "1": {
    "d": "M213 0V-504H35V-571Q83 -571 124.5 -578Q166 -585 196.5 -606Q227 -627 241 -668H297V0Z",
    "adv": 407
  },
  "2": {
    "d": "M29 0V-78Q117 -143 186.5 -199.5Q256 -256 304 -307Q352 -358 377 -404Q402 -450 402 -494Q402 -546 369.5 -578Q337 -610 278 -610Q231 -610 190.5 -584.5Q150 -559 138 -498L54 -522Q72 -595 132 -637.5Q192 -680 280 -680Q342 -680 390 -659Q438 -638 465.5 -597Q493 -556 493 -496Q493 -437 465 -383Q437 -329 388 -278.5Q339 -228 275.5 -179Q212 -130 142 -80H510V0Z",
    "adv": 548
  },
  "−": {
    "d": "M55 -209V-288H551V-209Z",
    "adv": 606
  }
};

export const AXIS_GLYPHS: Record<string, Glyph> = {
  "x": {
    "d": "M10 0 193 -257 22 -496H159L261 -353L362 -496H499L329 -257L512 0H375L261 -161L147 0Z",
    "adv": 522
  },
  "y": {
    "d": "M60 162V68H98Q128 68 144.5 64.5Q161 61 171.5 49Q182 37 190 13L195 -1L10 -496H142L252 -156L357 -496H489L306 10Q290 54 274 83.5Q258 113 237.5 130Q217 147 187 154.5Q157 162 113 162Z",
    "adv": 499
  },
  "z": {
    "d": "M34 0V-100L301 -396H46V-496H455V-396L188 -100H467V0Z",
    "adv": 492
  }
};
