const yes = require('../lib/index.js');
const express = require('express');
const request = require('supertest');
const https = require('https');
const fs = require('fs');

process.env.NODE_TLS_REJECT_UNAUTHORIZED=0;

describe('yes', () => {
  it('should perform the 301 for an http request', (done) => {
    
    // configure a minimal web server with the defaults
    let app = express();
    app.use(yes());
    app.get('/test', (req, res) => {
      res.sendStatus(200);
    });

    // verify the request returns a 301
    request(app)
      .get('/test')
      .expect(301)
      .end((err, res) => {
        if (err) throw err;
        done();
      });
  });

  it('should use the correct defaults', (done) => {
    
    // configure a minimal web server with the defaults
    let app = express();
    app.use(yes());
    app.get('/test', (req, res) => {
      res.sendStatus(200);
    });

    // verify the request returns the right header when using https
    let server = createSecureServer(app);
    request('https://localhost:8443')
      .get('/test')
      .expect('Strict-Transport-Security', 'max-age=86400; includeSubDomains')  
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        done();
      });;
  }).timeout(60000);

  it('should ignore filtered requests', (done) => {
    
    // configure a minimal web server with the defaults
    let app = express();
    app.use(yes({
      ignoreFilter: (req) => {
        return (req.url.indexOf('/_ah/health') > -1); 
      }
    }));
    
    app.get('/_ah/health', (req, res) => {
      res.sendStatus(200);
    });

    // verify the request returns a 200 for health checks
    request(app)
      .get('/_ah/health')
      .expect(200)
      .end((err, res) => {
        if (err) throw err;
        done();
      });
  });
});


function createSecureServer(app) {
  // server the app over https
  return https.createServer({
    key: fs.readFileSync('./test/certs/server.key'),
    cert: fs.readFileSync('./test/certs/server.crt'),
    ca: fs.readFileSync('./test/certs/ca.crt'),
    requestCert: true,
    rejectUnauthorized: false
  }, app).listen('8443');
}
