import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser'
import * as dotenv from 'dotenv';
import nunjucks from 'nunjucks';
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

// use static routes for css
app.use('/css', express.static('public/css'));
app.use('/img', express.static('public/img'));
app.use('/js', express.static('public/js'));

// configure nunjucks for UI
nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: true
})


// public verify router
app.use('/api/verify', verifyRouter);



const port = process.env.PORT ? Number.parseInt(process.env.PORT) : 3000

const server = app.listen(port, async () => {
    console.log(`Started API Server on port ${port}`);
});