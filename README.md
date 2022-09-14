# stream2multipart

Receive stream chunks and convert it into an easy to use object array.

Each element in the array is a section of part of the multipart download response.

## Quick start

npm install stream2multipart

````
const Stream2MultiPart = require('stream2multipart');

const axios = require('axios');
const fs = require('fs');
const { StreamToBuffer } = require('./Stream2Buffer');

const config = {
    method: 'get',
    url: 'https://yourServerUrl',
    headers: {
        Authorization: 'Bearer add authentication and any other headers',
    },
    responseType: 'stream'  // This is important!
};

const path = '/Users/oscaryu/Downloads/';

axios(config).then((res) => {
    console.log(res)
    // res.data.pipe(fs.createWriteStream(`${path}public-test.pdf`)); // dump response data to file
    StreamToBuffer(res).then((parts) => {
        if (parts && parts.length) {
            parts.forEach((part) => {
                if (part.Filename) {
                    const wstream = fs.createWriteStream(`${path}${part.Filename}`);
                    wstream.write(part.Content);
                    wstream.end();
                    console.log(`Saved ${path}${part.Filename}`);
                } else if (part.ContentType === 'application/json') {
                    console.log(JSON.stringify(part.Content, null, 4));
                } else {
                    console.log(part.Content);
                }
            });
        }
    });
}).catch((err) => {
    console.log(err);
});

````
