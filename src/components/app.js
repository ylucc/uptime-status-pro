import React, { useMemo, useState, createContext } from 'react';
import Link from './link';
import Header from './header';
import UptimeRobot from './uptimerobot';
import Package from '../../package.json';
import Login from './Login'; // 引入 Login 组件

export const MonitorContext = createContext();

function App() {
  const [totalSites, setTotalSites] = useState(0);
  const [upSites, setUpSites] = useState(0);
  const [downSites, setDownSites] = useState(0);
  const [loggedIn, setLoggedIn] = useState(false); // 登录状态

  const apikeys = useMemo(() => {
    const { ApiKeys } = window.Config;
    if (Array.isArray(ApiKeys)) return ApiKeys;
    if (typeof ApiKeys === 'string') return [ApiKeys];
    return [];
  }, []);

  const handleLogin = () => {
    setLoggedIn(true); // 设置登录状态
  };

  return (
    <MonitorContext.Provider value={{ totalSites, setTotalSites, upSites, setUpSites, downSites, setDownSites }}>
      <Header />
      <div className='container'>
        {loggedIn ? ( // 根据登录状态显示内容
          <div id='uptime'>
            {apikeys.map((key) => (
              <UptimeRobot key={key} apikey={key} />
            ))}
          </div>
        ) : (
          <Login onLogin={handleLogin} /> // 显示登录组件
        )}
        <div id="footer">
          <div className='container'>
            <div className='left'>
              基于 <Link to='https://uptimerobot.com/' text='UptimeRobot' /> 接口制作，检测频率 5 分钟
            </div>
            <div className='right'>
              &copy; 2020~2025 <Link to='https://mjmjj.us.kg' text='MJMJJ网站监控' />, Version {Package.version}
            </div>
          </div>
        </div>
      </div>
    </MonitorContext.Provider>
  );
}

export default App;