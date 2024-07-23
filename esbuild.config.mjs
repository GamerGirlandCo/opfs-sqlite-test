import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import { TsconfigPathsPlugin } from "@esbuild-plugins/tsconfig-paths";
import inlineWorkerPlugin from "esbuild-plugin-inline-worker";
import inlineImportPlugin from "esbuild-plugin-inline-import";
import fs from "fs";
const external = [
	"obsidian",
	"electron",
	"@codemirror/autocomplete",
	"@codemirror/collab",
	"@codemirror/commands",
	"@codemirror/language",
	"@codemirror/lint",
	"@codemirror/search",
	"@codemirror/state",
	"@codemirror/view",
	"@lezer/common",
	"@lezer/highlight",
	"@lezer/lr",
	"pdfjs-dist",
	"path",
	"url",
	"electron",
	...builtins,
];
async function build(prod) {
	fs.mkdirSync("build/plugin", { recursive: true });

	const result = await esbuild
		.build({
			plugins: [
				TsconfigPathsPlugin({}),
				inlineImportPlugin(),
				inlineWorkerPlugin({
					plugins: [TsconfigPathsPlugin({}), inlineImportPlugin()],
					external,
					target: "es2020",
					format: "cjs",
					sourcemap: prod ? false : "inline",
					banner: {
						js: "",
					},
					define: {
						"import.meta.url": "globalThis.__importMetaUrl",
					},
				}),
			],
			entryPoints: ["src/main.ts"],
			bundle: true,
			external,
			format: "cjs",
			target: "es2020",
			logLevel: "info",
			sourcemap: prod ? false : "inline",
			treeShaking: true,
			outfile: "build/plugin/main.js",	
		})
		.catch(() => process.exit(1));

	// Copy the manifest and styles.
	fs.copyFileSync("manifest.json", "build/plugin/manifest.json");
	fs.copyFileSync("src/styles.css", "build/plugin/styles.css");
	fs.copyFileSync(
		"node_modules/@btfash/sqlite-wasm/sqlite-wasm/jswasm/sqlite3.wasm",
		"build/plugin/sqlite3.wasm"
	);
		// fs.writeFileSync("build/meta.json", JSON.stringify(result.metafile));
}

// Run the build.
build(process.argv[2] === "production");
