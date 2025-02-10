import ReactTooltip from 'react-tooltip';
import { useEffect, useState, useContext } from 'react';
import { GetMonitors } from '../common/uptimerobot';
import { formatDuration, formatNumber } from '../common/helper';
import Link from './link';
import { MonitorContext } from './app';

function UptimeRobot({ apikey }) {
  const status = {
    ok: '正常运行',
    down: '无法访问',
    unknow: '未知状态'
  };

  const { CountDays, ShowLink } = window.Config;

  const [monitors, setMonitors] = useState([]);
  const [sslInfo, setSslInfo] = useState({});

  const { totalSites, setTotalSites, upSites, setUpSites, downSites, setDownSites } = useContext(MonitorContext);

  useEffect(() => {
    GetMonitors(apikey, CountDays).then((data) => {
      setMonitors(data);

      let up = data.filter((monitor) => monitor.status === 'ok').length;
      let down = data.filter((monitor) => monitor.status === 'down').length;

      setTotalSites(prevTotal => prevTotal + data.length);
      setUpSites(prevUp => prevUp + up);
      setDownSites(prevDown => prevDown + down);

      data.forEach((site) => {
        const url = new URL(site.url);
        const domain = url.hostname;

        fetch(`https://api.jmjm.tk/api/sslinfo/?url=${domain}`)
          .then(response => response.json())
          .then(info => {
            if (info.code === 200) {
              setSslInfo(prevState => ({
                ...prevState,
                [domain]: info.data
              }));
            }
          })
          .catch(error => {
            console.error(`Error fetching SSL info for ${domain}:`, error);
          });
      });
    }).catch(error => {
      console.error('Error fetching monitors:', error);
    });
  }, [apikey, CountDays, setTotalSites, setUpSites, setDownSites]);

  if (monitors.length === 0) {
    return (
      <div className='site'>
        <div className='loading' />
      </div>
    );
  }

  return monitors.map((site) => {
    const url = new URL(site.url);
    const domain = url.hostname;
    const ssl = sslInfo[domain] || {};

    return (
      <div key={site.id} className='site'>
        <div className='meta'>
          <span className='name' dangerouslySetInnerHTML={{ __html: site.name }} />
          {ShowLink && (
            <>
              <Link className='link' to={site.url} text={site.name} />
              &nbsp; {/* 添加空格 */}
              {ssl.remaining_days !== undefined ? (
                <span className='ssl-info' data-tip={`到期时间: ${ssl.valid_to}`} data-for={`tooltip-${site.id}`} onClick={() => ReactTooltip.show(document.getElementById(`tooltip-${site.id}`))}>
                  (证书剩余: {ssl.remaining_days}天)
                </span>
              ) : (
                <span className='ssl-info'>(无证书)</span>
              )}
              <ReactTooltip id={`tooltip-${site.id}`} place='top' type='dark' effect='solid' />
            </>
          )}
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
    );
  });
}

export default UptimeRobot;