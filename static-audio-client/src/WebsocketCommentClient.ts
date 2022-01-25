//import WebSocket from "ws";
import { CommentCallback, CommentList, CommentStore, TrackComment } from "shared";

// Websockets cannibalised from https://dev.to/ksankar/websockets-with-react-express-part-2-4n9f

export default class WebsocketCommentClient implements CommentStore {
    callbacks : CommentCallback[] = []
    ws?: WebSocket = undefined

    constructor( ) {
        console.log("New WebSocket CommentStore!")
 
    }

    init() {
      this.ws = new WebSocket('ws://localhost:5000/ws');
       // setup websocket
      this.ws.onopen = () => {
        console.log('Connected to socket');
      }

      this.ws.onmessage = (m) => {
          console.log("Got message: ",m)
          try {
              console.log("Got data: ",m.data)
              const data = JSON.parse(m.data)
              console.log("Got JSON: ",data)
              const url = data['url']
              const comments = data['comments']
              this.changed(url,comments)
          } catch (e) {
              console.log("Couldn't decode WS message: ", e)
          }
      }

    }

    send(data:any) {
        try {
            if(this.ws) {
                this.ws.send( JSON.stringify(data) )
            } else {
                console.log("Websocket not initialised...")
            }
        } catch( e ) {
            console.log("Couldn't send: ", e)
        }
    }

    addComment( url:string, c:TrackComment ) : void {
        this.send( { url:url, action:'add', comment: c})
    }
    removeComment( url:string, c:TrackComment ) : void {
        this.send( { url:url, action:'remove', comment: c})
    }

    clearComments( url:string ) {
        this.send( { url:url, action:'clear'})
    }

    requestUpdate(url:string) : void {
        this.send( { url:url, action:'get'})
    }
    changed(url:string, cl:CommentList) { 
        console.log("Comments firing changes for ",url)
        this.callbacks.forEach(c => c(url, cl))
    }
    onChange(c:CommentCallback) { 
        this.callbacks.push(c) 
    }
}