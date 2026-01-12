# Zabbix Dashboard

这是一个美观、大气、上档次的Zabbix监控仪表板项目，包含汇总页面和主机页面。

## 功能特性

- **汇总页面**：显示整体系统状态概览
- **主机页面**：详细显示各个主机的监控数据
- **响应式设计**：适配不同屏幕尺寸
- **实时更新**：动态展示最新监控数据
- **可视化图表**：使用图表直观展示数据
- **现代化UI**：采用渐变色彩和动画效果
- **交互体验**：支持主机搜索、筛选和详情查看

## 页面结构

- `index.html` - 汇总页面
- `hosts.html` - 主机页面
- `css/style.css` - 样式文件
- `js/script.js` - JavaScript逻辑
- `js/zabbix-api.js` - Zabbix API交互模块

## 快速开始

### 方法一：使用启动脚本

```bash
cd /workspace/zabbix-dashboard
./start.sh
```

然后在浏览器中打开 `http://localhost:8000`

### 方法二：手动启动

如果您的系统没有bash，可以直接使用Python启动HTTP服务：

```bash
cd /workspace/zabbix-dashboard
python3 -m http.server 8000
```

然后在浏览器中打开 `http://localhost:8000`

## 配置说明

### Zabbix API 配置

项目默认连接本地Zabbix服务 (`http://localhost/zabbix/api_jsonrpc.php`)，
您可以通过修改以下localStorage项来自定义配置：

```javascript
localStorage.setItem('zabbix_api_url', 'your_zabbix_api_url');
localStorage.setItem('zabbix_username', 'your_username');
localStorage.setItem('zabbix_password', 'your_password');
```

## 设计亮点

1. **现代化UI设计**
   - 使用渐变色彩方案
   - 流畅的过渡动画
   - 响应式布局设计

2. **数据可视化**
   - 环形图展示主机状态分布
   - 折线图展示趋势变化
   - 条形图展示资源使用情况

3. **用户体验**
   - 直观的状态指示
   - 清晰的告警信息
   - 便捷的搜索筛选功能

## 文件结构

```
zabbix-dashboard/
├── index.html          # 汇总页面
├── hosts.html          # 主机页面
├── css/
│   └── style.css       # 样式文件
├── js/
│   ├── script.js       # 主要业务逻辑
│   └── zabbix-api.js   # Zabbix API交互
└── start.sh            # 启动脚本
```