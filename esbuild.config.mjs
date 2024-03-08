import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import inlineWorkerPlugin from "esbuild-plugin-inline-worker";
import fs from "fs";

async function build(prod) {
	fs.mkdirSync("build/plugin", { recursive: true });

	const result = await esbuild
		.build({
			plugins: [
				inlineWorkerPlugin({
					alias: {
						"@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/sqlite3-worker1-bundler-friendly":
							"node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/sqlite3-worker1-bundler-friendly.mjs",
					},
					target: "es2020",
					format: "cjs",
			sourcemap: prod ? false : "inline",
				}),
			],
			entryPoints: ["src/main.ts"],
			bundle: true,
			external: [
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
				...builtins,
			],
			format: "cjs",
			target: "es2020",
			logLevel: "info",
			sourcemap: prod ? false : "inline",
			treeShaking: true,
			outfile: "build/plugin/main.js",
			alias: {
				"@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/sqlite3-worker1-bundler-friendly":
					"node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/sqlite3-worker1-bundler-friendly.mjs",
			},
		})
		.catch(() => process.exit(1));

	// Copy the manifest and styles.
	fs.copyFileSync("manifest.json", "build/plugin/manifest.json");
	fs.copyFileSync("src/styles.css", "build/plugin/styles.css");
	fs.copyFileSync(
		"node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/sqlite3.wasm",
		"build/plugin/sqlite3.wasm"
	);
	// fs.writeFileSync("build/meta.json", JSON.stringify(result.metafile));
}

// Run the build.
build(process.argv[2] === "production");
