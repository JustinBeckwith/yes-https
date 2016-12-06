module.exports = function (options) {
  options = options ? options : {};
  let maxAge = options.maxAge ? options.maxAge : 86400;
  let includeSubDomains = options.includeSubDomains !== undefined ? options.includeSubdomains : true;
  
  return function yes(req, res, next) {
    let secure = req.connection.encrypted || (req.get('X-Forwarded-Proto') === "https");
    if (!secure && process.env.NODE_ENV === "production") {
      res.writeHead(301, {
        Location: 'https://' + req.get('host') + req.url
      });
      res.end();
    } else {
      let header = 'max-age=' + maxAge;
      if (includeSubDomains) header += '; includeSubDomains'
      if (options.preload) header += '; preload'
      res.setHeader('Strict-Transport-Security', header);
      next();
    }
  }
}