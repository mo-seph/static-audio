# Mix Server

This is intended as a static site version of Soundcloud etc.

If you put folders full of mp3/wav files into public/media, and then run
```
npm run index_files
```

It will create a JSON index of them all.

If you then run this (e.g. `npm start`), you'll get a webserver which will let you play any of the files by playlist, with a nice(ish) interface.

The idea is that this can the be deployed easily and once the server is running, new media can be rsync'd into the directory.

The other intention is to add the possibility for timestamped comments, but that will require an active server.

## Deploying
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



## Todos
- [ ] Debug wavefile pre-creation - at the moment, seems to stop it from loading
- [X] Create zips of directories for download
- [X] Allow for a JSON file that specifies the playlist rather than generating it from the files (to allow names, track ordering etc.)
- [X] Artwork per playlist
- [ ] Manage playing better - move to next track at end, start playing on selection of new track if already playing (or always?)
- [ ] Integrate source from other bits of the project
