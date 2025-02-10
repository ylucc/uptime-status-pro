const https = require('node:https');

const checkPort = (port) =>
    !isNaN(parseFloat(port)) && Math.sign(port) === 1;

const getDaysBetween = (validFrom, validTo) =>
    Math.round(Math.abs(+validFrom - +validTo) / 8.64e7);

const getDaysRemaining = (validFrom, validTo) => {
    if (!validFrom || !validTo) {
        return 0;
    }

    const daysRemaining = getDaysBetween(validFrom, validTo);

    if (new Date(validTo).getTime() < new Date().getTime()) {
        return -daysRemaining;
    }

    return daysRemaining;
};

const DEFAULT_OPTIONS = {
    agent: new https.Agent({
        maxCachedSessions: 0,
    }),
    method: 'GET',
    port: 443,
    rejectUnauthorized: false,
    headers: {
        'User-Agent': 'MeuSSLBot/1.0',
    }
};

const sslChecker = (host, options = {}) =>
    new Promise((resolve, reject) => {
        options = Object.assign({}, DEFAULT_OPTIONS, options);

        if (!checkPort(options.port)) {
            reject(new Error('Invalid port: Port must be a positive number'));
            return;
        }

        try {
            const req = https.request(
                { host, ...options },
                (res) => {
                    let {
                        valid_from,
                        valid_to
                    } = res.socket.getPeerCertificate();
                    res.socket.destroy();

                    console.log(`Certificate for ${host}: valid_from=${valid_from}, valid_to=${valid_to}`);

                    if (!valid_from || !valid_to) {
                        reject(new Error('No certificate: Missing required certificate fields'));
                        return;
                    }

                    const validTo = new Date(valid_to);
                    const sslInfo = {
                        validFrom: new Date(valid_from).toISOString() || null,
                        validTo: validTo.toISOString() || null,
                        daysRemaining: getDaysRemaining(new Date(), validTo),
                        valid: res.socket.authorized || false
                    };

                    resolve(sslInfo);
                }
            );

            req.on('error', (err) => {
                reject(new Error(`Request error: ${err.message}`));
            });
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timed out'));
            });
            req.end();
        } catch (e) {
            reject(new Error(`Unexpected error: ${e.message}`));
        }
    });

module.exports = sslChecker;