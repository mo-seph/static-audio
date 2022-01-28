import {PlaylistDef} from "shared"
import { useLocation } from "react-router-dom";

export interface PlaylistStore {
    ordered:PlaylistDef[]
    byID: Record<string,PlaylistDef>
}
export function emptyPlaylistStore() : PlaylistStore {
    return {ordered:[],byID:{}}
}

export function toStore(l:PlaylistDef[]): PlaylistStore {
    const store = emptyPlaylistStore();
    l.forEach((p)=>{
        store.ordered.push(p)
        store.byID[p.id] = p
    })
    return store
}

export function useCurrentPlaylistID() {
    return useLocation().pathname.replace(/^\//,"")
}