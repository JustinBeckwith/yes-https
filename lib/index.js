import process from 'node:process';

// eslint-disable-next-line import/no-anonymous-default-export
export default function (options) {
	options = options || {};
	const maxAge = options.maxAge || 86_400;
	const includeSubDomains = options.includeSubDomains === undefined ? true : options.includeSubdomains;

	return function (request, response, next) {
		let ignoreRequest = (process.env.NODE_ENV !== 'production');
		const secure = request.connection.encrypted || (request.get('X-Forwarded-Proto') === 'https');

		if (options.ignoreFilter) {
			ignoreRequest = ignoreRequest || options.ignoreFilter(request);
		}

		if (ignoreRequest) {
			next();
			return;
		}

		if (secure) {
			let header = 'max-age=' + maxAge;
			if (includeSubDomains) {
				header += '; includeSubDomains';
			}

			if (options.preload) {
				header += '; preload';
			}

			response.setHeader('Strict-Transport-Security', header);
			next();
		} else {
			response.writeHead(301, {
				Location: 'https://' + request.get('host') + request.url,
			});
			response.end();
		}
	};
}
