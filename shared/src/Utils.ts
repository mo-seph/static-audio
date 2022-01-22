
export function toTimeString(seconds:number) : string {
    const secs = `${(Math.trunc(seconds) % 60)}`.padStart(2,'0')
    const mins = `${Math.trunc(seconds/60)}`.padStart(2,'0')
    return `${mins}:${secs}`
}