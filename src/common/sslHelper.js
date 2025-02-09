import axios from 'axios';

// 提取域名的函数
const extractDomain = (url) => {
  let domain = url.replace(/^https?:\/\//, ''); // 去除 http:// 或 https:// 前缀
  domain = domain.split('/')[0]; // 去除路径部分，只保留域名
  return domain;
}

// 获取SSL证书信息函数
export const getSSLInfo = async (url) => {
  try {
    const domain = extractDomain(url);
    const response = await axios.get(`http://api.jmjm.tk/api/sslinfo/?url=${encodeURIComponent(domain)}`);
    const data = response.data.data;

    if (data) {
      return {
        domain: data.domain,
        valid_from: data.valid_from,
        valid_to: data.valid_to,
        remaining_days: data.remaining_days,
        is_expired: data.is_expired
      };
    } else {
      return { error: '无证书' };
    }
  } catch (error) {
    console.error('Error fetching SSL certificate information:', error);
    return { error: '无法获取证书信息' };
  }
};