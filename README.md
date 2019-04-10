# YES HTTPS!

[![Build Status](https://circleci.com/gh/JustinBeckwith/yes-https.svg?style=shield)](https://circleci.com/gh/JustinBeckwith/yes-https)
[![npm version](https://badge.fury.io/js/yes-https.svg)](https://badge.fury.io/js/yes-https)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

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
```

### Ignoring specific requests

In some cases, you may want to ignore a request and not force the redirect.  You can use the `ignoreFilter` option to opt out of redirects on a case by case basis.  This is useful if you want to ignore a specific route:

```js
app.use(yes({
  ignoreFilter: (req) => {
    return (req.url.indexOf('/_ah/health') > -1);
  }
}));
```

## Contributing

Pull requests welcomed!
