const http = require('http');
const fs = require('fs')
const makeDir = require('make-dir');
const server = http.createServer();

const path = require('path')
const youtubedl = require('youtube-dl')

async function playlist(url) {

    'use strict'
    var downloaded = 0;
    const video = youtubedl(
        url,
        ['--format=22'],
        // start will be sent as a range header

        { start: downloaded }
    )
    // console.log("TCL: playlist -> video", video)
    video.on('error', function error(err) {
        console.log('error 2:', err)
    })

    video.on('complete', function complete(info) {
        'use strict';
        console.log('filename: ' + info._filename + ' already downloaded.');
    });


    let size = 0
    video.on('info', async function (info) {
        size = info.size;
        await makeDir(__dirname + `/downloads/${info.playlist_uploader}/${info.playlist}/`)
        let output = path.join(__dirname + `/downloads/${info.playlist_uploader}/${info.playlist}/`, `#0${info.playlist_index} ` + info._filename + '.mp4')
        if (fs.existsSync(output)) {
            downloaded = fs.statSync(output).size;
            console.log("TCL: playlist -> downloaded in if statement", downloaded)
        }

        // info.size will be the amount to download, add
        var total = info.size + downloaded;
        console.log('size: ' + total);
        
        console.log("TCL: playlist -> downloaded", downloaded)
        if (downloaded > 0) {
            // size will be the amount already downloaded
            console.log('resuming from: ' + downloaded);

            // display the remaining bytes to download
            console.log('remaining bytes: ' + info.size);
        }
        console.log('*playlist_index*: ', `#0${info.playlist_index}`, info._filename, info.format_note);
        video.on('complete', function complete(info) {
            'use strict';
            console.log('filename: ' + info._filename + ' already downloaded.');
        });
        video.pipe(fs.createWriteStream(output))
        // Will be called if download was already completed and there is nothing more to download.
    })

    let pos = 0
    video.on('data', function data(chunk) {
        pos += chunk.length
        // `size` should not be 0 here.
        if (size) {
            let percent = (pos / size * 100).toFixed(2)
            process.stdout.cursorTo(0)
            process.stdout.clearLine(1)
            process.stdout.write(percent + '%')
        }
    })

    video.on('end', function () {
        console.log('finished downloading!');
    });
    video.on('next', playlist)
}

playlist('https://www.youtube.com/playlist?list=PLWKjhJtqVAbnZtkAI3BqcYxKnfWn_C704')


const port = process.env.PORT || 3000;


server.listen(port, () => {
    console.log(`we are listen to port ${port}`);
})