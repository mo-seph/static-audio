# Static Audio


## Docs need updating after refactor...

This is intended as a static site version of Soundcloud etc. It can be run as a simple static site - just HTML and JS files served from any old webserver. It can also do live comments, but this requires being served from a Node server for the comment backend. 

## Setup

If you put folders full of mp3/wav files into `static-audio-client/public/media`, and then run
```
npm run index_files
```
Note: currently, you need to symlink this in `shared/public/media`, but this should get fixed in the future.

It will create a JSON index of all the audio, ready to serve.

## Running locally

If you then run the client (e.g. `yarn client start` in the root, or `npm start` in `static-audio-client`), you'll get a webserver which will let you play any of the files by playlist, with a nice(ish) interface.

The idea is that this can the be deployed easily and once the server is running, new media can be rsync'd into the directory.

## Deploying - Static
Running `npm build` will create a build directory with everything that you need in there.

This can then be served using e.g. nginx, simply by creating a server, e.g.:
```
server {
        listen 8080;

        root <wherever you put it>;
        index index.html index.htm index.nginx-debian.html;

        server_name <your server names>;

        location / {
                try_files $uri $uri.html $uri/ /index.html =404;
        }
}
```

Then you can copy everything across with
```
rsync -v -e ssh -aqr build/ <user>@<host>:<wherever you put it>
```

Once this is done the first time, you should be able to:
- Update the code without touching the files
```
//TBC, but something with excluding public/media from the rsync
rsync -v -e ssh -aqr --exclude 'public/media' build/ <user>@<host>:<wherever you put it>
```
- Update the music files without changing the code
```
//TBC, but something like
npm run index_files
rsync -v -e ssh -aqr public/media/ <user>@<host>:<wherever you put it>/public/media
```

## With comments
`yarn server run start` starts the server on port 5000. You need to do `yarn client run build` first to get an up to date build

## Features
- JSON file that specifies the playlist rather than generating it from the files (to allow names, track ordering etc.)
- Artwork per playlist
- Create zips of directories for download

## Development
- Set up top level scripts and document
- Allow config of media directory
- Allow media directory outside project DIR
- Top level scripts for deployment
- Refactor client components out into individual files

## Bugfix
- [ ] Debug wavefile pre-creation - at the moment, seems to stop it from loading
- [ ] Manage playing better - move to next track at end, start playing on selection of new track if already playing (or always?)
