const fs = require('fs');

const Response = require('./lib/response');
const {loadTemplate} = require('./lib/viewTemplate');
const CONTENT_TYPES = require('./lib/mimeTypes');

const STATIC_FOLDER = `${__dirname}/public`;

const serveStaticFile = function (req) {
  const path = `${STATIC_FOLDER}${req.url}`;
  const stat = fs.existsSync(path) && fs.statSync(path);

  if (!stat || !stat.isFile()) return new Response();
  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const contentType = CONTENT_TYPES[extension];

  const content = fs.readFileSync(path);
  const res = new Response();
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 200;
  res.body = content;

  return res;
};

const serveHomePage = function (req) {
  req.url = '/index.html';
  return serveStaticFile(req);
};

const serveGuestBookPage = function (req) {
  const comments = "";
  const guestBookPage = loadTemplate('guest-book.html', {comments});
  const res = new Response()
  res.setHeader('Content-Type', CONTENT_TYPES.html);
  res.setHeader('Content-Length', guestBookPage.length);
  res.statusCode = 200;
  res.body = guestBookPage;

  return res;
};

const findHandler = function (req) {
  if (req.method === 'GET' && req.url === '/') return serveHomePage;
  if (req.method === 'GET' && req.url === '/guest-book.html') return serveGuestBookPage;
  if (req.method === 'GET') return serveStaticFile;
  return new Response();
};

const processRequest = (req) => {
  const handler = findHandler(req);
  return handler(req);
}

module.exports = {processRequest};