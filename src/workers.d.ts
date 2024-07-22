declare module "sqlite3.worker" {
	const WorkerFactory: new () => Worker;
	export default WorkerFactory;
}
