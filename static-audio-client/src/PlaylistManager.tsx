import {useState, useEffect, useCallback} from "react"
import { useLocation, Link as RouterLink } from 'react-router-dom';

import { Typography,List, ListItem, ListItemText, Paper } from '@mui/material';

import Player from "./Player";
import { emptyPlaylist } from "./App";
import {InterfaceSpec, PlaylistDef, CommentStore} from 'shared'
import {PlaylistStore, useCurrentPlaylistID} from './helpers'

const mediaRoot = "/media"

interface PlaylistManagerSetup {
    playlists:PlaylistStore
}


export default (setup:PlaylistManagerSetup) => {
    const loc = useCurrentPlaylistID()
    return (
      <Paper sx={{ width: '100%', height:300, padding:2}} >
      <Typography>Playlists</Typography>
      <List dense={true} disablePadding={true} sx={{  overflow:"scroll", }}>
            {setup.playlists.ordered.filter((p)=>!p.hidden).map((playlist,num) => 
                <ListItem button disablePadding={false} component={RouterLink} 
                  selected={playlist.id === loc}
                  to={playlist.id} key={playlist.id}>
                  <ListItemText primary={playlist.name} />
                </ListItem>
            )}
      </List>
      </Paper>
    );
}
