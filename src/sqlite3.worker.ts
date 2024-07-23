import sqlite3InitModule from "@btfash/sqlite-wasm/sqlite-wasm/jswasm/sqlite3.mjs";
import str from "inline:../node_modules/@btfash/sqlite-wasm/sqlite-wasm/jswasm/sqlite3-opfs-async-proxy.js"
global.__importMetaUrl = ""
let sqlite3;
globalThis
let inited = false;
onmessage = async (event) => {
	console.log(event);
	if (event.data.type == "init" && !inited) {
		globalThis.__importMetaUrl = event.data.root
		sqlite3 = await sqlite3InitModule({
			locateFile: (path: string, prefix: string) => event.data.path,
		});
		// debugger;
		console.log(`Running sqlite version: ${sqlite3.version.libVersion}`);
		await sqlite3.installOpfsVfs({
			proxyUri: URL.createObjectURL(new Blob([str], {type: "application/javascript"}))
		});
		sqlite3.initWorker1API();
		console.log(sqlite3.capi.sqlite3_vfs_find("opfs"));
	}
};
