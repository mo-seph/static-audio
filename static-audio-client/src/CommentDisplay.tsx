
import React, {useState } from "react"
// @ts-ignore
import { WaveSurfer} from "wavesurfer-react";
import { useTheme } from '@mui/material/styles';
import {  Paper, 
    Grid, List, ListItem, ListItemAvatar, ListItemText, 
    ListItemButton, TextField } from '@mui/material';
import { PlayArrow, Delete, Edit, Download } from '@mui/icons-material';

import { TrackDef,  CommentList, CommentStore, 
    TrackComment, toTimeString, commentsToCSV } from "shared";
import {saveAs} from 'file-saver'

interface CommentDownloadSetup {
    comments:CommentList
}
const CommentDownload = (props:CommentDownloadSetup) => {
    const [fileUrl,setFileUrl] = useState("")
    const doDownload = () => {
        const contents = commentsToCSV(props.comments)
        console.log("Download...\n"+contents)
        const blob = new Blob([contents], {type:"text/csv;charset=utf-8"});                   // Step 3
        saveAs(blob, "comments.csv")
        console.log("Done?")
    }

    return <>
        <Download onClick={doDownload} />
    </>
}

interface CommentDisplaySetup {
    comments:CommentList
    store:CommentStore
    track:TrackDef
    playComment:(t:TrackComment) => void
    wave:WaveSurfer
}
export default (props:CommentDisplaySetup) => {
    const theme = useTheme()
    const [time,setTime] = useState(0)
    const [user,setUser] = useState("User") // Should come from local storage?
    const [text,setText] = useState("") // Should come from local storage?
    const [typing,setTyping] = useState(false)
    const updateTime = () => {
        const t = Math.floor(props.wave.getCurrentTime())
        console.log("Updated time: ",t)
        setTime(t)
    }
    
    const addComment = () => {
        props.store.addComment(props.track.url,
            {user:user,start:time,text:text})
        setText("")
        setTyping(false)
    }

    const handleKeyPress = (event:React.KeyboardEvent) => {
        if( ! typing ) {
            setTyping(true)
            updateTime()
        }
        if (event.keyCode === 13 || event.which === 13) { // look for the `Enter` keyCode
          addComment()
        }
      }
            //<TextField variant="outlined" label={<>"Time"</>} value={time || 0} onChange={(v) => setTime(parseInt(v.target.value || "0"))}/>
    return (<>
    <Paper elevation={3}>

       <Grid container spacing={2} padding={2}>
            <Grid item xs={2}>
            <TextField variant="outlined" label="User" defaultValue={user} onChange={(v) => setUser(v.target.value)}/>
            </Grid>
            <Grid item xs={9}>
            <TextField fullWidth variant="outlined" label="Comment" 
                value={text} onChange={(v) => setText(v.target.value)}
                onKeyPress={(e) => handleKeyPress(e)}/>
            </Grid>
            <Grid item xs={1}>
                <CommentDownload comments={props.comments}/>
            </Grid>
        </Grid>
        <List dense={true} disablePadding={true} sx={{ width: '100%', maxHeight:"50%",  overflow:"scroll", }}>
            {(props.comments || []).sort((c,d)=>c.start-d.start).map((comment,num) => (<>
                <ListItem disablePadding={true}              
                    secondaryAction={ <>
                      <Edit />
                      <Delete onClick={()=>props.store.removeComment(props.track.url,comment.id)}/>
                        </> }>
                    <ListItemButton>
                    <ListItemAvatar ><PlayArrow color='primary' onClick={() => props.playComment(comment)}/></ListItemAvatar>
                    <ListItemText
                        onClick={() => props.playComment(comment)}
                        primary={`${comment.user}: ${comment.text}`}
                        secondary={`${toTimeString(comment.start)} (${comment.id})`}
                    />
                    </ListItemButton>
                </ListItem>
            </>)) }
        </List>

    </Paper>
    </>
        )
}
