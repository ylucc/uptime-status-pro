import axios from 'axios';

// 获取SSL证书信息函数
export const getSSLInfo = async (domain) => {
  try {
    const response = await axios.get(`http://api.jmjm.tk/api/sslinfo/?url=${encodeURIComponent(domain)}`);
    const data = response.data.data;

    return {
      domain: data.domain,
      valid_from: data.valid_from,
      valid_to: data.valid_to,
      remaining_days: data.remaining_days,
      is_expired: data.is_expired
    };
  } catch (error) {
    console.error('Error fetching SSL certificate information:', error);
    return { error: 'Unable to retrieve certificate information' };
  }
};