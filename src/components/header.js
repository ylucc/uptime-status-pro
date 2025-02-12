import { useEffect, useContext } from 'react';
import Link from './link';
import { MonitorContext } from './app';

function Header() {
  const { totalSites, upSites, downSites } = useContext(MonitorContext);

useEffect(() => {
    document.title = window.Config.SiteName;

    var imageUrl = window.Config.Image;
    var colorCode = window.Config.color;

    if (imageUrl) {
      document.body.setAttribute(
        'style',
        "background: url('" + imageUrl + "') no-repeat center center fixed;background-size: cover;"
      );
    } else {
      document.body.setAttribute(
        'style',
        "background: " + colorCode + ";"
      );
    }
  }, []);

  return (
    <div id='header'>
      <div className='container'>
        <h1 className='logo'>{window.Config.SiteName}</h1>
        <div className='navi'>
          {window.Config.Navi.map((item, index) => (
            <Link key={index} to={item.url} text={item.text} />
          ))}
        </div>
      </div>

      <div className='status-top'>
        <div className='status-tip' id='status-tip'></div>
        <p className='status-text' id='status-text'>站点状态加载中</p>
        <p className='status-text' id='status-down'>部分站点无法运行</p>
        <p className='status-time' id='status-time-up'>上次更新于&nbsp;<span id='status-last-time'>00&nbsp;:&nbsp;00</span>&emsp;|&emsp;检测频率&nbsp;5&nbsp;分钟</p>
      </div>

      <div className='stats' style={{ textAlign: 'center', marginTop: '20px' }}>
        <div style={{ color: '#4a86e8' }}>网站: {totalSites}</div>
        <div style={{ color: '#3bd672' }}>正常: {upSites}</div>
        <div style={{ color: '#DE484A' }}>异常: {downSites}</div>
      </div>
    </div>
  );
}

export default Header;