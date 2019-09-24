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
app.use(bodyParser.urlencoded({ extended: false }));
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

app.get('/', async (req, res, next) => {
    res.write('<html>')
    res.write('<head> <title> welcome to ytdl </title>')
    res.write('<body> <form action="/" method="POST"> <input type="text" name="url" ><button type="submit" >download</button></form> </body>')
    res.write('</html>')
    res.end()
})
app.post('/', async (req, res, next) => {
    // res.download('./downloads/7.jpg')
    console.log('body: ==== ', req.body.url)
    async function playlist(url) {

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
        const getbody = [];
        await video.on('info', async function (info) {
            try {
                size = info.size;
                var dir = __dirname + `/downloads/${info.playlist_uploader}/${info.playlist}/`;
                fse.ensureDirSync(dir);
                let fulltitle = info.fulltitle;
                let newName = fulltitle.replace(/\//g, "-");
                var output = path.join(__dirname + `/downloads/${info.playlist_uploader}/${info.playlist}/#0${info.playlist_index} ${newName}.mp4`);
                console.log(`playlist: ${info.playlist} - video:  #0${info.playlist_index} ${info.fulltitle}`);
                await video.pipe(fs.createWriteStream(output));

                // var output = path.join(__dirname + `#0${info.playlist_index} ` + `${newName}` + '.mp4');
                // video.pipe(fs.createReadStream(output));

            }
            catch (error) {
                console.log("TCL: playlist -> error", error)

            }
        }
        );

        var pos = 0;
        await video.on('data', function data(chunk) {
            pos += chunk.length;
            // `size` should not be 0 here.
            if (size) {
                var percent = (pos / size * 100).toFixed(2);
                process.stdout.cursorTo(0);
                process.stdout.clearLine(1);
                process.stdout.write(percent + '%');
            }
            getbody.push(chunk);
        });

        // console.log(video.on('end' , function(){}));
        video.on('end', function () {
            // console.log('===================')
            // res.contentType('video/mp4');
            // console.log('getbody => ', getbody);
            // console.log(res);
            // const dataconcat = Buffer.concat(getbody).toString();
            // console.log("TCL: playlist -> dataconcat", dataconcat)
            // res.send(dataconcat);
            
            // for (videos of getbody) {
            //     res.contentType('video/mp4');
            //     // res.send(video)
            //     video.pipe(videos)
            // }
            console.log('finished downloading!');
        });
        video.on('next', playlist);

    }


    playlist(req.body.url)


    // res.end(req.body.url)
});


module.exports = app;
