import {useState, useEffect, useCallback} from "react"
import { useLocation, Link } from 'react-router-dom';

import { Button,Card,  CardActions } from '@mui/material';

import Player from "./Player";
import { emptyPlaylist } from "./App";
import {InterfaceSpec, PlaylistDef, CommentStore } from 'shared'

const mediaRoot = "/media"

interface PlaylistManagerSetup {
    playlists:PlaylistDef[]
    comments:CommentStore
}

const PlaylistElement = (props:InterfaceSpec<PlaylistDef>) => {
        //<Link to={props.item.id} className="playlist-index-item">{props.item.name}</Link>
    return (
      <Button component={Link} to={props.item.id} key={props.item.id} variant="contained" color="primary" >
        {props.item.name}
      </Button>
    )
}

export default (setup:PlaylistManagerSetup) => {
    //const [playlists,setPlaylists] = useState(setup.playlists)
    const loc = useLocation().pathname.replace(/^\//,"")
    console.log("Location:",loc)
    const [playlist,setPlaylist] = useState(emptyPlaylist)

    useEffect(() => {
      const playlistMap:Record<string,PlaylistDef> = {}
      setup.playlists.forEach((p)=>playlistMap[p.id] = p)
      const pl = setup.playlists.find((p)=> {return p.id === loc } )
      if(pl) setNewPlaylist(pl)
    },[setup.playlists, loc])


    const setNewPlaylist = useCallback((p:PlaylistDef) => {
        console.log("Set playlist: ",p)
        setPlaylist(p)
      }, [])

        //<div className="playlist-index-container">
                //<PlaylistElement item={t} callback={setNewPlaylist} num={i} />
    return (
      <div className="App">
        <Card variant="outlined">
            <CardActions>

            {
                setup.playlists.map((t,i) => 
                <Button component={Link} to={t.id} key={t.id} variant="contained" color="primary" >
                  {t.name}
                </Button>
                )
            }
            </CardActions>
        </Card>
        <Player playlist={playlist} comments={setup.comments}/>
  
      </div>
    );
}