// Zabbix API interaction
class ZabbixAPI {
    constructor() {
        this.authManager = window.authManager;
    }

    async makeRequest(method, params = {}) {
        if (!this.authManager.isAuthenticated()) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${this.authManager.getServerUrl()}/api_jsonrpc.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: method,
                params: {
                    ...params
                },
                auth: this.authManager.getAuthToken(),
                id: Date.now()
            })
        });

        const data = await response.json();

        if (data.error) {
            if (data.error.code === -32602) {
                // Token might be expired, try to re-authenticate
                this.authManager.logout();
                throw new Error('Session expired. Please log in again.');
            }
            throw new Error(data.error.data || `API error: ${data.error.code}`);
        }

        return data.result;
    }

    // Get all hosts
    async getHosts(output = ['hostid', 'name', 'status', 'available'], selectGroups = ['name'], selectInterfaces = ['ip']) {
        return await this.makeRequest('host.get', {
            output: output,
            selectGroups: selectGroups,
            selectInterfaces: selectInterfaces,
            sortfield: 'name',
            sortorder: 'ASC'
        });
    }

    // Get host groups
    async getHostGroups(output = ['groupid', 'name']) {
        return await this.makeRequest('hostgroup.get', {
            output: output
        });
    }

    // Get triggers
    async getTriggers(hostids = null, output = ['triggerid', 'description', 'priority', 'state', 'lastchange']) {
        const params = {
            output: output,
            expandDescription: true,
            expandData: true,
            sortfield: 'lastchange',
            sortorder: 'DESC',
            limit: 10
        };

        if (hostids) {
            params.hostids = hostids;
        }

        return await this.makeRequest('trigger.get', params);
    }

    // Get problems
    async getProblems(timeSince = null, timeTill = null) {
        const params = {
            output: ['eventid', 'severity', 'clock'],
            selectAcknowledges: ['userid', 'clock'],
            selectTags: 'extend',
            objectids: [],
            source: 0, // Trigger
            eventsource: 0,
            sortfield: ['clock'],
            sortorder: 'DESC',
            limit: 10
        };

        if (timeSince) {
            params.time_from = timeSince;
        }
        if (timeTill) {
            params.time_till = timeTill;
        }

        return await this.makeRequest('problem.get', params);
    }

    // Get items for specific host
    async getItems(hostid, search = null) {
        const params = {
            output: ['itemid', 'name', 'key_', 'units', 'value_type'],
            hostids: hostid,
            search: search ? { name: search } : undefined,
            sortfield: 'name',
            sortorder: 'ASC'
        };

        return await this.makeRequest('item.get', params);
    }

    // Get historical data for item
    async getHistory(itemids, timeFrom, timeTill, limit = 100) {
        return await this.makeRequest('history.get', {
            output: 'extend',
            itemids: Array.isArray(itemids) ? itemids : [itemids],
            time_from: timeFrom,
            time_till: timeTill,
            limit: limit,
            sortfield: 'clock',
            sortorder: 'ASC'
        });
    }
}