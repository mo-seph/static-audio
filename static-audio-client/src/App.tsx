import  { useEffect, useState } from 'react';
//import './App.css';
import Playlist from './PlaylistManager';
import {PlaylistDef, MemoryCommentStore } from 'shared'

import { BrowserRouter as Router, Route } from 'react-router-dom';
import WebsocketCommentClient from './WebsocketCommentClient';
import { createTheme, useMediaQuery, ThemeProvider, CssBaseline } from '@mui/material';
import {useMemo} from 'react'

export const emptyPlaylist:PlaylistDef = {
  name:"No playlist",
  id:"null",
  tracks: [ {name:"No track loaded",url:"./"}]
}

//const comments = new MemoryCommentStore()
const comments = new WebsocketCommentClient()

function App() {
  const [playlists,setPlaylists] = useState([emptyPlaylist])

  //const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const prefersDarkMode = false

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

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
    console.log("Initialising Comments")
    comments.init()
  },[])
  return (
    <ThemeProvider theme={theme}>
    <CssBaseline />
    <Router>
    <div className="App">
      <Playlist playlists = {playlists as PlaylistDef[]} comments = {comments}/>
    </div>
    </Router>
    </ThemeProvider>
  );
}
export default App;
