declare module "sqlite3.worker" {
	const WorkerFactory: new () => Worker;
	export default WorkerFactory;
}

declare module "inline:../node_modules/@btfash/sqlite-wasm/sqlite-wasm/jswasm/sqlite3-opfs-async-proxy.js"
