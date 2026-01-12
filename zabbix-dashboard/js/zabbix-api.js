// Zabbix API 交互模块
class ZabbixAPI {
    constructor(url, username, password) {
        this.url = url || 'http://localhost/zabbix/api_jsonrpc.php';
        this.username = username || 'Admin';
        this.password = password || 'zabbix';
        this.authToken = null;
    }

    // 登录获取认证令牌
    async login() {
        const params = {
            user: this.username,
            password: this.password
        };

        try {
            const response = await this.request('user.login', params);
            this.authToken = response.result;
            return this.authToken;
        } catch (error) {
            console.error('Zabbix登录失败:', error);
            throw error;
        }
    }

    // 发送API请求
    async request(method, params = {}) {
        const requestData = {
            jsonrpc: '2.0',
            method: method,
            params: params,
            id: Date.now()
        };

        // 如果有认证令牌，添加到请求中
        if (this.authToken) {
            requestData.auth = this.authToken;
        }

        const response = await fetch(this.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP错误: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(`Zabbix API错误: ${data.error.data} (${data.error.code})`);
        }

        return data;
    }

    // 获取主机列表
    async getHosts(filter = {}) {
        const params = {
            output: ['hostid', 'host', 'name', 'status', 'available'],
            selectGroups: ['groupid', 'name'],
            selectInterfaces: ['interfaceid', 'ip', 'dns', 'port', 'useip'],
            ...filter
        };

        try {
            if (!this.authToken) {
                await this.login();
            }
            const response = await this.request('host.get', params);
            return response.result;
        } catch (error) {
            console.error('获取主机列表失败:', error);
            throw error;
        }
    }

    // 获取主机组
    async getHostGroups() {
        const params = {
            output: ['groupid', 'name'],
            real_hosts: true
        };

        try {
            if (!this.authToken) {
                await this.login();
            }
            const response = await this.request('hostgroup.get', params);
            return response.result;
        } catch (error) {
            console.error('获取主机组失败:', error);
            throw error;
        }
    }

    // 获取问题（告警）
    async getProblems(time_from = null) {
        const params = {
            output: ['eventid', 'source', 'object', 'objectid', 'clock', 'value', 'acknowledged'],
            selectAcknowledges: ['userid', 'clock', 'message'],
            selectTags: ['tag', 'value'],
            source: 0, // 触发器
            object: 0, // 触发器
            sortfield: 'clock',
            sortorder: 'DESC',
            limit: 20
        };

        if (time_from) {
            params.time_from = time_from;
        }

        try {
            if (!this.authToken) {
                await this.login();
            }
            const response = await this.request('problem.get', params);
            return response.result;
        } catch (error) {
            console.error('获取问题列表失败:', error);
            throw error;
        }
    }

    // 获取触发器
    async getTriggers(hostids = null) {
        const params = {
            output: ['triggerid', 'description', 'priority', 'value', 'lastchange'],
            expandDescription: true,
            expandData: true,
            selectHosts: ['hostid', 'host', 'name']
        };

        if (hostids) {
            params.hostids = hostids;
        }

        try {
            if (!this.authToken) {
                await this.login();
            }
            const response = await this.request('trigger.get', params);
            return response.result;
        } catch (error) {
            console.error('获取触发器失败:', error);
            throw error;
        }
    }

    // 获取项目数据
    async getItems(hostids = null, itemKeys = []) {
        const params = {
            output: ['itemid', 'hostid', 'name', 'key_', 'value_type', 'units'],
            selectHosts: ['hostid', 'host']
        };

        if (hostids) {
            params.hostids = hostids;
        }

        if (itemKeys.length > 0) {
            params.filter = { key_: itemKeys };
        }

        try {
            if (!this.authToken) {
                await this.login();
            }
            const response = await this.request('item.get', params);
            return response.result;
        } catch (error) {
            console.error('获取项目数据失败:', error);
            throw error;
        }
    }

    // 获取历史数据
    async getHistory(itemids, time_from, time_till, period = 3600) {
        const params = {
            output: 'extend',
            itemids: Array.isArray(itemids) ? itemids : [itemids],
            time_from: time_from,
            time_till: time_till,
            sortfield: 'clock',
            sortorder: 'ASC'
        };

        try {
            if (!this.authToken) {
                await this.login();
            }
            const response = await this.request('history.get', params);
            return response.result;
        } catch (error) {
            console.error('获取历史数据失败:', error);
            throw error;
        }
    }
}

// 创建全局ZabbixAPI实例
let zabbixAPI;

// 初始化Zabbix API连接
function initZabbixAPI() {
    // 从配置或环境变量获取设置
    const config = {
        url: localStorage.getItem('zabbix_api_url') || 'http://localhost/zabbix/api_jsonrpc.php',
        username: localStorage.getItem('zabbix_username') || 'Admin',
        password: localStorage.getItem('zabbix_password') || 'zabbix'
    };

    zabbixAPI = new ZabbixAPI(config.url, config.username, config.password);
    
    return zabbixAPI;
}