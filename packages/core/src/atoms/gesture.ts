import type { AtomDef } from "../ir.js";

const pressable: AtomDef = {
  kind: "pressable",
  category: "gesture",
  docs: "Invisible press target; fires onPress. Use to make any children clickable.",
  props: {
    onPress: { type: "expr" },
    onLongPress: { type: "expr" },
    disabled: { type: "boolean", default: false },
  },
  children: { allowed: true },
};

const gesture: AtomDef = {
  kind: "gesture",
  category: "gesture",
  docs: "Recognize gestures: swipe, pan, pinch. Fires named handlers.",
  props: {
    onSwipe: { type: "expr" },
    onPan: { type: "expr" },
    onPinch: { type: "expr" },
    direction: { type: { kind: "enum", values: ["left", "right", "up", "down", "any"] }, default: "any" },
  },
  children: { allowed: true },
};

const focusable: AtomDef = {
  kind: "focusable",
  category: "gesture",
  docs: "Makes children keyboard/focus navigable; fires onFocus/onBlur.",
  props: {
    onFocus: { type: "expr" },
    onBlur: { type: "expr" },
    tabIndex: { type: "number", default: 0 },
  },
  children: { allowed: true },
};

const haptic: AtomDef = {
  kind: "haptic",
  category: "gesture",
  docs: "Trigger haptic feedback when triggered.",
  props: {
    on: { type: "expr", required: true, docs: "Event expression that triggers haptic" },
    intensity: { type: { kind: "enum", values: ["light", "medium", "heavy"] }, default: "light" },
  },
  children: { allowed: false },
};

export const GESTURE_ATOMS: AtomDef[] = [pressable, gesture, focusable, haptic];
