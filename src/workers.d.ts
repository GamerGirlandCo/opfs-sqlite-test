declare module "testthing.worker" {
	const WorkerFactory: new () => Worker;
	export default WorkerFactory;
}
