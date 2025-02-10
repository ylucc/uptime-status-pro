const http = require("node:http");
const https = require("node:https");

// 检查端口是否有效
const checkPort = (port) =>
    !isNaN(parseFloat(port)) && Math.sign(port) === 1;

// 计算两个日期之间的天数
const getDaysBetween = (validFrom, validTo) =>
    Math.round(Math.abs(+validFrom - +validTo) / 8.64e7);

// 计算距离证书到期的天数
const getDaysRemaining = (validFrom, validTo) => {
    if (!validFrom || !validTo) {
        return 0;
    }

    const daysRemaining = getDaysBetween(validFrom, validTo);

    // 如果证书已经过期，返回负数
    if (new Date(validTo).getTime() < new Date().getTime()) {
        return -daysRemaining;
    }

    return daysRemaining;
};

const DEFAULT_OPTIONS = {
    agent: new https.Agent({
        maxCachedSessions: 0, // 不缓存会话
    }),
    method: "GET",
    port: 443,
    rejectUnauthorized: false, // 不拒绝未经授权的证书
    headers: {
        "User-Agent": "MeuSSLBot/1.0", // 设置请求头
    }
};

// SSL 检查函数
const sslChecker = (host, options = {}) =>
    new Promise((resolve, reject) => {
        options = Object.assign({}, DEFAULT_OPTIONS, options);

        // 检查端口是否合法
        if (!checkPort(options.port)) {
            reject(new Error("Invalid port: Port must be a positive number"));
            return;
        }

        try {
            const req = https.request(
                {host, ...options},
                (res) => {
                    // 从证书中提取所需信息
                    let {
                        valid_from,
                        valid_to
                    } = res.socket.getPeerCertificate();
                    res.socket.destroy();

                    // 如果没有获取到必要的证书信息
                    if (!valid_from || !valid_to) {
                        reject(new Error("No certificate: Missing required certificate fields"));
                        return;
                    }

                    const validTo = new Date(valid_to);
                    const sslInfo = {
                        validFrom: new Date(valid_from).toISOString() || null, // 颁发日期
                        validTo: validTo.toISOString() || null, // 到期日期
                        daysRemaining: getDaysRemaining(new Date(), validTo), // 剩余天数
                        valid: res.socket.authorized || false // 证书是否有效
                    };

                    resolve(sslInfo); // 返回 SSL 信息
                }
            );

            req.on("error", (err) => {
                reject(new Error(`Request error: ${err.message}`)); // 处理请求错误
            });
            req.on("timeout", () => {
                req.destroy();
                reject(new Error("Request timed out")); // 处理请求超时
            });
            req.end();
        } catch (e) {
            reject(new Error(`Unexpected error: ${e.message}`)); // 处理意外错误
        }
    });

module.exports = sslChecker;