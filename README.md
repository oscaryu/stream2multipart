# stream2multipart

Receive stream chunks and convert it into an easy to use object array.

Each element in the array is a section of part of the multipart download response.

## Quick start

npm install stream2multipart

````
const Stream2MultiPart = require('stream2multipart');
const axios = require('axios');
const fs = require('fs');

const config = {
    method: 'get',
    url: 'https://yourServerUrl',
    headers: {
        Authorization: 'Bearer add authentication and any other headers',
    },
    responseType: 'stream'  // This is important!
};

const path = '/Users/oscaryu/Downloads/';

axios(config).then(async (res) => {
    const parts = await Stream2MultiPart.getParts(res);
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

````
