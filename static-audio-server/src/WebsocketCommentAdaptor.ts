import { WebSocket } from "ws";
//import express, { Request, Response } from 'express';
import * as http from 'http';

import { CommentList, CommentStore } from "shared";

// accepts an http server (covered later)
export default function setupWebSocket(server:http.Server,comments:CommentStore) {
    // ws instance
    const wss = new WebSocket.Server({ noServer: true, path: "/ws", });
    console.log("Started new Web Socket Server: ", wss)
  
    // handle upgrade of the request
    server.on("upgrade", function upgrade(request, socket, head) {
      try {
         // authentication and some other steps will come here
         // we can choose whether to upgrade or not
         console.log("Upgrade?")
         wss.handleUpgrade(request, socket, head, function done(ws) {
          wss.emit("connection", ws, request);
         });
      } catch (err) {
        console.log("upgrade exception", err);
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }
    });

    //Callback so we always send out the comments after a change
    comments.onChange((url:string,cl:CommentList)=>  {
        console.log("Sending out a change message...")
        console.log(wss.clients.size)
        wss.clients.forEach((c) => c.send(JSON.stringify({url:url, comments:cl})))
    })

    const handleMessage = (data:any,ctx:WebSocket) => {
        if( data['url'] && data['action']) {
            const url = data['url']
            const action = data['action']

            if( action == 'add' ) {
                console.log(`Adding comment to ${url}: ${data['comment']}`)
                comments.addComment(url,data['comment'])
            }
            else if( action == 'remove' ) {
                console.log(`Removing comment from ${url}: ${data['id']}`)
                comments.removeComment(url,data['id'])
            }
            else if( action == 'clear' ) {
                console.log(`Removing all comments from ${url}`)
                comments.clearComments(url)
            }
            else if( action == 'get' ) {
                console.log(`Getting all comments for ${url}`)
                comments.requestUpdate(url)
                //comments.getComments(url).then( cl => ctx.send(JSON.stringify({url:url,comments:cl})) )
            }
            else {
                console.log("Unknown action: ", action)
            }
        } else {
            console.log("Was missing url or action?")
        }

    }
  
    // what to do after a connection is established
    wss.on("connection", (ctx) => {
      // print number of active connections
      console.log("connected", wss.clients.size);
  
      // handle message events
      // receive a message and echo it back
      ctx.on("message", (message) => {
        console.log(`Received message => ${message}`);
        try {
            const s:string = message.toString()
            console.log("Message: ",s)
            const m = JSON.parse(s)
            console.log("Parsed: ",m)
            handleMessage(m,ctx)
        } catch (exception ) {
            console.log("Couldn't parse json: ", exception)
        }
      });
  
      // handle close event
      ctx.on("close", () => {
        console.log("closed", wss.clients.size);
      });
  
      // sent a message that we're good to proceed
      ctx.send("connection established.");
    });
  }