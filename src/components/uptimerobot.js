import ReactTooltip from 'react-tooltip';
import { useEffect, useState, useContext } from 'react';
import { GetMonitors } from '../common/uptimerobot';
import { formatDuration, formatNumber } from '../common/helper';
import Link from './link';
import { MonitorContext } from './app';
import { getSSLInfo } from '../common/sslHelper'; // 导入 sslHelper

function UptimeRobot({ apikey }) {
  const status = {
    ok: '正常运行',
    down: '无法访问',
    unknow: '未知状态'
  };

  const { CountDays, ShowLink } = window.Config;

  const [monitors, setMonitors] = useState([]);
  const [sslExpiry, setSSLExpiry] = useState({});

  const { totalSites, setTotalSites, upSites, setUpSites, downSites, setDownSites } = useContext(MonitorContext);

  useEffect(() => {
    GetMonitors(apikey, CountDays).then(async (data) => {
      setMonitors(data);

      let up = data.filter((monitor) => monitor.status === 'ok').length;
      let down = data.filter((monitor) => monitor.status === 'down').length;

      setTotalSites(prevTotal => prevTotal + data.length);
      setUpSites(prevUp => prevUp + up);
      setDownSites(prevDown => prevDown + down);

      const sslExpiryData = {};
      for (let monitor of data) {
        if (monitor.url) {
          const sslInfo = await getSSLInfo(monitor.url);
          sslExpiryData[monitor.id] = sslInfo;
        }
      }
      setSSLExpiry(sslExpiryData);
    });
  }, [apikey, CountDays, setTotalSites, setUpSites, setDownSites]);

  const handleExpiryClick = (id) => {
    if (sslExpiry[id] && sslExpiry[id].error) {
      alert(sslExpiry[id].error);
    } else {
      alert(`SSL证书将于 ${sslExpiry[id].valid_to} 过期`);
    }
  };

  const renderExpiryInfo = (id) => {
    if (sslExpiry[id] && sslExpiry[id].remaining_days !== undefined) {
      return `证书还有 ${sslExpiry[id].remaining_days} 天过期`;
    } else if (sslExpiry[id] && sslExpiry[id].error) {
      return sslExpiry[id].error;
    } else {
      return '无证书';
    }
  };

  if (monitors.length) return monitors.map((site) => (
    <div key={site.id} className='site'>
      <div className='meta'>
        <span className='name' dangerouslySetInnerHTML={{ __html: site.name }} />
        {ShowLink && <>
          <Link className='link' to={site.url} text={site.name} />
          {' '}
        </>}
        <span className='ssl-expiry' onClick={() => handleExpiryClick(site.id)}>
          {renderExpiryInfo(site.id)}
        </span>
        <div className='status-container'>
          <span className={'status-indicator ' + site.status}></span>
          <span className={'status ' + site.status}>{status[site.status]}</span>
        </div>
      </div>
      <div className='timeline'>
        {site.daily.map((data, index) => {
          let status = '';
          let text = data.date.format('YYYY-MM-DD ');
          if (data.uptime >= 100) {
            status = 'ok';
            text += `可用率 ${formatNumber(data.uptime)}%`;
          } else if (data.uptime <= 0 && data.down.times === 0) {
            status = 'none';
            text += '无数据';
          } else {
            status = 'down';
            text += `故障 ${data.down.times} 次，累计 ${formatDuration(data.down.duration)}，可用率 ${formatNumber(data.uptime)}%`;
          }
          return (<i key={index} className={status} data-tip={text} />)
        })}
      </div>
      <div className='summary'>
        <span>今天</span>
        <span>
          {site.total.times
            ? `最近 ${CountDays} 天故障 ${site.total.times} 次，累计 ${formatDuration(site.total.duration)}，平均可用率 ${site.average}%`
            : `最近 ${CountDays} 天可用率 ${site.average}%`}
        </span>
        <span>{site.daily[site.daily.length - 1].date.format('YYYY-MM-DD')}</span>
      </div>
      <ReactTooltip className='tooltip' place='top' type='dark' effect='solid' />
    </div>
  ));

  else return (
    <div className='site'>
      <div className='loading' />
    </div>
  );
}

export default UptimeRobot;