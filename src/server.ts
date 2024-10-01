import { AutoRouter } from 'itty-router';
import { mainRouter } from './controllers';

const router = AutoRouter();

// wave
router.get('/', (_, env) => {
    return new Response(`Hello, this is ${env.DISCORD_APPLICATION_ID}`);
});

router.post('/', mainRouter);

router.all('*', () => new Response('Not Found', { status: 404 }));

const server = {
    fetch: router.fetch,
};

export default server;