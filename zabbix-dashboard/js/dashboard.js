// Dashboard functionality
class DashboardApp {
    constructor() {
        this.api = new ZabbixAPI();
        this.currentPage = window.location.pathname.split('/').pop();
        this.init();
    }

    async init() {
        try {
            if (this.currentPage === 'dashboard.html') {
                await this.loadDashboardData();
            } else if (this.currentPage === 'hosts.html') {
                await this.loadHostsPage();
            }
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            if (error.message.includes('Session expired')) {
                alert('Session expired. Please log in again.');
                window.authManager.logout();
            } else {
                alert(`Error loading dashboard: ${error.message}`);
            }
        }
    }

    async loadDashboardData() {
        // Load stats
        await this.loadStats();
        
        // Load charts
        await this.loadCharts();
        
        // Load alerts
        await this.loadAlerts();
    }

    async loadStats() {
        try {
            // Get total hosts
            const hosts = await this.api.getHosts(['hostid']);
            document.getElementById('totalHosts').textContent = hosts.length;
            
            // Calculate problem hosts
            const problemHosts = hosts.filter(host => host.status == 1).length;
            document.getElementById('problemHosts').textContent = problemHosts;
            
            // Calculate availability
            const availableHostsPercent = hosts.length > 0 
                ? Math.round(((hosts.length - problemHosts) / hosts.length) * 100) 
                : 0;
            document.getElementById('availableHosts').textContent = `${availableHostsPercent}%`;
            
            // Get trigger count
            const triggers = await this.api.getTriggers();
            document.getElementById('triggersCount').textContent = triggers.length;
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadCharts() {
        try {
            // Get host status distribution
            const hosts = await this.api.getHosts(['status']);
            const enabledCount = hosts.filter(h => h.status == 0).length;
            const disabledCount = hosts.filter(h => h.status == 1).length;
            
            // Status chart
            const statusCtx = document.getElementById('statusChart').getContext('2d');
            if (window.statusChart) {
                window.statusChart.destroy();
            }
            window.statusChart = new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Enabled', 'Disabled'],
                    datasets: [{
                        data: [enabledCount, disabledCount],
                        backgroundColor: [
                            '#2ecc71',
                            '#e74c3c'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
            
            // Simulate activity chart with mock data
            const activityCtx = document.getElementById('activityChart').getContext('2d');
            if (window.activityChart) {
                window.activityChart.destroy();
            }
            window.activityChart = new Chart(activityCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Events',
                        data: [12, 19, 3, 5, 2, 3, 9],
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error loading charts:', error);
        }
    }

    async loadAlerts() {
        try {
            const problems = await this.api.getProblems();
            const alertsContainer = document.getElementById('alertsList');
            
            if (problems.length === 0) {
                alertsContainer.innerHTML = '<div class="no-alerts">No recent alerts</div>';
                return;
            }
            
            alertsContainer.innerHTML = '';
            problems.forEach(problem => {
                const severityClasses = [
                    'severity-not-classified',
                    'severity-information',
                    'severity-warning',
                    'severity-average',
                    'severity-high',
                    'severity-disaster'
                ];
                
                const severityClass = severityClasses[problem.severity] || 'severity-not-classified';
                const severityNames = ['Not classified', 'Information', 'Warning', 'Average', 'High', 'Disaster'];
                
                const alertItem = document.createElement('div');
                alertItem.className = 'alert-item';
                alertItem.innerHTML = `
                    <div class="alert-severity ${severityClass}" title="${severityNames[problem.severity]}"></div>
                    <div class="alert-content">
                        <div>Problem occurred</div>
                        <small>Event ID: ${problem.eventid}</small>
                    </div>
                    <div class="alert-time">${new Date(problem.clock * 1000).toLocaleString()}</div>
                `;
                
                alertsContainer.appendChild(alertItem);
            });
        } catch (error) {
            console.error('Error loading alerts:', error);
        }
    }

    async loadHostsPage() {
        await this.loadHosts();
        this.setupHostFilters();
        this.setupHostSearch();
    }

    async loadHosts() {
        try {
            const hosts = await this.api.getHosts(
                ['hostid', 'name', 'status', 'available'],
                ['name'],
                ['ip']
            );
            
            const hostsGrid = document.getElementById('hostsGrid');
            hostsGrid.innerHTML = '';
            
            if (hosts.length === 0) {
                hostsGrid.innerHTML = '<div class="loading">No hosts found</div>';
                return;
            }
            
            hosts.forEach(host => {
                const status = host.status == 0 ? 'available' : 'disabled';
                const statusText = host.status == 0 ? 'Available' : 'Disabled';
                const ip = host.interfaces && host.interfaces[0] ? host.interfaces[0].ip : 'N/A';
                const group = host.groups && host.groups[0] ? host.groups[0].name : 'N/A';
                
                const hostCard = document.createElement('div');
                hostCard.className = `host-card status-${status}`;
                hostCard.innerHTML = `
                    <div class="host-header">
                        <div class="host-name">${host.name}</div>
                        <div class="host-status status-${status}">${statusText}</div>
                    </div>
                    <div class="host-details">
                        <div>
                            <div class="host-detail">IP Address</div>
                            <div class="host-value">${ip}</div>
                        </div>
                        <div>
                            <div class="host-detail">Group</div>
                            <div class="host-value">${group}</div>
                        </div>
                        <div>
                            <div class="host-detail">Status</div>
                            <div class="host-value">${statusText}</div>
                        </div>
                        <div>
                            <div class="host-detail">ID</div>
                            <div class="host-value">${host.hostid}</div>
                        </div>
                    </div>
                `;
                
                hostCard.addEventListener('click', () => this.showHostDetails(host));
                hostsGrid.appendChild(hostCard);
            });
        } catch (error) {
            console.error('Error loading hosts:', error);
            document.getElementById('hostsGrid').innerHTML = 
                `<div class="loading">Error loading hosts: ${error.message}</div>`;
        }
    }

    setupHostFilters() {
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.applyHostFilters();
            });
        }
    }

    setupHostSearch() {
        const searchInput = document.getElementById('hostSearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.applyHostFilters();
                }, 300);
            });
        }
    }

    applyHostFilters() {
        const searchTerm = document.getElementById('hostSearch').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        
        const hostCards = document.querySelectorAll('.host-card');
        hostCards.forEach(card => {
            const hostName = card.querySelector('.host-name').textContent.toLowerCase();
            const hostStatus = card.classList.contains('status-available') ? '0' : 
                              card.classList.contains('status-disabled') ? '1' : 'all';
            
            const matchesSearch = hostName.includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || hostStatus === statusFilter;
            
            card.style.display = (matchesSearch && matchesStatus) ? 'block' : 'none';
        });
    }

    async showHostDetails(host) {
        // Show modal with host details
        const modal = document.getElementById('hostModal');
        const modalTitle = document.getElementById('modalTitle');
        const hostDetails = document.getElementById('hostDetails');
        
        modalTitle.textContent = host.name;
        
        hostDetails.innerHTML = `
            <div class="host-details-full">
                <div class="detail-row">
                    <strong>Host ID:</strong> <span>${host.hostid}</span>
                </div>
                <div class="detail-row">
                    <strong>Name:</strong> <span>${host.name}</span>
                </div>
                <div class="detail-row">
                    <strong>Status:</strong> <span class="status-badge status-${host.status == 0 ? 'available' : 'disabled'}">
                        ${host.status == 0 ? 'Available' : 'Disabled'}
                    </span>
                </div>
                <div class="detail-row">
                    <strong>IP Address:</strong> <span>${host.interfaces && host.interfaces[0] ? host.interfaces[0].ip : 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <strong>Group(s):</strong> <span>${host.groups ? host.groups.map(g => g.name).join(', ') : 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <strong>Availability:</strong> <span>${host.available == 1 ? 'Online' : 'Offline'}</span>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
        
        // Close modal when clicking X
        document.querySelector('.close').onclick = function() {
            modal.style.display = 'none';
        };
        
        // Close modal when clicking outside
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new DashboardApp();
});