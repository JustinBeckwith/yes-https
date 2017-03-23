module.exports = function (options) {
  options = options ? options : {};
  const maxAge = options.maxAge ? options.maxAge : 86400;
  const includeSubDomains = options.includeSubDomains !== undefined ? options.includeSubdomains : true;
  
  return function yes(req, res, next) {
    const secure = req.connection.encrypted || (req.get('X-Forwarded-Proto') === "https");
    const prod = process.env.NODE_ENV === "production";
    const healthCheck = req.url.indexOf('/_ah/health') !== -1;
    const cron = req.get('X-Appengine-Cron') === "true";

    if (!secure && prod && !healthCheck && !cron) {
      res.writeHead(301, {
        Location: 'https://' + req.get('host') + req.url
      });
      res.end();
    } else {
      let header = 'max-age=' + maxAge;
      if (includeSubDomains) header += '; includeSubDomains';
      if (options.preload) header += '; preload';
      res.setHeader('Strict-Transport-Security', header);
      next();
    }
  }
};
