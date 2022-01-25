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

import {  Paper, Typography, Grid  } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PlayArrow, Pause} from '@mui/icons-material';



import { PlaylistDef, TrackDef, CommentCallback, CommentList, CommentStore, 
    TrackComment, toTimeString } from "shared";

import PlaylistDisplay from "./PlaylistDisplay"
import CommentDisplay from "./CommentDisplay"
import TrackListDisplay from "./TrackListDisplay"



const mediaRoot = "/media"

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
        setup.comments.requestUpdate(t.url)
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

    return (
    <Grid container spacing={4} >
        <Grid item xs={4}>
            <PlaylistDisplay playlist={setup.playlist} mediaRoot={mediaRoot}/>
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
            <TrackListDisplay playlist={setup.playlist} callback={setNewTrack} mediaRoot={mediaRoot} />
        </Grid>
        <Grid item xs={8}>
            <CommentDisplay comments={comments} callback={playCallback}  wave={wavesurferRef.current} store={setup.comments} track={track}/>

        </Grid>
    </Grid>
    );
}