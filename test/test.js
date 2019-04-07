const https = require('https');
const fs = require('fs');
const express = require('express');
const request = require('supertest');
const yes = require('../lib');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

describe('yes', () => {
	it('should perform the 301 for an http request', done => {
		// Configure a minimal web server with the defaults
		const app = express();
		app.use(yes());
		app.get('/test', (req, res) => {
			res.sendStatus(200);
		});

		// Verify the request returns a 301
		request(app)
			.get('/test')
			.expect(301)
			.end(err => {
				if (err) {
					throw err;
				}

				done();
			});
	});

	it('should use the correct defaults', done => {
		// Configure a minimal web server with the defaults
		const app = express();
		app.use(yes());
		app.get('/test', (req, res) => {
			res.sendStatus(200);
		});

		// Verify the request returns the right header when using https
		const server = createSecureServer(app);
		request('https://localhost:8443')
			.get('/test')
			.expect('Strict-Transport-Security', 'max-age=86400; includeSubDomains')
			.expect(200)
			.end(err => {
				if (err) {
					throw err;
				}

				server.close();
				done();
			});
	}).timeout(60000);

	it('should ignore filtered requests', done => {
		// Configure a minimal web server with the defaults
		const app = express();
		app.use(yes({
			ignoreFilter: req => {
				return (req.url.indexOf('/_ah/health') > -1);
			}
		}));

		app.get('/_ah/health', (req, res) => {
			res.sendStatus(200);
		});

		// Verify the request returns a 200 for health checks
		request(app)
			.get('/_ah/health')
			.expect(200)
			.end(err => {
				if (err) {
					throw err;
				}

				done();
			});
	});
});

function createSecureServer(app) {
	// Server the app over https
	return https.createServer({
		key: fs.readFileSync('./test/certs/server.key'),
		cert: fs.readFileSync('./test/certs/server.crt'),
		ca: fs.readFileSync('./test/certs/ca.crt'),
		requestCert: true,
		rejectUnauthorized: false
	}, app).listen('8443');
}
