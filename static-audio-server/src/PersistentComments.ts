import {BaseCommentStore, CommentList, TrackComment, CommentCallback, InputComment} from "shared"
import {init as initStorage, getItem,setItem} from "node-persist"


export class PersistentCommentStore extends BaseCommentStore {
    async init() {
        console.log("Persistent Comments Initialising")
        const st = await initStorage()
    }

    doUpdate(url:string, f:(c:CommentList)=>CommentList):Promise<any> {
        return getItem(url).then( (c) => {
            setItem(url, f((c as CommentList || [])))
        })
    }
    comments(url:string) : Promise<CommentList> {
        return getItem(url).then((c) => ((c || []) as CommentList))
    }

    async generateID(c:InputComment) : Promise<number> {
        //const id = (((await getItem("id") ) || 0 ) as number) + 1
        return getItem("id").then((i) => {
            return (i || 0) as number + 1 
        }).then((id) => {
            setItem("id",id)
            return id
        })
    }
}