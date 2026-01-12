// 主要业务逻辑
let statusChart, trendChart, hostStatusChart;

document.addEventListener('DOMContentLoaded', function() {
    initZabbixAPI();
});

// 加载汇总页面数据
async function loadOverviewData() {
    try {
        // 模拟数据 - 在实际应用中，这里应该调用真实的Zabbix API
        document.getElementById('total-hosts-count').textContent = '42';
        document.getElementById('problems-count').textContent = '3';
        document.getElementById('availability-percent').textContent = '98.7%';
        document.getElementById('uptime-average').textContent = '285天';

        // 创建状态图表
        const ctx1 = document.getElementById('statusChart').getContext('2d');
        if (statusChart) {
            statusChart.destroy();
        }
        statusChart = new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: ['正常', '警告', '问题', '未知'],
                datasets: [{
                    data: [35, 3, 2, 2],
                    backgroundColor: [
                        '#4CAF50',
                        '#FFC107',
                        '#F44336',
                        '#9E9E9E'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: '主机状态分布'
                    }
                }
            }
        });

        // 创建趋势图表
        const ctx2 = document.getElementById('trendChart').getContext('2d');
        if (trendChart) {
            trendChart.destroy();
        }
        trendChart = new Chart(ctx2, {
            type: 'line',
            data: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
                datasets: [
                    {
                        label: '正常主机数',
                        data: [30, 32, 35, 34, 36, 38, 35],
                        borderColor: '#4CAF50',
                        tension: 0.1,
                        fill: false
                    },
                    {
                        label: '问题主机数',
                        data: [5, 4, 2, 3, 1, 2, 3],
                        borderColor: '#F44336',
                        tension: 0.1,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: '主机状态趋势'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('加载汇总数据失败:', error);
        // 显示错误信息
        showError('加载数据失败，请检查网络连接和Zabbix API配置');
    }
}

// 加载告警数据
async function loadAlertsData() {
    try {
        // 模拟告警数据
        const alertsData = [
            { time: '2023-06-15 14:30:22', host: 'Web服务器01', problem: 'High CPU utilization', severity: 'high', status: 'open' },
            { time: '2023-06-15 13:45:10', host: '数据库服务器', problem: 'Disk space is low', severity: 'warning', status: 'open' },
            { time: '2023-06-15 12:20:05', host: '应用服务器02', problem: 'Memory usage too high', severity: 'high', status: 'closed' },
            { time: '2023-06-15 11:10:33', host: '负载均衡器', problem: 'Service is down', severity: 'disaster', status: 'open' },
            { time: '2023-06-15 10:05:17', host: '备份服务器', problem: 'Backup failed', severity: 'info', status: 'closed' }
        ];

        const tbody = document.getElementById('alerts-body');
        tbody.innerHTML = '';

        alertsData.forEach(alert => {
            const row = document.createElement('tr');
            
            // 根据严重性添加CSS类
            let severityClass = '';
            switch(alert.severity) {
                case 'disaster':
                    severityClass = 'severity-critical';
                    alert.severity = '灾难';
                    break;
                case 'high':
                    severityClass = 'severity-high';
                    alert.severity = '高';
                    break;
                case 'warning':
                    severityClass = 'severity-warning';
                    alert.severity = '警告';
                    break;
                case 'info':
                    severityClass = 'severity-info';
                    alert.severity = '信息';
                    break;
                default:
                    severityClass = 'severity-not-classified';
                    alert.severity = '未分类';
            }
            
            // 根据状态添加CSS类
            const statusClass = alert.status === 'open' ? 'status-problem' : 'status-active';
            const statusText = alert.status === 'open' ? '待处理' : '已解决';
            
            row.innerHTML = `
                <td>${alert.time}</td>
                <td>${alert.host}</td>
                <td>${alert.problem}</td>
                <td class="${severityClass}">${alert.severity}</td>
                <td class="${statusClass}">${statusText}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('加载告警数据失败:', error);
        showError('加载告警数据失败');
    }
}

// 加载主机页面数据
async function loadHostsData(filters = {}) {
    try {
        // 模拟主机数据
        const hostsData = [
            { hostid: '10001', name: 'Web服务器01', host: 'web-server-01', status: '0', available: '1', groups: [{name: 'Linux servers'}], ip: '192.168.1.10' },
            { hostid: '10002', name: '数据库服务器', host: 'db-server-01', status: '0', available: '1', groups: [{name: 'Database servers'}], ip: '192.168.1.20' },
            { hostid: '10003', name: '应用服务器01', host: 'app-server-01', status: '0', available: '1', groups: [{name: 'Application servers'}], ip: '192.168.1.30' },
            { hostid: '10004', name: '应用服务器02', host: 'app-server-02', status: '0', available: '0', groups: [{name: 'Application servers'}], ip: '192.168.1.31' },
            { hostid: '10005', name: '负载均衡器', host: 'lb-server-01', status: '0', available: '1', groups: [{name: 'Network devices'}], ip: '192.168.1.40' },
            { hostid: '10006', name: '备份服务器', host: 'backup-server-01', status: '1', available: '1', groups: [{name: 'Linux servers'}], ip: '192.168.1.50' },
            { hostid: '10007', name: '邮件服务器', host: 'mail-server-01', status: '0', available: '1', groups: [{name: 'Mail servers'}], ip: '192.168.1.60' },
            { hostid: '10008', name: '文件服务器', host: 'file-server-01', status: '0', available: '0', groups: [{name: 'File servers'}], ip: '192.168.1.70' }
        ];

        const grid = document.getElementById('hosts-grid');
        grid.innerHTML = '';

        hostsData.forEach(host => {
            const card = document.createElement('div');
            card.className = `host-card ${host.available === '1' ? 'status-available' : 'status-unavailable'}`;
            card.onclick = () => showHostDetails(host);
            
            const statusText = host.available === '1' ? '可用' : '不可用';
            const statusClass = host.available === '1' ? 'status-available' : 'status-unavailable';
            const icon = host.available === '1' ? '✅' : '❌';
            
            card.innerHTML = `
                <h3>${host.name}</h3>
                <div class="host-info">
                    <span>主机ID: ${host.hostid}</span>
                    <span>IP: ${host.ip}</span>
                </div>
                <div class="host-info">
                    <span>主机组: ${host.groups[0].name}</span>
                    <span>状态: <span class="host-status ${statusClass}">${statusText}</span></span>
                </div>
                <div style="margin-top: 15px; text-align: center;">
                    <span style="font-size: 2rem;">${icon}</span>
                </div>
            `;
            grid.appendChild(card);
        });
        
        // 初始化分页
        setupPagination(hostsData.length, 8);
    } catch (error) {
        console.error('加载主机数据失败:', error);
        showError('加载主机数据失败');
    }
}

// 设置分页
function setupPagination(totalItems, itemsPerPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    // 创建分页按钮
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.onclick = () => {
            // 这里可以实现分页功能
            console.log(`跳转到第 ${i} 页`);
        };
        pagination.appendChild(button);
    }
}

// 显示主机详情
function showHostDetails(host) {
    const modal = document.getElementById('host-modal');
    const title = document.getElementById('modal-title');
    const details = document.getElementById('host-details');
    
    title.textContent = `${host.name} - 详细信息`;
    
    details.innerHTML = `
        <div class="host-detail-item">
            <strong>主机名称:</strong> ${host.name}
        </div>
        <div class="host-detail-item">
            <strong>主机ID:</strong> ${host.hostid}
        </div>
        <div class="host-detail-item">
            <strong>主机别名:</strong> ${host.host}
        </div>
        <div class="host-detail-item">
            <strong>IP地址:</strong> ${host.ip}
        </div>
        <div class="host-detail-item">
            <strong>主机组:</strong> ${host.groups.map(g => g.name).join(', ')}
        </div>
        <div class="host-detail-item">
            <strong>状态:</strong> <span class="host-status ${host.available === '1' ? 'status-available' : 'status-unavailable'}">
                ${host.available === '1' ? '可用' : '不可用'}
            </span>
        </div>
        <div class="host-detail-item">
            <strong>监控状态:</strong> ${host.status === '0' ? '已启用' : '已禁用'}
        </div>
    `;
    
    modal.style.display = 'block';
    
    // 绘制主机状态图表
    setTimeout(() => {
        drawHostStatusChart(host);
    }, 100);
}

// 绘制主机状态图表
function drawHostStatusChart(host) {
    const ctx = document.getElementById('hostStatusChart').getContext('2d');
    if (hostStatusChart) {
        hostStatusChart.destroy();
    }
    
    // 模拟一些图表数据
    const data = {
        labels: ['CPU使用率', '内存使用率', '磁盘使用率', '网络流量'],
        datasets: [{
            label: '资源使用率 (%)',
            data: [75, 68, 82, 45],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)')
            ],
            borderWidth: 1
        }]
    };
    
    hostStatusChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `${host.name} 资源使用情况`
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// 加载主机组筛选器
async function loadGroupsFilter() {
    try {
        // 模拟主机组数据
        const groups = [
            { groupid: '1', name: 'Linux servers' },
            { groupid: '2', name: 'Windows servers' },
            { groupid: '3', name: 'Database servers' },
            { groupid: '4', name: 'Web servers' }
        ];
        
        const select = document.getElementById('group-filter');
        select.innerHTML = '<option value="">所有主机组</option>';
        
        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.groupid;
            option.textContent = group.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('加载主机组失败:', error);
    }
}

// 显示错误消息
function showError(message) {
    // 创建错误提示元素
    let errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 1001;
            max-width: 400px;
        `;
        document.body.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    
    // 3秒后自动隐藏
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}

// 关闭模态框
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('host-modal');
    const closeBtn = document.getElementById('close-modal');
    
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };
    
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    // 搜索功能
    const searchBtn = document.getElementById('search-btn');
    searchBtn.onclick = function() {
        const searchTerm = document.getElementById('host-search').value.toLowerCase();
        filterHosts(searchTerm);
    };
    
    // 回车键搜索
    document.getElementById('host-search').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = this.value.toLowerCase();
            filterHosts(searchTerm);
        }
    });
});

// 过滤主机
function filterHosts(searchTerm) {
    const cards = document.querySelectorAll('.host-card');
    cards.forEach(card => {
        const hostName = card.querySelector('h3').textContent.toLowerCase();
        if (hostName.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}