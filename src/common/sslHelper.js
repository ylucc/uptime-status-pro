// sslHelper.js
import axios from 'axios';
import moment from 'moment';

// 获取SSL证书信息函数
export const getSSLCertificateExpiry = async (url) => {
  try {
    const response = await axios.get(`https://api.example.com/ssl-check?url=${encodeURIComponent(url)}`);
    return response.data.expiryDate; // 假设API返回的过期时间字段是expiryDate
  } catch (error) {
    console.error('Error fetching SSL certificate expiry:', error);
    return '获取失败';
  }
};

// 计算距离证书过期的天数函数
export const calculateDaysUntilExpiry = (expiryDate) => {
  const now = moment();
  const expiry = moment(expiryDate);
  return expiry.diff(now, 'days');
};