# YES HTTPS!

`yes-https` is a happy little npm module that makes it easy to require `https` for your connect based application.  

It does this two ways:
- Setting the `Strict-Transport-Security` HTTP header.  Learn more at [OWASP](https://www.owasp.org/index.php/HTTP_Strict_Transport_Security_Cheat_Sheet). 
- Automatically sending an HTTP 301 for the first request.  This is often overlooked, as HSTS only works after the browser hits the https endpoint the first time.  

## Installation

`npm install --save yes-https`

## Usage

```js
const yes = require('yes-https');
const express = require('express');

let app = express();

// Use the yes-https connect middleware.  Note - this will only work if NODE_ENV is set to production.
app.use(yes());

app.get('/', (req, res) => {
  res.end('Thanks for checking it out!');
});

const server = app.listen(process.env.PORT || 3000, () => {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
```

You can also set a few settings with the middleware to control the header:

```js
app.use(yes({
  maxAge: 86400,            // defaults `86400`
  includeSubdomains: true,  // defaults `true`
  preload: true             // defaults `true`           
}));

## Contributing
Pull requests welcomed!  I'm using yarn here, so please make sure to use `yarn add` or `yarn install` when adding new dependencies (and of course include changes to `yarn.lock`);

