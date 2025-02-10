const fs = require('fs');
const logFile = fs.createWriteStream('server.log', { flags: 'a' });
const log = (message) => {
  logFile.write(`${new Date().toISOString()} - ${message}\n`);
  console.log(message);
};

app.post('/ssl-info', async (req, res) => {
  const domains = req.body.domains;
  if (!domains || !Array.isArray(domains)) {
    log('Domains parameter is required and must be an array');
    return res.status(400).json({ error: 'Domains parameter is required and must be an array' });
  }

  const results = [];
  for (const domain of domains) {
    try {
      log(`Resolving domain: ${domain}`);
      await dns.promises.resolve(domain);
      const ssl = await sslChecker(domain);
      log(`SSL info for ${domain}: ${JSON.stringify(ssl)}`);
      results.push({
        domain,
        status: ssl.valid ? 'valid' : 'invalid',
        validFrom: ssl.validFrom,
        validTo: ssl.validTo,
        daysRemaining: ssl.daysRemaining
      });
    } catch (error) {
      log(`Error checking SSL for ${domain}: ${error.message}`);
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
  log(`Server is running on port ${PORT}`);
});