import type { AtomDef } from "../ir.js";

const image: AtomDef = {
  kind: "image",
  category: "media",
  docs: "Raster or vector image.",
  props: {
    src: { type: "string", required: true },
    alt: { type: "string", default: "" },
    width: { type: "any" },
    height: { type: "any" },
    fit: { type: { kind: "enum", values: ["cover", "contain", "fill", "none"] }, default: "cover" },
  },
  children: { allowed: false },
};

const icon: AtomDef = {
  kind: "icon",
  category: "media",
  docs: "Named icon glyph.",
  props: {
    name: { type: "string", required: true },
    size: { type: "any", default: 20 },
    color: { type: "string" },
  },
  children: { allowed: false },
};

const video: AtomDef = {
  kind: "video",
  category: "media",
  docs: "Video playback.",
  props: {
    src: { type: "string", required: true },
    autoplay: { type: "boolean", default: false },
    controls: { type: "boolean", default: true },
    loop: { type: "boolean", default: false },
    muted: { type: "boolean", default: false },
    poster: { type: "string" },
  },
  children: { allowed: false },
};

const audio: AtomDef = {
  kind: "audio",
  category: "media",
  docs: "Audio playback.",
  props: {
    src: { type: "string", required: true },
    autoplay: { type: "boolean", default: false },
    controls: { type: "boolean", default: true },
    loop: { type: "boolean", default: false },
  },
  children: { allowed: false },
};

const canvas: AtomDef = {
  kind: "canvas",
  category: "media",
  docs: "Raw 2D/3D drawing surface; used for charts, games, custom graphics.",
  props: {
    width: { type: "any" },
    height: { type: "any" },
    draw: { type: "expr", docs: "Draw callback expression" },
  },
  children: { allowed: false },
};

const webview: AtomDef = {
  kind: "webview",
  category: "media",
  docs: "Embedded web content.",
  props: { src: { type: "string", required: true } },
  children: { allowed: false },
};

const lottie: AtomDef = {
  kind: "lottie",
  category: "media",
  docs: "Lottie/Bodymovin animation.",
  props: {
    src: { type: "string", required: true },
    autoplay: { type: "boolean", default: true },
    loop: { type: "boolean", default: true },
  },
  children: { allowed: false },
};

export const MEDIA_ATOMS: AtomDef[] = [image, icon, video, audio, canvas, webview, lottie];
