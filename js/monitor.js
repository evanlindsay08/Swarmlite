document.addEventListener('DOMContentLoaded', function() {
    const monitorForm = document.getElementById('monitorForm');
    const submitButton = document.querySelector('.submit-button');
    let activeMonitors = new Map();

    // Load existing monitors from local storage
    loadMonitorsFromStorage();

    monitorForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        submitButton.disabled = true;
        startMonitoringAnimation(submitButton);

        const formData = {
            minVolume: parseFloat(document.getElementById('minVolume').value),
            webhookUrl: document.getElementById('webhookUrl').value,
            minMcap: parseFloat(document.getElementById('minMcap').value) || undefined,
            maxMcap: parseFloat(document.getElementById('maxMcap').value) || undefined,
            excludeNsfw: document.getElementById('excludeNsfw').checked,
            newTokensOnly: document.getElementById('newTokensOnly').checked,
            hasSocials: document.getElementById('hasSocials').checked,
            hasTwitter: document.getElementById('hasTwitter').checked,
            hasTelegram: document.getElementById('hasTelegram').checked,
            hasWebsite: document.getElementById('hasWebsite').checked,
            minUniqueBuyers: parseInt(document.getElementById('minUniqueBuyers').value) || undefined,
            buySellRatio: parseFloat(document.getElementById('buySellRatio').value) || undefined,
            minTradeCount: parseInt(document.getElementById('minTradeCount').value) || undefined,
            maxLastTradeAge: parseInt(document.getElementById('maxLastTradeAge').value) || undefined,
            devSoldCheck: document.getElementById('devSoldCheck').checked,
            devAddress: document.getElementById('devAddress').value || undefined,
            requireCompleteData: document.getElementById('requireCompleteData').checked,
            minReplyCount: parseInt(document.getElementById('minReplyCount').value) || undefined
        };

        Object.keys(formData).forEach(key => {
            if (formData[key] === undefined) {
                delete formData[key];
            }
        });

        try {
            const response = await fetch('https://token-monitor-production.up.railway.app/api/monitors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Save monitor to local storage
                saveMonitorToStorage(data.monitorId, formData);
                createMonitorCard(data.monitorId, formData);
                showNotification('Monitor initialized successfully!', 'success');
                monitorForm.reset();
            } else {
                throw new Error(data.message || 'Failed to initialize monitor');
            }
        } catch (error) {
            showNotification(error.message, 'error');
            submitButton.disabled = false;
            stopMonitoringAnimation(submitButton);
        }
    });

    function saveMonitorToStorage(monitorId, config) {
        let monitors = JSON.parse(localStorage.getItem('activeMonitors') || '{}');
        monitors[monitorId] = config;
        localStorage.setItem('activeMonitors', JSON.stringify(monitors));
    }

    function removeMonitorFromStorage(monitorId) {
        let monitors = JSON.parse(localStorage.getItem('activeMonitors') || '{}');
        delete monitors[monitorId];
        localStorage.setItem('activeMonitors', JSON.stringify(monitors));
    }

    function loadMonitorsFromStorage() {
        const monitors = JSON.parse(localStorage.getItem('activeMonitors') || '{}');
        Object.entries(monitors).forEach(([monitorId, config]) => {
            createMonitorCard(monitorId, config);
        });
    }

    function startMonitoringAnimation(button) {
        let dots = 0;
        button.originalText = button.innerHTML;
        button.monitoringInterval = setInterval(() => {
            dots = (dots + 1) % 4;
            button.innerHTML = 'Monitoring' + '.'.repeat(dots);
        }, 500);
    }

    function stopMonitoringAnimation(button) {
        clearInterval(button.monitoringInterval);
        button.innerHTML = button.originalText;
        button.disabled = false;
    }

    function createMonitorCard(monitorId, config) {
        const monitorContainer = document.createElement('div');
        monitorContainer.className = 'monitor-card';
        const currentMonitors = document.querySelectorAll('.monitor-card').length;
        const monitorNumber = currentMonitors + 1;

        monitorContainer.innerHTML = `
            <div class="monitor-info">
                <h3>Active Monitor</h3>
                <p>Monitor ${monitorNumber}</p>
                ${config.minMcap ? `<p>Min MCap: $${config.minMcap}</p>` : ''}
                ${config.maxMcap ? `<p>Max MCap: $${config.maxMcap}</p>` : ''}
            </div>
            <button class="stop-button" data-monitor-id="${monitorId}">
                Stop Monitor
            </button>
        `;

        const stopButton = monitorContainer.querySelector('.stop-button');
        stopButton.addEventListener('click', async () => {
            try {
                const response = await fetch(`https://token-monitor-production.up.railway.app/api/monitors/${monitorId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    monitorContainer.remove();
                    // Remove from local storage
                    removeMonitorFromStorage(monitorId);
                    showNotification('Monitor stopped successfully', 'success');
                    submitButton.disabled = false;
                    stopMonitoringAnimation(submitButton);
                } else {
                    throw new Error('Failed to stop monitor');
                }
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });

        const monitorsSection = document.querySelector('.active-monitors') || createMonitorsSection();
        monitorsSection.appendChild(monitorContainer);
    }

    function createMonitorsSection() {
        const section = document.createElement('div');
        section.className = 'active-monitors';
        document.querySelector('.monitor-container').appendChild(section);
        return section;
    }
});

// Add CSS for the new elements
const style = document.createElement('style');
style.textContent = `
    .active-monitors {
        margin-top: 4rem;
        display: grid;
        gap: 2rem;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }

    .monitor-card {
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(65, 147, 106, 0.2);
        border-radius: 8px;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .monitor-info {
        color: white;
    }

    .monitor-info h3 {
        color: var(--neon-green);
        margin-bottom: 1rem;
    }

    .monitor-info p {
        opacity: 0.8;
        margin-bottom: 0.5rem;
    }

    .stop-button {
        background: rgba(255, 0, 0, 0.1);
        border: 1px solid rgba(255, 0, 0, 0.3);
        color: #ff4444;
        padding: 0.8rem;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .stop-button:hover {
        background: rgba(255, 0, 0, 0.2);
        border-color: #ff4444;
    }
`;

document.head.appendChild(style);

// Add notification system
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Add CSS for the notification
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 8px;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid var(--neon-green);
            color: white;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        }

        .notification-content {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .notification.success i {
            color: var(--neon-green);
        }

        .notification.error i {
            color: #ff4444;
        }

        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;

    document.head.appendChild(style);

    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
} 