export interface TrackDef {
    name?: string 
    length?: string
    url: string
    waveform_url?:string
}

export interface PlaylistDef {
    image_url?:string
    archive_url?:string
    name: string
    id:string
    tracks:TrackDef[]
}

export interface InterfaceSpec<T> {
    num:number
    item:T,
    callback:(t:T)=>any
}

/*

*/