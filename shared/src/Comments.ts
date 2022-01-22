


export interface TrackComment {
    id: number;
    user: string;
    start: number;
    end?: number;
    text: string;
}

export class TestClass {
    constructor( ) {
        console.log("Test class")
    }
}


export interface CommentStore {
    addComment( url:string, c:TrackComment ) : void 
    removeComment(  url:string,c:TrackComment ) : void 
    clearComments( url:string,) : void
    getComments(url:string) : Promise<CommentList>
    onChange(c:CommentCallback) : void
}

export type CommentList = TrackComment[]
export type CommentCallback = (url:string, c:CommentList) => void

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

export class MemoryCommentStore implements CommentStore {
    comments : Record<string,CommentList> = {}
    callbacks : CommentCallback[] = []
    constructor( ) {
        console.log("New Memory CommentStore!")
    }

    addComment( url:string, c:TrackComment ) : void {
        console.log(`Adding comment ${c} to url ${url}`)
        this.ensure(url)
        this.comments[url].push(c)
        console.log("Firing changes...")
        this.changed(url)
    }
    removeComment( url:string, c:TrackComment ) : void {
        this.ensure(url)
        this.comments[url] = this.comments[url].filter(obj => obj !== c);
        this.changed(url)
    }

    clearComments( url:string ) {
        this.comments[url] = []
        this.changed(url)
    }
    ensure(url:string) {
        console.log("Ensuring: ",url)
        console.log("Comments: ",this.comments)
        if( ! this.comments[url] ) {
            console.log("No comments for ",url)
            this.comments[url] = []
        }
        console.log("After: ",this.comments)
    }

    getComments(url:string) : Promise<CommentList> {
        this.ensure(url)
        return new Promise((resolve,reject)=>resolve(this.comments[url]))
    }
    changed(url:string) { 
        console.log("Comments firing changes for ",url)
        this.callbacks.forEach(c => c(url, this.comments[url]))
    }
    onChange(c:CommentCallback) { 
        //c(this.comments[this.url])
        this.callbacks.push(c) 
    }

}