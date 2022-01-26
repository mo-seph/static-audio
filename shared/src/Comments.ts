


export interface TrackComment {
    id: number;
    user: string;
    start: number;
    end?: number;
    text: string;
}
export type InputComment = Omit<TrackComment,"id">;

export class TestClass {
    constructor( ) {
        console.log("Test class")
    }
}


export interface CommentStore {
    init() : void
    addComment( url:string, c:InputComment ) : void 
    removeComment(  url:string,id:number ) : void 
    clearComments( url:string,) : void
    requestUpdate(url:string):void
    onChange(c:CommentCallback) : void
}

export type CommentList = TrackComment[]
export type CommentCallback = (url:string, c:CommentList) => void

/*
Example Reaper CSV:
#,Name,Start,End,Length
M5,,0:20.500,,
M4,,0:10.233,,
*/

export function commentsToCSV(cl:CommentList) : string {
    var file = "#,Name,Start,End,Length\n"
    cl.sort((c,d)=>c.start-d.start).forEach((c,i)=>{
        file += `M${i+1},${c.text.replace(/,/,"")},${secondsToMinSecMS(c.start)},${c.end ? secondsToMinSecMS(c.end) : ""},\n`
    })
    return file
}

export function secondsToMinSecMS(t:number) : string {
    const mins = Math.floor(t / 60)
    const secs = t - (mins*60)
    return `${mins}:` + secs.toFixed(3).padStart(5)
}
const randomTexts = [
    'I like this',
    'This is terrible',
    'More cowbell',
    'Shimmy shimmy yall',
    'Oooh yeah',
    'More transparent'
]

const randomNames = [
    'Kevin', 'Jimbo','Larry','Nobby'
]

var id = 1;

function randomComment() : TrackComment {
    const start = Math.random() * 45
    id = id + 1
    return {
        text: randomTexts[Math.floor(Math.random() * randomTexts.length)],
        user: randomNames[Math.floor(Math.random() * randomNames.length)],
        start: start,
        end: start + Math.random() * 30,
        id: id
    }
}

function randomComments(num:number) : CommentList {
    const r = []
    for( var i = 0; i < num; i++ ) r.push(randomComment())
    return r
}

export abstract class BaseCommentStore implements CommentStore {
    callbacks : CommentCallback[] = []
    update(url:string, f:(c:CommentList)=>CommentList) {
        this.doUpdate(url,f).then(() => 
            this.changed(url)
        )
    }
    constructor() { console.log(`New ${this.constructor.name}!`) }
    init() {console.log(`Initialising ${this.constructor.name}`)}

    abstract doUpdate(url:string, f:(c:CommentList)=>CommentList):Promise<any>
    abstract comments(url:string) : Promise<CommentList>
    abstract generateID(c:InputComment) : Promise<number>

    addComment( url:string, c:InputComment ) : void {
        console.log(`Adding comment ${c} to url ${url}`)
        this.generateID(c).then( (id) => 
            this.update(url, (cl)=>cl.concat({...c,"id":id}))
        )
    }
    removeComment( url:string, id:number ) : void {
        this.update(url, (cl)=>cl.filter(obj => obj.id !== id))
    }

    clearComments( url:string ) {
        this.update(url, (cl)=>[])
    }
    requestUpdate(url: string): void {
        this.changed(url)
    }
    changed(url:string) { 
        console.log("Comments firing changes for ",url)
        this.comments(url).then( cl => {
            console.log("Current comments: ", cl)
            this.callbacks.forEach(c => c(url, cl))
        })
    }
    onChange(c:CommentCallback) { 
        this.callbacks.push(c) 
    }
}

export class MemoryCommentStore extends BaseCommentStore {
    storedComments : Record<string,CommentList> = {}
    callbacks : CommentCallback[] = []
    id = 0

    doUpdate(url:string, f:(c:CommentList)=>CommentList):Promise<any> {
        return this.comments(url).then( (c) => {
            const u = f(c)
            console.log("Storing comments: ",u)
            this.storedComments[url] = u
        })
    }

    comments(url:string) : Promise<CommentList> {
        if( ! this.storedComments[url] ) {
            this.storedComments[url] = []
        }
        return new Promise((resolve,reject)=>resolve(this.storedComments[url]))
    }

    generateID(c:InputComment) : Promise<number> {
        this.id = this.id + 1
        return Promise.resolve(this.id)
    }
}