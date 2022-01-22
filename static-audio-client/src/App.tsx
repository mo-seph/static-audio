import  { useEffect, useState } from 'react';
import './App.css';
import Playlist from './PlaylistManager';
import {PlaylistDef, MemoryCommentStore } from 'shared'

import { BrowserRouter as Router, Route } from 'react-router-dom';
import WebsocketCommentClient from './WebsocketCommentClient';

export const emptyPlaylist:PlaylistDef = {
  name:"No playlist",
  id:"null",
  tracks: [ {name:"No track loaded",url:"./"}]
}

//const comments = new MemoryCommentStore()
const comments = new WebsocketCommentClient()

function App() {
  const [playlists,setPlaylists] = useState([emptyPlaylist])
  useEffect(() => {
    console.log("Loading data")
    fetch("./media/playlists.json")
    .then( response => {
      if( response.ok ) {
        return response.json()
      }
      throw response
    })
    .then( data => {
      console.log("Got data!",data)
      setPlaylists(data)
    })
  },[])
  return (
    <Router>
    <div className="App">
      <Playlist playlists = {playlists as PlaylistDef[]} comments = {comments}/>
    </div>
    </Router>
  );
}
export default App;
