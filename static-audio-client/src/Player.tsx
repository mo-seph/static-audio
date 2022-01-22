import React, {useState, useEffect, useCallback, useRef, MutableRefObject } from "react"


// @ts-ignore
import RegionsPlugin from "wavesurfer.js/dist/plugin/wavesurfer.regions.min";
// @ts-ignore
import TimelinePlugin from "wavesurfer.js/dist/plugin/wavesurfer.timeline.min";
// @ts-ignore
import MarkersPlugin from "wavesurfer.js/dist/plugin/wavesurfer.markers.min";
// @ts-ignore
//import CursorPlugin from "wavesurfer.js/dist/plugin/wavesurfer.cursor.min";
// @ts-ignore
import { WaveSurfer, WaveForm} from "wavesurfer-react";

import './App.css';
import {  Paper, Card,  CardHeader, Typography,Avatar, 
    Grid, List, ListItem, ListItemAvatar, ListItemText, 
    ListItemButton, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Download, PlayArrow, Pause} from '@mui/icons-material';



import { PlaylistDef, TrackDef, CommentCallback, CommentList, CommentStore, 
    TrackComment, toTimeString } from "shared";

const mediaRoot = "/media"

/*
export function toTimeString(seconds:number) : string {
    const secs = `${(Math.trunc(seconds) % 60)}`.padStart(2,'0')
    const mins = `${Math.trunc(seconds/60)}`.padStart(2,'0')
    return `${mins}:${secs}`
}
*/

const plugins = [
  {
    plugin: RegionsPlugin,
    options: { dragSelection: true }
  },
  {
    plugin: MarkersPlugin,
    options: { dragSelection: true }
  },
  {
    plugin: TimelinePlugin,
    options: {
      container: "#timeline"
    }
  }
  /*
  {
    plugin: CursorPlugin
  }
  */
];

var wavesurfer;



export interface TracklistDisplaySpec {
    playlist:PlaylistDef
    callback:(t:TrackDef)=>any
}
const TrackListDisplay = (props:TracklistDisplaySpec) => {
 
    return (
    <Paper elevation={3}>
    <List dense={true} disablePadding={true} sx={{ width: '100%', height:400, bgcolor: 'background.paper', overflow:"scroll", }}>
        {props.playlist.tracks.map((track,num) => (<>
            <ListItem disablePadding={true} secondaryAction={<a href={mediaRoot + "/" + track.url}><Download color='primary'/></a>} >
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


const PlaylistDisplay = (props:any) => {
    const pd = props.playlist as PlaylistDef
    const theme = useTheme()
    return (
        <Card key={props.num} color={theme.palette.primary.light}> 
            <CardHeader 
                title={<>
                    <Typography variant="h4" color="primary" align="left">{pd.name}</Typography>
                    {pd.image_url ? <Avatar src={mediaRoot + "/" +pd.image_url} variant="rounded" sx={{ width: 200, height: 200 }}/> : ""}
                    </>}
                action={
                <div>
                    {pd.archive_url ? <a href={mediaRoot + "/" + pd.archive_url}><Download color='primary'/></a> : <Download color='disabled'/>}
                </div>}
                    >
            </CardHeader>
        </Card>
    )
}

interface CommentDisplaySetup {
    comments:CommentList
    store:CommentStore
    track:TrackDef
    callback:(t:TrackComment) => void
    wave:WaveSurfer
}
const CommentDisplay = (props:CommentDisplaySetup) => {
    const theme = useTheme()
    const [time,setTime] = useState(0)
    const [user,setUser] = useState("Hanny") // Should come from local storage?
    const [text,setText] = useState("") // Should come from local storage?
    const [typing,setTyping] = useState(false)
    const updateTime = () => {
        const t = Math.floor(props.wave.getCurrentTime())
        console.log("Updated time: ",t)
        setTime(t)
    }
    
    const addComment = () => {
        props.store.addComment(props.track.url,
            {user:user,start:time,text:text,id:Math.floor(Math.random() * 10000 )})
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

       <Grid container spacing={2}>
            <Grid item xs={2}>
            <TextField variant="outlined" label="User" defaultValue={user} onChange={(v) => setUser(v.target.value)}/>
            </Grid>
            <Grid item xs={10}>
            <TextField fullWidth variant="outlined" label="Comment" 
                value={text} onChange={(v) => setText(v.target.value)}
                onKeyPress={(e) => handleKeyPress(e)}/>
            </Grid>
        </Grid>
        <List dense={true} disablePadding={true} sx={{ width: '100%', height:400, bgcolor: 'background.paper', overflow:"scroll", }}>
            {(props.comments || []).sort((c,d)=>c.start-d.start).map((comment,num) => (<>
                <ListItem disablePadding={true} >
                    <ListItemButton>
                    <ListItemAvatar ><PlayArrow color='primary'/></ListItemAvatar>
                    <ListItemText
                        onClick={() => props.callback(comment)}
                        primary={`${comment.user}: ${comment.text}`}
                        secondary={`${toTimeString(comment.start)}`}
                    />
                    </ListItemButton>
                </ListItem>
            </>)) }
        </List>

    </Paper>
    </>
        )
}

interface PlaylistSetup {
    playlist:PlaylistDef
    comments:CommentStore
}
export default (setup:PlaylistSetup) => {
    //const [playlist,setPlaylist] = useState(setup.playlist)
    const [track,setTrack] = useState(
        (setup.playlist && setup.playlist.tracks.length) ? setup.playlist.tracks[0] : {name:"No tracks found",url:"./"})
    
    const [playing,setPlaying] = useState(false)
    const [comments,setComments] = useState<CommentList>([])
    const [toggle,setToggle] = useState(false)
 
    const regionCreatedHandler = (r:any) => {}
    const theme = useTheme()

    useEffect( () => {
        console.log("Playlist updated!",setup.playlist)
        setNewTrack(setup.playlist.tracks[0])
    },[setup.playlist])

    const isPlaying = useCallback(() => {
        console.log("Checking play status:",playing);
        return playing
    },[playing])

    const updateComments : CommentCallback = useCallback((url:string,c:CommentList) => {
        wavesurferRef.current.clearMarkers()
        console.log(`Got updated comments for ${url}: `,c)
        setComments(c)
        setToggle(!toggle)
        c.forEach( (c) => {
            console.log("Adding marker: ", c)
            wavesurferRef.current.addMarker({
                time:c.start,
                label:c.text
            })
        })
    }, [])

    useEffect( () => {
        console.log("Adding self as comment change handler!")
        setup.comments.onChange(updateComments)
    },[setup.comments])

    const wavesurferRef : MutableRefObject<WaveSurfer> = useRef();
    const handleWSMount = useCallback(
        waveSurfer => {
          wavesurferRef.current = waveSurfer;
          if (wavesurferRef.current) {
            wavesurferRef.current.on("region-created", regionCreatedHandler);
    
            wavesurferRef.current.on("ready", () => {
              console.log("WaveSurfer is ready");
              if( isPlaying() ) {
                  console.log("Ready to play, and playing, so will start")
                  wavesurferRef.current.play()
              } else {
                  console.log("Ready to play but not playing")
              }
            });
    
            /*
            wavesurferRef.current.on("region-removed", region => {
              console.log("region-removed --> ", region);
            });
            */
    
            wavesurferRef.current.on("loading", (data: any) => {
              console.log("loading --> ", data);
            });
    
            if (window) {
              //window.surferidze = wavesurferRef.current;
            }
          }
        },
        [regionCreatedHandler]
      );
        
    const setNewTrack = useCallback((t:TrackDef) => {
        console.log("Set track!",t)
        //const fn = mediaRoot + "/" + playlist.basedir + "/" + t.url
        const fn = mediaRoot + "/" + t.url
        console.log("Loading track: ",fn)
        if( t.waveform_url ) {
            console.log("Waveform URL: ",mediaRoot +"/"+t.waveform_url)
            wavesurferRef.current.load(fn, mediaRoot +"/"+t.waveform_url);
        }
        else wavesurferRef.current.load(fn);
        //wavesurferRef.current.clearMarkers()
        setTrack(t)
        setup.comments.getComments(t.url).then((c)=>updateComments(t.url,c))
    }, []);

    const playCallback = (c:TrackComment) => {
        wavesurferRef.current.play(c.start)
    }

    const play = useCallback(() => {
        if( playing ) {
            console.log("Setting playing to false")
            wavesurferRef.current.pause();
            setPlaying(false)
        }
        else {
            wavesurferRef.current.play();
            console.log("Setting playing to true")
            setPlaying(true)
        }
        //wavesurferRef.current.playPause().then((d:any) => {console.log("playing: ",d)});
    }, [playing]);


    //<Paper className='main-container'></Paper>
        //<div className="tracklist-container">
    /*  <Box height={400} sx={{
            overflow:"scroll",
            textAlign:"left"
            }}>
            {setup.playlist.tracks.map((t,i) => (
                <TrackListElement item={t} callback={setNewTrack} num={i} />
            )) }
        </Box>*/
    return (
    <Grid container spacing={4} >
        <Grid item xs={4}>
            <PlaylistDisplay playlist={setup.playlist}/>
        </Grid>
 
        <Grid item xs={12}>
        <Paper elevation={3}>
            <div className="waveform-buttons">
                <button onClick={play} className="waveform-button">{playing ? <Pause color='secondary'/>: <PlayArrow color='secondary'/>}</button>
            </div>   
            <div className="waveform-title">
                <Typography variant="h6" color="primary" align="left">{track.name}</Typography>
            </div>
            <div className="clear"></div>
            <div className="waveform-container">
            
                <WaveSurfer plugins={plugins} onMount={handleWSMount}>
                <WaveForm id="waveform" 
                    backgroundColor="#eee"
                    progressColor={theme.palette.warning.dark}
                    cursorColor={theme.palette.warning.dark}
                    waveColor={theme.palette.primary.dark}>
                </WaveForm>
                <div id="timeline" style={{background: "#eee"}}/>
            
                </WaveSurfer>
        
            </div>
        </Paper>
        </Grid>
        <Grid item xs={4}>
            <TrackListDisplay playlist={setup.playlist} callback={setNewTrack}  />
        </Grid>
        <Grid item xs={8}>
            <CommentDisplay comments={comments} callback={playCallback}  wave={wavesurferRef.current} store={setup.comments} track={track}/>

        </Grid>
    </Grid>
    );
}