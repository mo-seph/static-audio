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

import {  Paper, Typography, Grid, Box, Button, Theme  } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { PlayArrow, Pause} from '@mui/icons-material';



import { PlaylistDef, TrackDef, CommentCallback, CommentList, CommentStore, 
    TrackComment, toTimeString} from "shared";

import {PlaylistStore,useCurrentPlaylistID} from './helpers'

import PlaylistDisplay from "./PlaylistDisplay"
import PlaylistList from "./PlaylistManager"
import CommentDisplay from "./CommentDisplay"
import TrackListDisplay from "./TrackListDisplay"
import { useLocation } from "react-router-dom";
import { emptyPlaylist } from "./App";



const mediaRoot = "/media"

const plugins = (theme:Theme) => {
    return [
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
      container: "#timeline",
      //primaryColor: theme.palette.primary.main
      primaryColor: "red",
      secondaryColor: theme.palette.primary.main,
      primaryFontColor: "red",
      secondaryFontColor: theme.palette.primary.main,
      fontFamily: "Roboto"

    }
  }
  /*
  {
    plugin: CursorPlugin
  }
  */
]};


interface WSProps {
    play:()=>void
    playing:boolean
    track:TrackDef
    handleWSMount:(waveSurfer: any) => void
}
const WaveSurferInterface = (props:WSProps) => {
    const theme = useTheme()
    return <>
        <div className="waveform-title">
            <Typography variant="h6" color="primary" align="left">
                <Button variant='outlined' onClick={props.play}>
                    {props.playing ? <Pause />: <PlayArrow />}
                </Button>
                &nbsp;
                {props.track.name}
            </Typography>
        </div>
        <div className="clear"></div>
        <div className="waveform-container">
        
            <WaveSurfer plugins={plugins(theme)} onMount={props.handleWSMount}>
            <WaveForm id="waveform" 
                //backgroundColor={theme.palette.background.paper}
                progressColor={theme.palette.warning.dark}
                cursorColor={theme.palette.warning.dark}
                waveColor={theme.palette.primary.main}>
            </WaveForm>
            <div id="timeline" style={{
                //background: theme.palette.background.paper ,
                //background: theme.palette.info.dark,
                color: theme.palette.info.contrastText
                }}/>
        
            </WaveSurfer>
    
        </div>
</>
}

interface PlayerSetup {
    playlists:PlaylistStore
    comments:CommentStore
}
export default (setup:PlayerSetup) => {
    const loc = useCurrentPlaylistID()
    const [playlist,setPlaylist] = useState(emptyPlaylist)

    //const [playlist,setPlaylist] = useState(setup.playlist)
    const [track,setTrack] = useState(
        (playlist && playlist.tracks.length) ? playlist.tracks[0] : {name:"No tracks found",url:"./"})
    
    const [playing,setPlaying] = useState(false)
    const [comments,setComments] = useState<CommentList>([])
    const [toggle,setToggle] = useState(false)


    useEffect(() => {
      const pl = setup.playlists.byID[loc]
      if(pl) setNewPlaylist(pl)
    },[setup.playlists, loc])


    const setNewPlaylist = useCallback((p:PlaylistDef) => {
        console.log("Set playlist: ",p)
        setPlaylist(p)
      }, [])
 
    const regionCreatedHandler = (r:any) => {}
    const theme = useTheme()

    useEffect( () => {
        console.log("Playlist updated!",playlist)
        setNewTrack(playlist.tracks[0])
    },[playlist])

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
                label:c.text,
                color: theme.palette.warning.dark

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
    <Grid container spacing={2} padding={1}>
        <Grid item xs={3}>
            <PlaylistList playlists={setup.playlists} />
        </Grid>
        <Grid item xs={3}>
            <PlaylistDisplay playlist={playlist} mediaRoot={mediaRoot}/>
        </Grid>
        <Grid item xs={6}>
            <TrackListDisplay playlist={playlist} callback={setNewTrack} mediaRoot={mediaRoot} />
        </Grid>
 
        <Grid item xs={12}>
        <Paper elevation={10} sx={{"padding":1}}>
            <WaveSurferInterface play={play} playing={playing} handleWSMount={handleWSMount} track={track}/>
        </Paper>
        </Grid>
        <Grid item xs={12}>
        </Grid>
 
        <Grid item xs={12}>
            <CommentDisplay 
                comments={comments} 
                playComment={playCallback}  
                wave={wavesurferRef.current} 
                store={setup.comments} track={track}/>

        </Grid>
    </Grid>
    );
}

/*
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
            */