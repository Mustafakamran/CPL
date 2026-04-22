import type { Adapter, Emitter, IRNode, FileMap, PropValue } from "@cpl/core";

function str(v: PropValue, fallback = ""): string {
  if (v === undefined || v === null) return fallback;
  return String(v);
}

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\n/g, "\\n");
}

async function emitChildren(ctx: Parameters<Emitter>[1], node: IRNode): Promise<string> {
  return ctx.emitChildren(node.children);
}

type ComposeEmit = (node: IRNode, ctx: Parameters<Emitter>[1]) => Promise<string>;

const emitters: Record<string, ComposeEmit> = {
  // Layout
  async box(n, c) { return `Box { ${await emitChildren(c, n)} }`; },
  async stack(n, c) {
    const axis = str(n.props.axis, "vertical");
    return `${axis === "horizontal" ? "Row" : "Column"} { ${await emitChildren(c, n)} }`;
  },
  async row(n, c) { return `Row { ${await emitChildren(c, n)} }`; },
  async column(n, c) { return `Column { ${await emitChildren(c, n)} }`; },
  async grid(n, c) { return `LazyVerticalGrid(columns = GridCells.Fixed(${str(n.props.columns, "1")})) { item { ${await emitChildren(c, n)} } }`; },
  async flex(n, c) { return `Row { ${await emitChildren(c, n)} }`; },
  async spacer() { return `Spacer(modifier = Modifier.size(8.dp))`; },
  async divider() { return `HorizontalDivider()`; },
  async "scroll-view"(n, c) { return `Column(modifier = Modifier.verticalScroll(rememberScrollState())) { ${await emitChildren(c, n)} }`; },
  async "safe-area"(n, c) { return `Surface { ${await emitChildren(c, n)} }`; },
  async sticky(n, c) { return `/* sticky: ${str(n.props.edge, "top")} */ Column { ${await emitChildren(c, n)} }`; },
  async center(n, c) { return `Box(contentAlignment = Alignment.Center) { ${await emitChildren(c, n)} }`; },
  async aspect(n, c) { return `Box(modifier = Modifier.aspectRatio(${str(n.props.ratio, "1")}f)) { ${await emitChildren(c, n)} }`; },
  async portal(n, c) { return `Box { ${await emitChildren(c, n)} }`; },

  // Text
  async text(n) { return `Text(text = "${esc(str(n.props.value))}")`; },
  async heading(n) { return `Text(text = "${esc(str(n.props.value))}", style = MaterialTheme.typography.headlineMedium)`; },
  async paragraph(n) { return `Text(text = "${esc(str(n.props.value))}", style = MaterialTheme.typography.bodyMedium)`; },
  async label(n) { return `Text(text = "${esc(str(n.props.value))}", style = MaterialTheme.typography.labelMedium)`; },
  async code(n) { return `Text(text = "${esc(str(n.props.value))}", fontFamily = FontFamily.Monospace)`; },
  async markdown(n) { return `Text(text = "${esc(str(n.props.value))}") /* TODO: markdown render */`; },

  // Media
  async image(n) { return `AsyncImage(model = "${esc(str(n.props.src))}", contentDescription = "${esc(str(n.props.alt))}")`; },
  async icon(n) { return `Icon(imageVector = Icons.Default.Circle, contentDescription = "${esc(str(n.props.name))}")`; },
  async video(n) { return `/* video: ${esc(str(n.props.src))} — TODO ExoPlayer */ Text("[video]")`; },
  async audio(n) { return `/* audio: ${esc(str(n.props.src))} — TODO MediaPlayer */ Text("[audio]")`; },
  async canvas(n) { return `Canvas(modifier = Modifier.size(${str(n.props.width, "300")}.dp, ${str(n.props.height, "150")}.dp)) { /* draw */ }`; },
  async webview(n) { return `AndroidView(factory = { ctx -> android.webkit.WebView(ctx).apply { loadUrl("${esc(str(n.props.src))}") } })`; },
  async lottie(n) { return `/* lottie: ${esc(str(n.props.src))} — TODO */ Box {}`; },

  // Input
  async "text-input"(n) { return `var v by remember { mutableStateOf("") }; OutlinedTextField(value = v, onValueChange = { v = it }, label = { Text("${esc(str(n.props.placeholder))}") })`; },
  async "number-input"(n) { return `var v by remember { mutableStateOf("") }; OutlinedTextField(value = v, onValueChange = { v = it }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number))`; },
  async checkbox() { return `var c by remember { mutableStateOf(false) }; Checkbox(checked = c, onCheckedChange = { c = it })`; },
  async radio() { return `var s by remember { mutableStateOf(false) }; RadioButton(selected = s, onClick = { s = true })`; },
  async switch() { return `var s by remember { mutableStateOf(false) }; Switch(checked = s, onCheckedChange = { s = it })`; },
  async slider(n) { return `var v by remember { mutableFloatStateOf(${str(n.props.min, "0")}f) }; Slider(value = v, onValueChange = { v = it }, valueRange = ${str(n.props.min, "0")}f..${str(n.props.max, "100")}f)`; },
  async select(n) { return `/* select options */ var exp by remember { mutableStateOf(false) }; Box { Text("Select", modifier = Modifier.clickable { exp = true }); DropdownMenu(expanded = exp, onDismissRequest = { exp = false }) {} }`; },
  async textarea(n) { return `var v by remember { mutableStateOf("") }; OutlinedTextField(value = v, onValueChange = { v = it }, minLines = ${str(n.props.rows, "3")})`; },
  async "file-input"() { return `/* file-input — TODO ActivityResultLauncher */ Button(onClick = {}) { Text("Pick file") }`; },
  async "date-input"() { return `/* date-input — TODO DatePicker */ Button(onClick = {}) { Text("Pick date") }`; },
  async "color-input"() { return `/* color-input — TODO color picker lib */ Button(onClick = {}) { Text("Pick color") }`; },
  async "range-input"(n) { return `var r by remember { mutableStateOf(${str(n.props.min, "0")}f..${str(n.props.max, "100")}f) }; RangeSlider(value = r, onValueChange = { r = it })`; },

  // Action
  async button(n, c) {
    const label = n.props.label ? `"${esc(str(n.props.label))}"` : null;
    const kids = await emitChildren(c, n);
    return `Button(onClick = { /* onClick */ }) { ${label ? `Text(${label})` : kids || "Text(\"Button\")"} }`;
  },
  async link(n, c) {
    const label = n.props.label ? `"${esc(str(n.props.label))}"` : null;
    return `Text(text = ${label ?? `"${esc(str(n.props.href))}"`}, color = MaterialTheme.colorScheme.primary, modifier = Modifier.clickable { /* navigate to ${esc(str(n.props.href))} */ })`;
  },

  // Structural
  async app(n, c) { return `MaterialTheme { Surface { ${await emitChildren(c, n)} } }`; },
  async page(n, c) { return `Scaffold { paddingValues -> Column(Modifier.padding(paddingValues)) { ${await emitChildren(c, n)} } }`; },
  async route(n, c) { return `/* route ${esc(str(n.props.path))} */ ${await emitChildren(c, n)}`; },
  async router(n, c) { return `NavHost(rememberNavController(), startDestination = "home") { ${await emitChildren(c, n)} }`; },

  // Logic
  async when(n, c) { return `if (/* ${esc(str(n.props.cond))} */ true) { ${await emitChildren(c, n)} }`; },
  async repeat(n, c) { return `for (item in listOf<Any>()) { ${await emitChildren(c, n)} } /* source: ${esc(str(n.props.source))} */`; },
  async match(n, c) { return `when (/* ${esc(str(n.props.value))} */ Unit) { else -> { ${await emitChildren(c, n)} } }`; },
  async bind() { return ""; },
  async state(n, c) { return `var ${str(n.props.name)} by remember { mutableStateOf<Any?>(null) }; ${await emitChildren(c, n)}`; },
  async action(n) { return `val ${str(n.props.name)} = { /* body */ }`; },
  async effect(n) { return `LaunchedEffect(Unit) { /* ${esc(str(n.props.body))} */ }`; },
  async derive(n) { return `val ${str(n.props.name)} = remember { /* ${esc(str(n.props.from))} */ }`; },

  // Style
  async theme(n, c) { return `MaterialTheme { ${await emitChildren(c, n)} }`; },
  async style(n, c) { return await emitChildren(c, n); },

  // Gesture
  async pressable(n, c) { return `Box(modifier = Modifier.clickable { /* onPress */ }) { ${await emitChildren(c, n)} }`; },
  async gesture(n, c) { return `Box(modifier = Modifier.pointerInput(Unit) { /* gestures */ }) { ${await emitChildren(c, n)} }`; },
  async focusable(n, c) { return `Box(modifier = Modifier.focusable()) { ${await emitChildren(c, n)} }`; },
  async haptic() { return `LocalHapticFeedback.current.performHapticFeedback(HapticFeedbackType.LongPress)`; },

  // Escape
  async native(n) {
    const code = n.props.code;
    if (code && typeof code === "object" && !Array.isArray(code)) {
      const v = (code as Record<string, PropValue>).compose;
      if (typeof v === "string") return v;
    }
    return "/* native: no compose impl */";
  },
};

const overrideEmitters: Record<string, ComposeEmit> = {
  "floating-action-button": async (n) => {
    const label = str(n.props.label, "Action");
    return `FloatingActionButton(onClick = { /* onClick */ }) { Text("${esc(label)}") }`;
  },
  "action-sheet": async (n, c) => {
    return `ModalBottomSheet(onDismissRequest = { /* close */ }) { ${await emitChildren(c, n)} }`;
  },
};

function scaffoldFiles(name: string): FileMap {
  const pkg = `com.cpl.${name.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
  return {
    "settings.gradle.kts": `rootProject.name = "${name}"
include(":app")
`,
    "build.gradle.kts": `plugins {
    id("com.android.application") version "8.5.0" apply false
    id("org.jetbrains.kotlin.android") version "2.0.0" apply false
}
`,
    "app/build.gradle.kts": `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "${pkg}"
    compileSdk = 34
    defaultConfig {
        applicationId = "${pkg}"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "0.0.0"
    }
    buildFeatures { compose = true }
    composeOptions { kotlinCompilerExtensionVersion = "1.5.15" }
    kotlinOptions { jvmTarget = "17" }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.0")
    implementation("androidx.activity:activity-compose:1.9.0")
    implementation(platform("androidx.compose:compose-bom:2024.09.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("io.coil-kt:coil-compose:2.6.0")
}
`,
    [`app/src/main/java/${pkg.replace(/\./g, "/")}/MainActivity.kt`]: `package ${pkg}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Circle
import androidx.compose.runtime.*
import androidx.compose.ui.*
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            App()
        }
    }
}

@Composable
fun App() {
    __CPL_EMITTED_NODES__
}
`,
    "app/src/main/AndroidManifest.xml": `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <application android:label="${name}" android:theme="@style/Theme.Material3.DayNight">
    <activity android:name=".MainActivity" android:exported="true">
      <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
      </intent-filter>
    </activity>
  </application>
</manifest>
`,
  };
}

const composeAdapter: Adapter = {
  id: "compose",
  supportedTargets: ["android"],
  async scaffold({ project }) { return scaffoldFiles(project.name); },
  async emitAtom(node, ctx) {
    const e = emitters[node.kind];
    if (!e) return { files: {}, snippet: `/* no compose emitter for ${node.kind} */` };
    return { files: {}, snippet: await e(node, ctx) };
  },
  overrideFor(kind) {
    const e = overrideEmitters[kind];
    if (!e) return undefined;
    return async (node, ctx) => ({ files: {}, snippet: await e(node, ctx) });
  },
};

export default composeAdapter;
