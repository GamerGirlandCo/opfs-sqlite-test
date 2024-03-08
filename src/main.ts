import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";
import TestWorker from "testthing.worker"
import sqlite3InitModule, { Sqlite3Static } from "@sqlite.org/sqlite-wasm";
import {sqlite3Worker1Promiser} from "@sqlite.org/sqlite-wasm"

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: "default",
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;
	private worker: Worker;
	private promiser: (...args: any[]) => any;

	async onload() {
		await this.loadSettings();
		console.log(import.meta)

		// This creates an icon in the left ribbon.
		await this.initSqlite();
	}

	onunload() {
		this.worker.terminate()
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	printNotice(...args: any) {
		console.log(...args);
		new Notice("~LOG~", args.join("\n"));
	}
	locateFile(path: string, prefix: string): string {
			return this.app.vault.adapter.getResourcePath(`${this.manifest.dir}/${path}`)
	}

	async initSqlite() {
		this.worker = new TestWorker();
		let w = this.worker;
		this.worker.postMessage({type: "init", path: this.locateFile("sqlite3.wasm", "")})
		this.promiser = await new Promise<typeof this.promiser>((resolve) => {
      const _promiser = sqlite3Worker1Promiser({
				print: this.printNotice,
				printErr: console.error,
				locateFile: this.locateFile.bind(this),
        onready: () => {
          resolve(_promiser);
        },
				worker: () => w
      });
    });
		await this.start()
	}

	async start() {
		let openRes = await this.promiser("open", {
			filename: "/test.sqlite2",
			vfs: "opfs-sahpool",
			
		})
		const {dbId} = openRes
		console.log(openRes)
		try {
			console.log("Creating a table...")
			let res = await this.promiser("exec", {
				dbId,
				sql: "DROP TABLE IF EXISTS abcdef; CREATE TABLE IF NOT EXISTS abcdef(a,b,c)",
						returnValue: "resultRows"
			})
			console.log("Result: ", res)
			console.log("Insert some data using exec()...");
			for (let i = 20; i <= 25; ++i) {
					let innerRes = await this.promiser("exec", {
						dbId,
						sql: "INSERT INTO abcdef(a,b,c) VALUES (?,?,69)",
						bind: [i, i * 2],
						returnValue: "resultRows",
						rowMode: "object"
					});
					console.log(innerRes)
				}
				console.log("Query data with exec()...");
				let rowRes = await this.promiser("exec", {
					dbId,
					sql: "SELECT * FROM abcdef ORDER BY a LIMIT 10",
					returnValue: "resultRows",
						rowMode: "object"
				})
				console.log(rowRes)

			} finally {
				await this.promiser("close", {dbId})
			}
		// db = new sqlite3.oo1.DB("/test.sqlite3", "ct");
		/* if (db) {
			try {
				console.log("Creating a table...");
				db.exec();
				console.log("Insert some data using exec()...");
				for (let i = 20; i <= 25; ++i) {
					db.exec({
						sql: "INSERT INTO t(a,b) VALUES (?,?)",
						bind: [i, i * 2],
					});
				}
				db.exec();
			} finally {
				db.close();
			}
		} */
	}
}
