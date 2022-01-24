import {MemoryCommentStore,toTimeString} from 'shared'
import setupWebsocket from './WebsocketCommentAdaptor'


console.log("Time string: ",toTimeString(127))
const store = new MemoryCommentStore()
store.addComment("hello",{id:1,text:"Comment",start:3.5,user:"system"})
