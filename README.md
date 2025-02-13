# uptime-status-pro

一个基于 UptimeRobot API 的在线状态面板。

## 版本介绍

此版本是 https://github.com/yb/uptime-status 的修改美化版本。

![图片](http://fmc-75014.picgzc.qpic.cn/consult_viewer_pic__7f1c956f-adc2-40f1-bba4-25ec915f07a5_1739410968077.jpg)

美化了页面，添加了背景设置，添加了状态统计，添加了网站SSL证书的检测，添加了搜索功能。

演示：[www.xh.sd](https://www.xh.sd/)

## 事先准备

- 您需要先到 [UptimeRobot](https://uptimerobot.com/) 注册账号并添加站点监控。
- 然后获取API Key，打开：https://dashboard.uptimerobot.com/integrations 在最下面下面找到Main API keys，选择只读密钥Read-only API key，点击后面的+Create，然后复制保存起来。
![图片](http://fmc-75014.picgzc.qpic.cn/consult_viewer_pic__9817a71f-b309-45fe-9332-489fdb68af46_1739425603131.jpg)

## 如何部署：

- 推荐使用 vercel 或 netlify 部署。
- 克隆或Fork本仓库，具体姿势取决于你。
- 修改 `config.js` 文件：
   - `SiteName`: 要显示的网站名称
   - `ApiKeys`: 从 UptimeRobot 获取的 API Key（只读即可），Read-Only API Key。
   - `CountDays`: 要显示的日志天数，建议 60 或 90，显示效果比较好
   - `ShowLink`: 是否显示站点链接
   - `Image`: 背景图片，觉得背景花俏可以留空。
   - `color`: 背景颜色
   - `Navi`: 导航栏的菜单列表
- 傻瓜式部署到 vercel.com