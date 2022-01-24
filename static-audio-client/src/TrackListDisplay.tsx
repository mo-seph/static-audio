import {  Paper, List, ListItem, ListItemAvatar, ListItemText, 
    ListItemButton } from '@mui/material';
import { Download, PlayArrow, Pause} from '@mui/icons-material';

import { TrackDef,  PlaylistDef} from "shared";

export interface TracklistDisplaySpec {
    playlist:PlaylistDef
    mediaRoot: string
    callback:(t:TrackDef)=>any
}

const TrackListDisplay = (props:TracklistDisplaySpec) => {
    
    return (
    <Paper elevation={3}>
    <List dense={true} disablePadding={true} sx={{ width: '100%', height:400, bgcolor: 'background.paper', overflow:"scroll", }}>
        {props.playlist.tracks.map((track,num) => (<>
            <ListItem disablePadding={true} secondaryAction={<a href={props.mediaRoot + "/" + track.url}><Download color='primary'/></a>} >
                <ListItemButton>
                <ListItemAvatar onClick={() => props.callback(track)}><PlayArrow color='primary'/></ListItemAvatar>
                <ListItemText
                    onClick={() => props.callback(track)}
                    primary={track.name || track.url}
                    secondary={track.length || "?:?"}
                />
                </ListItemButton>
            </ListItem>
        </>)) }
    </List>
    </Paper>
    )
    
}

export default TrackListDisplay
