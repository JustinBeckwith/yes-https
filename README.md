# YES HTTPS!

[![Build Status](https://github.com/JustinBeckwith/yes-https/actions/workflows/ci.yaml/badge.svg?branch=main)](https://github.com/JustinBeckwith/yes-https/actions/workflows/ci.yaml?query=branch%3Amain)
[![codecov](https://codecov.io/gh/JustinBeckwith/yes-https/branch/main/graph/badge.svg)](https://codecov.io/gh/JustinBeckwith/yes-https)
[![npm version](https://badge.fury.io/js/yes-https.svg)](https://badge.fury.io/js/yes-https)
[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)
[![Release Please](https://img.shields.io/badge/%E2%9A%99%EF%B8%8F-release--please-4285f4?style=flat)](https://github.com/googleapis/release-please)

![An armored bear holding a shield in a forest](./docs/assets/yes-https.png)

`yes-https` is a happy little npm module that makes it easy to require `https` for your connect based application.

It does this two ways:
- Setting the `Strict-Transport-Security` HTTP header.  Learn more at [OWASP](https://www.owasp.org/index.php/HTTP_Strict_Transport_Security_Cheat_Sheet).
- Automatically sending an HTTP 301 for the first request.  This is often overlooked, as HSTS only works after the browser hits the https endpoint the first time.

## Installation

`npm install yes-https`

## Usage

```js
import yes from 'yes-https';
import express from 'express';

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
  includeSubDomains: true,  // defaults `true`
  preload: true             // defaults `true`
}));
```

`includeSubDomains` is the canonical option name. For backwards
compatibility, `includeSubdomains` is also accepted, and both spellings
default to `true`.

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
