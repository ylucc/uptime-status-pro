const express = require('express');
const sslChecker = require('./sslChecker');
const dns = require('node:dns');
const app = express();

app.use(express.json());

app.post('/ssl-info', async (req, res) => {
    const domains = req.body.domains;
    if (!domains || !Array.isArray(domains)) {
        return res.status(400).json({ error: 'Domains parameter is required and must be an array' });
    }

    const results = [];
    for (const domain of domains) {
        try {
            await dns.promises.resolve(domain);
            const ssl = await sslChecker(domain);
            results.push({
                domain,
                status: ssl.valid ? 'valid' : 'invalid',
                validFrom: ssl.validFrom,
                validTo: ssl.validTo,
                daysRemaining: ssl.daysRemaining
            });
        } catch (error) {
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