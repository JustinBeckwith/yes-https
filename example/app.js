const express = require('express');
const yes = require('../lib');

const app = express();

// Use the yes-https connect middleware.  Note - this will only work if NODE_ENV is set to production.
app.use(yes());

app.get('/', (req, res) => {
	res.end('Thanks for checking it out!');
});

const server = app.listen(process.env.PORT || 3000, () => {
	console.log('App listening on port %s', server.address().port);
	console.log('Press Ctrl+C to quit.');
});
