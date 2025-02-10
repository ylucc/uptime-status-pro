const express = require('express');
const fs = require('fs');
const path = require('path');
const https = require('node:https');
const dns = require('node:dns');
const app = express();

app.use(express.json());

const CACHE_FILE = path.join(__dirname, 'sslCache.json');

// 读取缓存文件
const readCache = () => {
    if (fs.existsSync(CACHE_FILE)) {
        const rawData = fs.readFileSync(CACHE_FILE);
        return JSON.parse(rawData);
    }
    return {};
};

// 保存缓存文件
const saveCache = (data) => {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
};

// 检查 SSL 信息的函数
const sslChecker = (host) => {
    return new Promise((resolve, reject) => {
        const options = {
            agent: new https.Agent({ maxCachedSessions: 0 }),
            method: 'GET',
            port: 443,
            rejectUnauthorized: false,
            headers: { 'User-Agent': 'MeuSSLBot/1.0' },
        };

        try {
            const req = https.request({ host, ...options }, (res) => {
                const { valid_from, valid_to } = res.socket.getPeerCertificate();
                res.socket.destroy();

                if (!valid_from || !valid_to) {
                    reject(new Error('No certificate: Missing required certificate fields'));
                    return;
                }

                const validTo = new Date(valid_to);
                const sslInfo = {
                    validFrom: new Date(valid_from).toISOString(),
                    validTo: validTo.toISOString(),
                    daysRemaining: Math.round((validTo - new Date()) / (1000 * 60 * 60 * 24)),
                    valid: res.socket.authorized || false,
                };

                resolve(sslInfo);
            });

            req.on('error', (err) => reject(new Error(`Request error: ${err.message}`)));
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timed out'));
            });
            req.end();
        } catch (e) {
            reject(new Error(`Unexpected error: ${e.message}`));
        }
    });
};

app.post('/ssl-info', async (req, res) => {
    const domains = req.body.domains;
    if (!domains || !Array.isArray(domains)) {
        return res.status(400).json({ error: 'Domains parameter is required and must be an array' });
    }

    const cache = readCache();
    const today = new Date().toISOString().split('T')[0];
    const results = [];

    for (const domain of domains) {
        if (cache[domain] && cache[domain].cachedDate === today) {
            results.push(cache[domain].data);
        } else {
            try {
                await dns.promises.resolve(domain);
                const ssl = await sslChecker(domain);
                const sslData = { domain, ...ssl };
                results.push(sslData);

                cache[domain] = { data: sslData, cachedDate: today };
                saveCache(cache);
            } catch (error) {
                results.push({ domain, error: `获取 ${domain} 的 SSL 信息时出错: ${error.message}` });
            }
        }
    }

    res.json(results);
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});