import React, { useMemo, useState, createContext } from 'react';
import Link from './link';
import Header from './header';
import UptimeRobot from './uptimerobot';
import Package from '../../package.json';

export const MonitorContext = createContext();

function App() {
  const [totalSites, setTotalSites] = useState(0);
  const [upSites, setUpSites] = useState(0);
  const [downSites, setDownSites] = useState(0);
  const [unknownSites, setUnknownSites] = useState(0);

  const apikeys = useMemo(() => {
    const { ApiKeys } = window.Config;
    if (Array.isArray(ApiKeys)) return ApiKeys;
    if (typeof ApiKeys === 'string') return [ApiKeys];
    return [];
  }, []);

  return (
    <MonitorContext.Provider value={{ totalSites, setTotalSites, upSites, setUpSites, downSites, setDownSites, unknownSites, setUnknownSites }}>
      <Header />
      <div className='container'>
        <div id='uptime'>
          {apikeys.map((key) => (
            <UptimeRobot key={key} apikey={key} />
          ))}
        </div>
        <div id="footer">
          <div className='container'>
            <div className='left'>
              基于 <Link to='https://uptimerobot.com/' text='UptimeRobot' /> 接口制作，检测频率 5 分钟
            </div>
            <div className='right'>
              &copy; 2020~2025 <Link to='https://www.xh.sd' text='MJJ网站监控' />, Version {Package.version}
            </div>
          </div>
        </div>
      </div>
    </MonitorContext.Provider>
  );
}

export default App;