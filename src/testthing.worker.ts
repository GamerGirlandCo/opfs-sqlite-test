import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
(async () => {})();
let sqlite3;
onmessage = async (event) => {
	console.log(event);
	if (event.data.type == "init") {
		sqlite3 = await sqlite3InitModule({
			locateFile: (path, prefix) => event.data.path,
		});
		// debugger;
		console.log(`Running sqlite version: ${sqlite3.version.libVersion}`);
		await sqlite3.installOpfsSAHPoolVfs({
			clearOnInit: false,
			initialCapacity: 65536,
		});
		sqlite3.initWorker1API();
		console.log(sqlite3.capi.sqlite3_vfs_find("opfs"));
	}
};
