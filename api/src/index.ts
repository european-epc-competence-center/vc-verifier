import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser'
import * as dotenv from 'dotenv';
import session from 'express-session';

// Augment express-session with a custom SessionData object
declare module "express-session" {
    interface SessionData {
        presentation_requests: any;
    }
}
dotenv.config();


import { verifyRouter, openIdRouter } from './routers/index.js';


// Swagger UI
import expressJSDocSwagger from 'express-jsdoc-swagger';
import swaggerOptions from './swagger.js'


const app = express();


expressJSDocSwagger(app)(swaggerOptions);

app.use(bodyParser.json())
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));


const sessionMiddleware = session({
    secret: "20161116-b81e-11ed-a110-f34ae04490aa",
    resave: false,
    saveUninitialized: false
});

app.use(sessionMiddleware);

app.use('/api/verifier', verifyRouter);
app.use('/api/verifier/openid', openIdRouter);



const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000

const server = app.listen(port, async () => {
    console.log(`Started API Server on port ${port}`);
});