import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser'
import * as dotenv from 'dotenv';
dotenv.config();


import { verifyRouter } from './routers/index.js';


// Swagger UI
import expressJSDocSwagger from 'express-jsdoc-swagger';
import swaggerOptions from './swagger.js'


const app = express();


expressJSDocSwagger(app)(swaggerOptions);

app.use(bodyParser.json())
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));


// public verify router
app.use('/api/verifier', verifyRouter);



const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000


const server = app.listen(port, async () => {
    console.log(`Started API Server on port ${port}`);
});


export default server;