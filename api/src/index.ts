import app from './app.js';

const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000


const server = app.listen(port, async () => {
    console.log(`Started API Server on port ${port}`);
});


export default server;