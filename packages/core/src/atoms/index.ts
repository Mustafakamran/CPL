import type { AtomDef } from "../ir.js";
import { LAYOUT_ATOMS } from "./layout.js";
import { TEXT_ATOMS } from "./text.js";
import { MEDIA_ATOMS } from "./media.js";
import { INPUT_ATOMS } from "./input.js";
import { ACTION_ATOMS } from "./action.js";
import { STRUCTURAL_ATOMS } from "./structural.js";
import { LOGIC_ATOMS } from "./logic.js";
import { STYLE_ATOMS } from "./style.js";
import { GESTURE_ATOMS } from "./gesture.js";
import { ESCAPE_ATOMS } from "./escape.js";

export const ALL_ATOMS: AtomDef[] = [
  ...LAYOUT_ATOMS,
  ...TEXT_ATOMS,
  ...MEDIA_ATOMS,
  ...INPUT_ATOMS,
  ...ACTION_ATOMS,
  ...STRUCTURAL_ATOMS,
  ...LOGIC_ATOMS,
  ...STYLE_ATOMS,
  ...GESTURE_ATOMS,
  ...ESCAPE_ATOMS,
];

export function loadAtoms(): AtomDef[] {
  return ALL_ATOMS;
}
