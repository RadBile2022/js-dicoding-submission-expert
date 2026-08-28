import ThreadsHandler from './handler.js';
import createThreadsRouter from './routes.js';
const threads = (container) => createThreadsRouter(new ThreadsHandler(container));
export default threads;
