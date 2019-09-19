const http = require('http');
const fs = require('fs')
const server = http.createServer();
const fse = require("fs-extra");
var path = require('path');
var ytdl = require('youtube-dl');

function playlist(url) {
    // await makeDir(__dirname+ '/uploads')
    'use strict';
    var video = ytdl(
        url,
        ['--format=22'],
    );

    video.on('error', function error(err) {
        console.log('error 2:', err);
    });

    let size = 0
    video.on('info', function (info) {
        try {
            size = info.size;
            // await makeDir(__dirname + `/downloads/${info.playlist_uploader}/${info.playlist}/`)
            var dir = __dirname + `/downloads/${info.playlist_uploader}/${info.playlist}/`;
            fse.ensureDirSync(dir);
            let fulltitle = info.fulltitle;
            // console.log("TCL: playlist -> fulltitle", fulltitle)
            let newName = fulltitle.replace(/\//g, "-");
            // console.log("TCL: playlist -> newName", newName)
            var output = path.join(__dirname + '/downloads', `${info.playlist_uploader}/${info.playlist}/`, `#0${info.playlist_index} ` + `${newName}` + '.mp4');
            // var output = path.join(__dirname + '/', `#0${info.playlist_index} ` + `${info.fulltitle}` + '.mp4');
            console.log(`playlist: ${info.playlist} - video:  #0${info.playlist_index} ${info.fulltitle}`);
            video.pipe(fs.createWriteStream(output));

        } 
        catch (error) {
            console.log("TCL: playlist -> error", error)

        }
    }
    );

    var pos = 0;
    video.on('data', function data(chunk) {
        pos += chunk.length;
        // `size` should not be 0 here.
        if (size) {
            var percent = (pos / size * 100).toFixed(2);
            process.stdout.cursorTo(0);
            process.stdout.clearLine(1);
            process.stdout.write(percent + '%');
        }
    });

    video.on('next', playlist);

}


playlist('https://www.youtube.com/playlist?list=PLWKjhJtqVAbljtmmeS0c-CEl2LdE-eR_F')


const port = process.env.PORT || 3000;




server.listen(port, () => {
    console.log(`we are listen to port ${port}`);
})