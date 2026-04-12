import fs from 'node:fs';
import https from 'node:https';
import express from 'express';
import { describe, it } from 'mocha';
import request from 'supertest';
import yes from '../lib/index.js';

const TEST_SERVER_CERT = fs.readFileSync('./test/certs/server.crt');

describe('yes', () => {
  it('should perform the 301 for an http request', (done) => {
    // Configure a minimal web server with the defaults
    const app = express();
    app.use(yes());
    app.get('/test', (_request_, response) => {
      response.sendStatus(200);
    });

    // Verify the request returns a 301
    request(app)
      .get('/test')
      .expect(301)
      .end((error) => {
        if (error) {
          throw error;
        }

        done();
      });
  });

  it('should use the correct defaults', (done) => {
    // Configure a minimal web server with the defaults
    const app = express();
    app.use(yes());
    app.get('/test', (_request, response) => {
      response.sendStatus(200);
    });

    // Verify the request returns the right header when using https
    const server = createSecureServer(app);
    request(server)
      .get('/test')
      .ca(TEST_SERVER_CERT)
      .expect('Strict-Transport-Security', 'max-age=86400; includeSubDomains')
      .expect(200)
      .end((error) => {
        if (error) {
          throw error;
        }
        done();
      });
  }).timeout(60_000);

  it('should allow disabling includeSubDomains with camel case options', (done) => {
    const app = express();
    app.use(
      yes({
        includeSubDomains: false,
      }),
    );
    app.get('/test', (_request, response) => {
      response.sendStatus(200);
    });

    const server = createSecureServer(app);
    request(server)
      .get('/test')
      .ca(TEST_SERVER_CERT)
      .expect('Strict-Transport-Security', 'max-age=86400')
      .expect(200)
      .end((error) => {
        if (error) {
          throw error;
        }
        done();
      });
  }).timeout(60_000);

  it('should allow disabling includeSubDomains with the legacy lowercase alias', (done) => {
    const app = express();
    app.use(
      yes({
        includeSubdomains: false,
      }),
    );
    app.get('/test', (_request, response) => {
      response.sendStatus(200);
    });

    const server = createSecureServer(app);
    request(server)
      .get('/test')
      .ca(TEST_SERVER_CERT)
      .expect('Strict-Transport-Security', 'max-age=86400')
      .expect(200)
      .end((error) => {
        if (error) {
          throw error;
        }
        done();
      });
  }).timeout(60_000);

  it('should ignore filtered requests', (done) => {
    // Configure a minimal web server with the defaults
    const app = express();
    app.use(
      yes({
        ignoreFilter: (request_) => request_.url.includes('/_ah/health'),
      }),
    );

    app.get('/_ah/health', (_request, response) => {
      response.sendStatus(200);
    });

    // Verify the request returns a 200 for health checks
    request(app)
      .get('/_ah/health')
      .expect(200)
      .end((error) => {
        if (error) {
          throw error;
        }

        done();
      });
  });

  it('should include preload when configured', (done) => {
    const app = express();
    app.use(yes({ preload: true }));
    app.get('/test', (_request, response) => {
      response.sendStatus(200);
    });

    const server = createSecureServer(app);
    request(server)
      .get('/test')
      .ca(TEST_SERVER_CERT)
      .expect(
        'Strict-Transport-Security',
        'max-age=86400; includeSubDomains; preload',
      )
      .expect(200)
      .end((error) => {
        if (error) {
          throw error;
        }
        done();
      });
  }).timeout(60_000);

  it('should omit includeSubDomains when disabled', (done) => {
    const app = express();
    app.use(yes({ includeSubDomains: false }));
    app.get('/test', (_request, response) => {
      response.sendStatus(200);
    });

    const server = createSecureServer(app);
    request(server)
      .get('/test')
      .ca(TEST_SERVER_CERT)
      .expect('Strict-Transport-Security', 'max-age=86400')
      .expect(200)
      .end((error) => {
        if (error) {
          throw error;
        }
        done();
      });
  }).timeout(60_000);

  it('should include includeSubDomains when explicitly enabled', (done) => {
    const app = express();
    app.use(yes({ includeSubDomains: true }));
    app.get('/test', (_request, response) => {
      response.sendStatus(200);
    });

    const server = createSecureServer(app);
    request(server)
      .get('/test')
      .ca(TEST_SERVER_CERT)
      .expect('Strict-Transport-Security', 'max-age=86400; includeSubDomains')
      .expect(200)
      .end((error) => {
        if (error) {
          throw error;
        }
        done();
      });
  }).timeout(60_000);

  describe('includeSubDomains', () => {
    it('should include the directive by default over a secure connection', () => {
      return expectSecureHeader({}, 'max-age=86400; includeSubDomains');
    });

    it('should include the directive when explicitly enabled over a secure connection', () => {
      return expectSecureHeader(
        { includeSubDomains: true },
        'max-age=86400; includeSubDomains',
      );
    });

    it('should omit the directive when disabled over a secure connection', () => {
      return expectSecureHeader({ includeSubDomains: false }, 'max-age=86400');
    });

    it('should compose correctly with preload and maxAge when enabled', () => {
      return expectSecureHeader(
        { includeSubDomains: true, preload: true, maxAge: 31_536_000 },
        'max-age=31536000; includeSubDomains; preload',
      );
    });

    it('should compose correctly with preload and maxAge when disabled', () => {
      return expectSecureHeader(
        { includeSubDomains: false, preload: true, maxAge: 31_536_000 },
        'max-age=31536000; preload',
      );
    });

    it('should include the directive by default for forwarded https requests', () => {
      return expectForwardedSecureHeader(
        {},
        'max-age=86400; includeSubDomains',
      );
    });

    it('should honor an explicit true value for forwarded https requests', () => {
      return expectForwardedSecureHeader(
        { includeSubDomains: true },
        'max-age=86400; includeSubDomains',
      );
    });

    it('should honor an explicit false value for forwarded https requests', () => {
      return expectForwardedSecureHeader(
        { includeSubDomains: false },
        'max-age=86400',
      );
    });
  });
});

function createSecureServer(app) {
  return https.createServer(
    {
      key: fs.readFileSync('./test/certs/server.key'),
      cert: fs.readFileSync('./test/certs/server.crt'),
    },
    app,
  );
}

function expectSecureHeader(options, expectedHeader) {
  const app = express();
  app.use(yes(options));
  app.get('/test', (_request, response) => {
    response.sendStatus(200);
  });

  const server = createSecureServer(app);
  return request(server)
    .get('/test')
    .ca(TEST_SERVER_CERT)
    .expect('Strict-Transport-Security', expectedHeader)
    .expect(200);
}

function expectForwardedSecureHeader(options, expectedHeader) {
  const app = express();
  app.use(yes(options));
  app.get('/test', (_request, response) => {
    response.sendStatus(200);
  });

  return request(app)
    .get('/test')
    .set('X-Forwarded-Proto', 'https')
    .set('Host', 'example.com')
    .expect('Strict-Transport-Security', expectedHeader)
    .expect(200);
}
