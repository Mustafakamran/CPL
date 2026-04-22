import type { Adapter, Emitter, IRNode, FileMap, PropValue } from "@glyph/core";

function str(v: PropValue, fallback = ""): string {
  if (v === undefined || v === null) return fallback;
  return String(v);
}

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n");
}

async function emitChildren(ctx: Parameters<Emitter>[1], node: IRNode): Promise<string> {
  return ctx.emitChildren(node.children);
}

type FlutterEmit = (node: IRNode, ctx: Parameters<Emitter>[1]) => Promise<string>;

const emitters: Record<string, FlutterEmit> = {
  async box(n, c) { return `Container(child: Column(children: [${await emitChildren(c, n)}]))`; },
  async stack(n, c) {
    const axis = str(n.props.axis, "vertical");
    return axis === "horizontal"
      ? `Row(children: [${await emitChildren(c, n)}])`
      : `Column(children: [${await emitChildren(c, n)}])`;
  },
  async row(n, c) { return `Row(children: [${await emitChildren(c, n)}])`; },
  async column(n, c) { return `Column(children: [${await emitChildren(c, n)}])`; },
  async grid(n, c) { return `GridView.count(crossAxisCount: ${str(n.props.columns, "1")}, children: [${await emitChildren(c, n)}])`; },
  async flex(n, c) { return `Flex(direction: Axis.${str(n.props.direction, "horizontal")}, children: [${await emitChildren(c, n)}])`; },
  async spacer() { return `const SizedBox(height: 8, width: 8)`; },
  async divider() { return `const Divider()`; },
  async "scroll-view"(n, c) { return `SingleChildScrollView(child: Column(children: [${await emitChildren(c, n)}]))`; },
  async "safe-area"(n, c) { return `SafeArea(child: Column(children: [${await emitChildren(c, n)}]))`; },
  async sticky(n, c) { return `/* sticky */ Column(children: [${await emitChildren(c, n)}])`; },
  async center(n, c) { return `Center(child: Column(children: [${await emitChildren(c, n)}]))`; },
  async aspect(n, c) { return `AspectRatio(aspectRatio: ${str(n.props.ratio, "1")}, child: Column(children: [${await emitChildren(c, n)}]))`; },
  async portal(n, c) { return `Column(children: [${await emitChildren(c, n)}])`; },

  async text(n) { return `Text('${esc(str(n.props.value))}')`; },
  async heading(n) { return `Text('${esc(str(n.props.value))}', style: Theme.of(context).textTheme.headlineMedium)`; },
  async paragraph(n) { return `Text('${esc(str(n.props.value))}')`; },
  async label(n) { return `Text('${esc(str(n.props.value))}', style: Theme.of(context).textTheme.labelMedium)`; },
  async code(n) { return `Text('${esc(str(n.props.value))}', style: const TextStyle(fontFamily: 'monospace'))`; },
  async markdown(n) { return `Text('${esc(str(n.props.value))}') /* TODO markdown */`; },

  async image(n) { return `Image.network('${esc(str(n.props.src))}', semanticLabel: '${esc(str(n.props.alt))}')`; },
  async icon(n) { return `const Icon(Icons.circle, semanticLabel: '${esc(str(n.props.name))}')`; },
  async video(n) { return `/* video ${esc(str(n.props.src))} */ const Text('[video]')`; },
  async audio(n) { return `/* audio ${esc(str(n.props.src))} */ const Text('[audio]')`; },
  async canvas() { return `CustomPaint(size: const Size(300, 150), painter: _CplNoopPainter())`; },
  async webview(n) { return `/* webview ${esc(str(n.props.src))} */ const Text('[webview]')`; },
  async lottie() { return `/* lottie */ const SizedBox.shrink()`; },

  async "text-input"(n) { return `TextField(decoration: InputDecoration(hintText: '${esc(str(n.props.placeholder))}'))`; },
  async "number-input"() { return `TextField(keyboardType: TextInputType.number)`; },
  async checkbox() { return `Checkbox(value: false, onChanged: (_) {})`; },
  async radio() { return `Radio<String>(value: '', groupValue: null, onChanged: (_) {})`; },
  async switch() { return `Switch(value: false, onChanged: (_) {})`; },
  async slider(n) { return `Slider(value: ${str(n.props.min, "0")}, min: ${str(n.props.min, "0")}, max: ${str(n.props.max, "100")}, onChanged: (_) {})`; },
  async select(n) { return `DropdownButton<String>(items: const [], onChanged: (_) {})`; },
  async textarea(n) { return `TextField(maxLines: ${str(n.props.rows, "3")})`; },
  async "file-input"() { return `/* file-input — TODO file_picker */ const Text('[file]')`; },
  async "date-input"() { return `/* date-input — TODO showDatePicker */ const Text('[date]')`; },
  async "color-input"() { return `/* color-input — TODO */ const Text('[color]')`; },
  async "range-input"(n) { return `RangeSlider(values: RangeValues(${str(n.props.min, "0")}, ${str(n.props.max, "100")}), min: ${str(n.props.min, "0")}, max: ${str(n.props.max, "100")}, onChanged: (_) {})`; },

  async button(n, c) {
    const label = n.props.label ? `'${esc(str(n.props.label))}'` : null;
    const kids = await emitChildren(c, n);
    return `ElevatedButton(onPressed: () {}, child: ${label ? `Text(${label})` : kids || "const Text('Button')"})`;
  },
  async link(n) {
    const label = n.props.label ? esc(str(n.props.label)) : esc(str(n.props.href));
    return `InkWell(onTap: () {}, child: Text('${label}', style: const TextStyle(color: Colors.blue, decoration: TextDecoration.underline)))`;
  },

  async app(n, c) { return `MaterialApp(home: Scaffold(body: Column(children: [${await emitChildren(c, n)}])))`; },
  async page(n, c) { return `Scaffold(appBar: AppBar(title: const Text('${esc(str(n.props.title))}')), body: Column(children: [${await emitChildren(c, n)}]))`; },
  async route(n, c) { return `/* route ${esc(str(n.props.path))} */ Column(children: [${await emitChildren(c, n)}])`; },
  async router(n, c) { return `Navigator(pages: [${await emitChildren(c, n)}], onPopPage: (_, __) => true)`; },

  async when(n, c) { return `if (true) Column(children: [${await emitChildren(c, n)}])`; },
  async repeat(n, c) { return `...[].map<Widget>((item) => Column(children: [${await emitChildren(c, n)}])).toList()`; },
  async match(n, c) { return `Column(children: [${await emitChildren(c, n)}])`; },
  async bind() { return ""; },
  async state(n, c) { return `Builder(builder: (context) { dynamic ${str(n.props.name)}; return Column(children: [${await emitChildren(c, n)}]); })`; },
  async action(n) { return `/* action ${esc(str(n.props.name))} */`; },
  async effect() { return `/* effect */`; },
  async derive(n) { return `/* derive ${esc(str(n.props.name))} */`; },

  async theme(n, c) { return `Theme(data: ThemeData(), child: Column(children: [${await emitChildren(c, n)}]))`; },
  async style(n, c) { return `Column(children: [${await emitChildren(c, n)}])`; },

  async pressable(n, c) { return `InkWell(onTap: () {}, child: Column(children: [${await emitChildren(c, n)}]))`; },
  async gesture(n, c) { return `GestureDetector(child: Column(children: [${await emitChildren(c, n)}]))`; },
  async focusable(n, c) { return `Focus(child: Column(children: [${await emitChildren(c, n)}]))`; },
  async haptic() { return `HapticFeedback.lightImpact()`; },

  async native(n) {
    const code = n.props.code;
    if (code && typeof code === "object" && !Array.isArray(code)) {
      const v = (code as Record<string, PropValue>).flutter;
      if (typeof v === "string") return v;
    }
    return `/* native: no flutter impl */`;
  },
};

function scaffoldFiles(name: string): FileMap {
  return {
    "pubspec.yaml": `name: ${name.toLowerCase().replace(/[^a-z0-9_]/g, "_")}
description: Generated by Glyph
publish_to: "none"
version: 0.0.0

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter

flutter:
  uses-material-design: true
`,
    "lib/main.dart": `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

void main() => runApp(const CplApp());

class _CplNoopPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {}
  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}

class CplApp extends StatelessWidget {
  const CplApp({super.key});
  @override
  Widget build(BuildContext context) {
    return __GLYPH_EMITTED_NODES__;
  }
}
`,
  };
}

const flutterAdapter: Adapter = {
  id: "flutter",
  supportedTargets: ["android", "desktop-mac", "desktop-win", "desktop-linux", "web"],
  async scaffold({ project }) { return scaffoldFiles(project.name); },
  async emitAtom(node, ctx) {
    const e = emitters[node.kind];
    if (!e) return { files: {}, snippet: `/* no flutter emitter for ${node.kind} */` };
    return { files: {}, snippet: await e(node, ctx) };
  },
};

export default flutterAdapter;
