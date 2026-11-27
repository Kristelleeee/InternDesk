const http = require('node:http');
const { readFile } = require('node:fs/promises');
const path = require('node:path');

const assets = new Map([
  ['/', ['index.html', 'text/html']],
  ['/styles.css', ['styles.css', 'text/css']],
  ['/app.js', ['app.js', 'text/javascript']],
]);

http.createServer(async (request, response) => {
  const asset = assets.get(request.url.split('?')[0]);
  if (!asset || !['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(404).end();
    return;
  }
  try {
    const contents = await readFile(path.join(__dirname, asset[0]));
    response.writeHead(200, { 'Content-Type': asset[1] + '; charset=utf-8' });
    response.end(request.method === 'HEAD' ? undefined : contents);
  } catch (error) {
    console.error(error);
    response.writeHead(500).end();
  }
}).listen(3000, '127.0.0.1', () => console.log('InternDesk is ready at http://127.0.0.1:3000'));
