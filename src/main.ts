import {
	Notice,
	Plugin,
} from "obsidian";
import TestWorker from "sqlite3.worker";
import { sqlite3Worker1Promiser } from "@sqlite.org/sqlite-wasm";

// Remember to rename these classes and interfaces!



export default class MyPlugin extends Plugin {
	settings: any;
	private worker: Worker;
	private promiser: (...args: any[]) => any;

	async onload() {
		await this.loadSettings();
		console.log(import.meta);

		await this.initSqlite();
		await this.start();
		(window as any).sqlite3Promiser = this.promiser;
	}

	onunload() {
		this.worker.terminate();
	}

	async loadSettings() {
		this.settings = Object.assign({}, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	printNotice(...args: any) {
		console.log(...args);
		new Notice("~LOG~", args.join("\n"));
	}
	locateFile(path: string, prefix: string): string {
		return this.app.vault.adapter.getResourcePath(
			`${this.manifest.dir}/${path}`,
		);
	}

	async initSqlite() {
		this.worker = new TestWorker();
		let w = this.worker;
		this.worker.postMessage({
			type: "init",
			path: this.locateFile("sqlite3.wasm", ""),
		});
		this.promiser = await new Promise<typeof this.promiser>((resolve) => {
			const _promiser = sqlite3Worker1Promiser({
				print: this.printNotice,
				printErr: console.error,
				locateFile: this.locateFile.bind(this),
				onready: () => {
					resolve(_promiser);
				},
				worker: () => w,
			});
		});
	}

	async start() {
		let openRes = await this.promiser("open", {
			filename: "/managed-sah/test.sqlite3",
			vfs: "opfs-sahpool",
		});
		const { dbId } = openRes;
		console.log(openRes);
		try {
			console.log("Creating a table...");
			let res = await this.promiser("exec", {
				dbId,
				sql: "DROP TABLE IF EXISTS abcdef; CREATE TABLE IF NOT EXISTS abcdef(a,b,c)",
				returnValue: "resultRows",
			});
			console.log("Result: ", res);
			console.log("Insert some data using exec()...");
			for (let i = 20; i <= 25; ++i) {
				let innerRes = await this.promiser("exec", {
					dbId,
					sql: "INSERT INTO abcdef(a,b,c) VALUES (?,?,69)",
					bind: [i, i * 2],
					returnValue: "resultRows",
					rowMode: "object",
				});
				console.log(innerRes);
			}
			console.log("Query data with exec()...");
			let rowRes = await this.promiser("exec", {
				dbId,
				sql: "SELECT * FROM abcdef ORDER BY a LIMIT 10",
				returnValue: "resultRows",
				rowMode: "object",
			});
			console.log(rowRes);
		} finally {
			await this.promiser("close", { dbId });
		}
	}
}
