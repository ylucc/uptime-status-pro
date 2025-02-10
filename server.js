const express = require('express');
const sslChecker = require('./sslChecker');
const dns = require('node:dns');
const app = express();

app.use(express.json());

app.post('/ssl-info', async (req, res) => {
    const domains = req.body.domains;
    if (!domains || !Array.isArray(domains)) {
        console.error('Domains parameter is required and must be an array');
        return res.status(400).json({ error: 'Domains parameter is required and must be an array' });
    }

    const results = [];
    for (const domain of domains) {
        try {
            console.log(`Resolving domain: ${domain}`);
            await dns.promises.resolve(domain);
            const ssl = await sslChecker(domain);
            console.log(`SSL info for ${domain}: `, ssl);
            results.push({
                domain,
                status: ssl.valid ? 'valid' : 'invalid',
                validFrom: ssl.validFrom,
                validTo: ssl.validTo,
                daysRemaining: ssl.daysRemaining
            });
        } catch (error) {
            console.error(`Error checking SSL for ${domain}: `, error.message);
            results.push({
                domain,
                error: error.message
            });
        }
    }

    res.json(results);
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});