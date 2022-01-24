// Running this based on: https://stackoverflow.com/questions/62096269/cant-run-my-node-js-typescript-project-typeerror-err-unknown-file-extension

import {TrackDef, PlaylistDef} from './Model'
import {exec} from 'child_process'

// rather than import, if we use it with node :/
import * as fs from 'fs'
import * as path from 'path';
//const fs = require('fs');
import AdmZip from 'adm-zip'


const filetypes = ['mp3','wav']

//import 'dotenv/config'
import dotenv from 'dotenv'
const pt = path.join(__dirname,"../../.env") 
dotenv.config({path: pt});
console.log("Media Root: ",process.env.MEDIA_ROOT)

function index_files(root:string) : void {
  console.log("Indexing: ", root)
  const result = processDir("",root)
  //
  const jd = "export const playlists = " + JSON.stringify(result,null,2)
  console.log("Final Result: ",jd)
  fs.writeFile(root + "/playlists.json",JSON.stringify(result,null,2), (f)=>{if(f) console.log(f)})
}

function processDir(path:string,root:string) : PlaylistDef[] {
  const me = dirToPlaylist(path,root)
  if( me ) playlistToZip(path,me,root)
  const r = me ? [me] : []
  const child_p = getSubdirs(path,root).map((p) => processDir(p,root))
  // Flatten
  const child_r = ([] as PlaylistDef[]).concat(...child_p)
  return [...r,...child_r]
}

function dirToPlaylist(path:string,root:string): PlaylistDef | null {
  // First look for a playlist.json file that has this information already setup
  const json_fn = root+"/"+path+"/playlist.json"
  if( fs.existsSync(json_fn) ) {
    const data = fs.readFileSync(json_fn,'utf8')
    return JSON.parse(data)
  }
  const files =  fs.readdirSync(root+"/"+path).filter(audioFile)
  if( files.length ) {
    const r:PlaylistDef = {
      name:path.replace(/.*\//g,""),
      id:path.replace(/.*\//g,"").replace(/[^a-zA-Z0-9]/g,""),
      tracks: files.map((f)=>fileToItem(f,path,root))
    }
    if( fs.existsSync(root+"/"+path+"/Artwork.jpg") ) r.image_url = path+"/Artwork.jpg"
    else {
      const candidates = fs.readdirSync(root+"/"+path).filter((f) => f.toLowerCase().endsWith(".jpg"))
      if( candidates.length ) r.image_url = path+"/"+candidates[0]
    } 
    return r
  }
  return null
}
function playlistToZip(path:string,playlist:PlaylistDef,root:string) {
  const archive = new AdmZip();
  const fn = path + "/" + playlist.id + ".zip"
  for( const t of playlist.tracks ) {
    const trackFile = root + "/" + t.url
    archive.addLocalFile(trackFile)
  }
  if( playlist.image_url ) archive.addLocalFile(root + "/" + playlist.image_url )
  playlist.archive_url = fn
  archive.writeZip(root + "/" + fn)
}

function fileToItem(filename:string,path:string,root:string) : TrackDef {
  const fn = root+"/"+path+"/"+filename
  const size = fs.statSync(fn).size
  // Cheekily assume 320k MP3s...
  const length = Math.ceil(size * 8 / 320000)
  const secs = `${(length % 60)}`.padStart(2,'0')
  const mins = `${Math.trunc(length/60)}`.padStart(2,'0')

  const r:TrackDef = {
    url:path+"/"+filename,
    name:filename.replace(/\.[^.]*$/,""),
    length:`${mins}:${secs}`
  }
  const base_name = filename.replace(/.[^.]*$/, "")
  const waveform_file = root + "/" + path + "/" + base_name + ".waveform.json"
  const waveform_url = path + "/" + base_name + ".waveform.json"
  // try to make a waveform file?
  /*
  try {
    const cmd = `audiowaveform -i "${fn}" -o "${waveform_file}" --pixels-per-second 20 --bits 8 --amplitude-scale auto`
    console.log("Trying: '"+cmd+"'")
    exec(cmd)
  } catch(e) {
    console.log("Couldn't make waveform: ",e)
  }
  if( fs.existsSync(waveform_file) ) r['waveform_url'] = waveform_url
  */
  return r
}

// Returns the path relative to root of all subdirectories
function getSubdirs(path:string,root:string):string[] {
  return fs.readdirSync(root+"/"+path).map((f)=>path+'/'+f).filter((f:string) => fs.statSync(root + "/" + f).isDirectory())
}

function audioFile(path:string):boolean {
  const path_s = path.toLowerCase()
  for( const f of filetypes ) { 
    if( path_s.endsWith(f)) return true 
  }
  return false
}
index_files(process.env.MEDIA_ROOT || "./public/media");
