import express from 'express';
import cors from 'cors';
import bodyParser from "body-parser";
import md5 from "md5";
import fs from "fs";

const app = express();

app.use(bodyParser.raw({type:'application/octet-stream', limit:'100kb'}));

app.use(cors({
    origin: 'http://127.0.0.1:5173',
}));

app.post('/upload', (req, res) => {
    const { name,currentChunkIndex,totalChunks } = req.query;
    const firstChunk = parseInt(currentChunkIndex) === 0;
    const lastChunk = parseInt(currentChunkIndex) === parseInt(totalChunks) - 1;
    const ext = name.split('.').pop();
    const data = req.body.toString().split(',')[1];
    const buffer = new Buffer(data, 'base64');
    const tmpFilename = 'tmp_' + md5(name + req.ip) + '.' + ext;
    if (firstChunk && fs.existsSync('./uploads/'+tmpFilename)) {
        fs.unlinkSync('./uploads/'+tmpFilename);
    }

    fs.appendFileSync('./uploads/'+tmpFilename, buffer);
    if (lastChunk) {
        fs.renameSync('./uploads/'+tmpFilename, './uploads/'+name);
    }

    res.json('ok');
});

app.listen('3000', () => {
    console.info('server is running');
});
