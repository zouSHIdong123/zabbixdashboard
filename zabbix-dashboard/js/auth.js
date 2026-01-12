// Authentication management
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('zabbix_token');
        this.serverUrl = localStorage.getItem('zabbix_server');
        this.username = localStorage.getItem('zabbix_username');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Handle login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Handle logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Display username if on dashboard
        this.displayUsername();
    }

    async handleLogin() {
        const serverInput = document.getElementById('server');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const errorMessage = document.getElementById('error-message');

        const server = serverInput.value.trim();
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!server || !username || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        try {
            // Show loading state
            const loginBtn = document.querySelector('.btn-login');
            const originalText = loginBtn.textContent;
            loginBtn.textContent = 'Logging in...';
            loginBtn.disabled = true;

            // Attempt to login
            const token = await this.login(server, username, password);

            if (token) {
                // Store credentials
                this.token = token;
                this.serverUrl = server;
                this.username = username;
                
                localStorage.setItem('zabbix_token', token);
                localStorage.setItem('zabbix_server', server);
                localStorage.setItem('zabbix_username', username);

                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                this.showError('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError(error.message || 'An error occurred during login');
        } finally {
            // Restore button state
            const loginBtn = document.querySelector('.btn-login');
            loginBtn.textContent = 'Login';
            loginBtn.disabled = false;
        }
    }

    async login(server, username, password) {
        const response = await fetch(`${server}/api_jsonrpc.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'user.login',
                params: {
                    user: username,
                    password: password
                },
                id: 1
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.data || 'Login failed');
        }

        return data.result;
    }

    logout() {
        localStorage.removeItem('zabbix_token');
        localStorage.removeItem('zabbix_server');
        localStorage.removeItem('zabbix_username');
        
        this.token = null;
        this.serverUrl = null;
        this.username = null;

        window.location.href = 'index.html';
    }

    isAuthenticated() {
        return !!this.token && !!this.serverUrl;
    }

    getAuthToken() {
        return this.token;
    }

    getServerUrl() {
        return this.serverUrl;
    }

    getUsername() {
        return this.username;
    }

    displayUsername() {
        const usernameDisplay = document.getElementById('usernameDisplay');
        if (usernameDisplay && this.username) {
            usernameDisplay.textContent = this.username;
        }
    }

    showError(message) {
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
            
            // Hide error after 5 seconds
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 5000);
        }
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
    
    // Check authentication for dashboard pages
    const currentPage = window.location.pathname.split('/').pop();
    if (['dashboard.html', 'hosts.html'].includes(currentPage)) {
        if (!window.authManager.isAuthenticated()) {
            window.location.href = 'index.html';
        }
    }
});