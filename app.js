const http = require('http');

const express = require('express');
const app = express();
// app.use(express.json());
const bodyParser = require('body-parser');
const fs = require('fs')
const fse = require("fs-extra");
var path = require('path');
var ytdl = require('youtube-dl');



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin , X-Requested-With , Content-Type , Accept");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET , POST , PATCH , DELETE , OPTIONS"
    )
    next();
});


app.get('/' ,  (req , res , next)=> {
function playlist(url) {

    // await makeDir(__dirname+ '/uploads')
    'use strict';
    var video = ytdl(
        url,
        ['--format=22'],
    );

    console.log('waiting to get data');

    video.on('error', function error(err) {
        console.log('error 2:', err);
    });

    let size = 0
    video.on('info', function (info) {
        try {
            size = info.size;
            var dir = __dirname + `/downloads/${info.playlist_uploader}/${info.playlist}/`;
            fse.ensureDirSync(dir);
            let fulltitle = info.fulltitle;
            let newName = fulltitle.replace(/\//g, "-");
            var output = path.join(__dirname + '/downloads', `${info.playlist_uploader}/${info.playlist}/`, `#0${info.playlist_index} ` + `${newName}` + '.mp4');
            console.log(`playlist: ${info.playlist} - video:  #0${info.playlist_index} ${info.fulltitle}`);
            video.pipe(fs.createWriteStream(output));
            
            
            // var output = path.join(__dirname + `#0${info.playlist_index} ` + `${newName}` + '.mp4');
            // video.pipe(fs.createReadStream(output));

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

    video.on('end', function () {
        console.log('finished downloading!');
    });

    video.on('next', playlist);

}


playlist(req.body.url)


    // res.end(req.body.url)
});
    

module.exports = app;
