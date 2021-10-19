import process from 'node:process';
import express from 'express';
import yes from '../lib/index.js';

const app = express();

// Use the yes-https connect middleware.  Note - this will only work if NODE_ENV is set to production.
app.use(yes());

app.get('/', (request, response) => {
	response.end('Thanks for checking it out!');
});

const server = app.listen(process.env.PORT || 3000, () => {
	console.log('App listening on port %s', server.address().port);
	console.log('Press Ctrl+C to quit.');
});
