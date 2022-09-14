const getBoundary = (res) => {
    const header = res.headers['content-type'];
    const items = header.split(';');
    if (items) {
        const item = items.filter((i) => i.indexOf('boundary') >= 0);
        if (item && item.length) {
            const k = item[0].split('=');
            return `--${k[1].trim().replace(/^["']|["']$/g, '')}`;
        }
    }
    return '';
}

const getParts = (res) => {
    const stream = res.data;
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => {
            const boundary = getBoundary(res);
            console.log('boundary', boundary);
            const buffer = Buffer.concat(chunks);
            // console.log('buffer', buffer.toString());
            let lastPos = 0;
            let pos = buffer.indexOf('\r\n');
            const data = [];
            const parts = [];

            let isContentReady = false;
            let sectionDisposition = '';
            let sectionType = '';
            let sectionData = '';
            let part = {};
            for (let i = 1; lastPos < buffer.length; i++) {
                pos = buffer.indexOf('\r\n', lastPos);
                const section = buffer.slice(lastPos, pos);
                lastPos = pos + 2;
                if (section.toString().trim().startsWith(boundary)) {
                    if (lastPos < pos + 3) {
                        // --------- Done ---------
                        resolve(parts);
                    } else {
                        // --------- New Section ---------
                        isContentReady = false;
                        part = {};
                    }
                } else if (section.toString() === '') {
                    // --------- Data is next ---------
                    isContentReady = true;
                } else if (isContentReady) {
                    sectionData = section;
                    try {
                        part.Content = part.ContentType === 'application/json' ? JSON.parse(section) : section;
                    } catch (err) {
                        console.log(part, section.toString().substring(0, 100), err);
                    }
                    parts[parts.length] = { ...part };
                    sectionType = '';
                    sectionDisposition = '';
                    isContentReady = false;
                } else if (section.toString().startsWith('Content-Type:')) {
                    sectionType = section.toString().slice(13, section.length).trim();
                    part.ContentType = sectionType;
                } else if (section.toString().startsWith('Content-Disposition:')) {
                    sectionDisposition = section.toString().slice(20, section.length).trim();
                    part.Disposition = sectionDisposition;
                    if (sectionDisposition.indexOf('filename=') >= 0) {
                        [, part.Filename] = sectionDisposition.split('filename=');
                        part.Filename = part.Filename.replace(/["']/g, '');
                    }
                }
            }
        });
    });
}

module.exports.getParts = getParts;
