// https://dev.to/silvenleaf/how-to-create-a-typescript-project-with-expressjs-the-simplest-way-578a

import express, { Request, Response } from 'express';
import * as http from 'http';
//import setupWebsocket from './wss'
// setupWebSocket.js

// https://www.kindacode.com/article/node-js-using-__dirname-and-__filename-with-es-modules/
//import { fileURLToPath } from 'url'
//import { dirname } from 'path'
//const __filename = fileURLToPath(import.meta.url)
//const __dirname = dirname(__filename)


import * as path from 'path';

// Might look at this for sharing code if it feels useful: https://stackoverflow.com/questions/59571680/react-backend-project-structure-when-sharing-code
//import { CommentStore, MemoryCommentStore } from '../../shared/src/Comments'
import { CommentStore, TrackComment, TestClass, MemoryCommentStore,TrackDef } from 'shared'
import setupWebsocket from './WebsocketCommentBackend'

const t : TrackDef = {url:""}
const tc: TrackComment = {id:1, user:"Jim",start:0,text:""}
const tt = new TestClass()

const store : CommentStore = new MemoryCommentStore()
console.log("Store: ", store)

// -------------------firing express app
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname, '../../static-audio-client/build')));


// -------------------routes
app.get('/home', (request: Request, response: Response)=>{
  console.log(request.url)
  response.json({ message: `Welcome to the home page!!!!` })
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../static-audio-client/build', 'index.html'));
});



// --------------------Listen
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, ()=>{
  console.log(`Server running on PORT ${ PORT }`);
})
setupWebsocket(server,store)