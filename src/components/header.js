import { useEffect, useContext } from 'react';
import Link from './link';
import { MonitorContext } from './app';

function Header() {
  const { totalSites, upSites, downSites, unknownSites } = useContext(MonitorContext);

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
      <div className='stats' style={{ textAlign: 'center', marginTop: '20px' }}>
        <div style={{ color: '#4a86e8' }}>网站: {totalSites}</div>
        <div style={{ color: '#3bd672' }}>正常: {upSites}</div>
        <div style={{ color: '#DE484A' }}>异常: {downSites}</div>
        <div style={{ color: '#BBBBBB' }}>暂停: {unknownSites}</div>
      </div>
    </div>
  );
}

export default Header;