// ===== Farm Management System - Main JavaScript =====

class FarmManagementSystem {
    constructor() {
        this.init();
    }

    init() {
        this.initializeComponents();
        this.setupEventListeners();
        this.setupInteractions();
        console.log('🌾 Farm Management System Initialized');
    }

    // Initialize all components
    initializeComponents() {
        this.initNavigation();
        this.initForms();
        this.initTables();
        this.initCharts();
        this.initModals();
        this.initAnimations();
        this.initNotifications();
    }

    // Setup global event listeners
    setupEventListeners() {
        // Global click handler for dynamic elements
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        
        // Window resize handling
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
    }

    // Setup user interactions
    setupInteractions() {
        this.setupSmoothScrolling();
        this.setupLoadingStates();
        this.setupTooltips();
        this.setupCounters();
    }

    // ===== NAVIGATION =====
    initNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.querySelector('i').classList.toggle('fa-bars');
                navToggle.querySelector('i').classList.toggle('fa-times');
            });
        }

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu && navMenu.classList.contains('active') && 
                !e.target.closest('.nav-menu') && 
                !e.target.closest('.nav-toggle')) {
                navMenu.classList.remove('active');
                if (navToggle) {
                    navToggle.querySelector('i').classList.add('fa-bars');
                    navToggle.querySelector('i').classList.remove('fa-times');
                }
            }
        });

        // Active navigation link highlighting
        this.highlightActiveNavLink();
    }

    highlightActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPath.includes(href) && href !== '/') {
                link.classList.add('active');
            } else if (currentPath === '/' && href === '/') {
                link.classList.add('active');
            }
        });
    }

    // ===== FORM HANDLING =====
    initForms() {
        this.initializeFormValidation();
        this.setupFormSubmissions();
        this.setupDynamicFormFields();
    }

    initializeFormValidation() {
        const forms = document.querySelectorAll('form[method="POST"]');
        
        forms.forEach(form => {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
            
            // Real-time validation
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', this.validateField.bind(this));
                input.addEventListener('input', this.clearFieldError.bind(this));
            });
        });
    }

    handleFormSubmit(e) {
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        
        if (!this.validateForm(form)) {
            e.preventDefault();
            this.showNotification('Please fix the errors in the form', 'error');
            return;
        }

        // Show loading state
        if (submitButton) {
            this.showLoadingState(submitButton, 'Processing...');
        }

        // Simulate API call for demo
        if (form.id === 'contactForm') {
            e.preventDefault();
            setTimeout(() => {
                this.showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
                form.reset();
                if (submitButton) {
                    this.hideLoadingState(submitButton, 'Send Message');
                }
            }, 2000);
        }
    }

    validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField({ target: field })) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(e) {
        const field = e.target;
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            errorMessage = 'This field is required';
            isValid = false;
        }

        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errorMessage = 'Please enter a valid email address';
                isValid = false;
            }
        }

        // Phone validation
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                errorMessage = 'Please enter a valid phone number';
                isValid = false;
            }
        }

        // Number validation
        if (field.type === 'number' && value) {
            const min = parseFloat(field.getAttribute('min'));
            const max = parseFloat(field.getAttribute('max'));
            
            if (!isNaN(min) && parseFloat(value) < min) {
                errorMessage = `Value must be at least ${min}`;
                isValid = false;
            }
            
            if (!isNaN(max) && parseFloat(value) > max) {
                errorMessage = `Value must be at most ${max}`;
                isValid = false;
            }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        } else {
            this.clearFieldError(field);
        }

        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.style.borderColor = '#f44336';
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.cssText = `
            color: #f44336;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.style.borderColor = '';
        field.classList.remove('error');
        
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    setupFormSubmissions() {
        // Crop form revenue calculation
        const cropForms = document.querySelectorAll('.crop-form');
        cropForms.forEach(form => {
            const yieldInput = form.querySelector('input[name="expected_yield"]');
            const priceInput = form.querySelector('input[name="price"]');
            
            if (yieldInput && priceInput) {
                const calculateRevenue = () => {
                    const yieldVal = parseFloat(yieldInput.value) || 0;
                    const priceVal = parseFloat(priceInput.value) || 0;
                    const revenue = yieldVal * priceVal;
                    
                    // Update display if exists
                    const revenueDisplay = form.querySelector('#revenueDisplay');
                    if (revenueDisplay) {
                        revenueDisplay.textContent = revenue.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });
                    }
                };
                
                yieldInput.addEventListener('input', calculateRevenue);
                priceInput.addEventListener('input', calculateRevenue);
            }
        });
    }

    setupDynamicFormFields() {
        // Show/hide fields based on selections
        const dynamicTriggers = document.querySelectorAll('select[data-show], input[data-show]');
        
        dynamicTriggers.forEach(trigger => {
            trigger.addEventListener('change', (e) => {
                const targetSelector = e.target.getAttribute('data-show');
                const targetValue = e.target.getAttribute('data-show-value');
                const targetElement = document.querySelector(targetSelector);
                
                if (targetElement) {
                    if (e.target.value === targetValue) {
                        targetElement.style.display = 'block';
                    } else {
                        targetElement.style.display = 'none';
                    }
                }
            });
        });
    }

    // ===== TABLE FUNCTIONALITY =====
    initTables() {
        this.setupTableSearch();
        this.setupTableSorting();
        this.setupTableFilters();
        this.setupTablePagination();
    }

    setupTableSearch() {
        const searchInputs = document.querySelectorAll('.search-box input');
        
        searchInputs.forEach(input => {
            input.addEventListener('input', this.debounce((e) => {
                const searchTerm = e.target.value.toLowerCase();
                const table = e.target.closest('.table-container').querySelector('table');
                const rows = table.querySelectorAll('tbody tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            }, 300));
        });
    }

    setupTableSorting() {
        const sortableHeaders = document.querySelectorAll('th[data-sort]');
        
        sortableHeaders.forEach(header => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', (e) => {
                this.sortTable(e.target);
            });
        });
    }

    sortTable(header) {
        const table = header.closest('table');
        const columnIndex = Array.from(header.parentNode.cells).indexOf(header);
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        const isAscending = !header.classList.contains('asc');
        
        // Clear other sort indicators
        table.querySelectorAll('th').forEach(th => {
            th.classList.remove('asc', 'desc');
        });
        
        // Set current sort indicator
        header.classList.add(isAscending ? 'asc' : 'desc');
        
        // Sort rows
        rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent.trim();
            const bValue = b.cells[columnIndex].textContent.trim();
            
            let comparison = 0;
            if (aValue < bValue) comparison = -1;
            if (aValue > bValue) comparison = 1;
            
            return isAscending ? comparison : -comparison;
        });
        
        // Re-append sorted rows
        const tbody = table.querySelector('tbody');
        rows.forEach(row => tbody.appendChild(row));
    }

    setupTableFilters() {
        const filterSelects = document.querySelectorAll('.filter-select');
        
        filterSelects.forEach(select => {
            select.addEventListener('change', (e) => {
                const filterValue = e.target.value;
                const table = e.target.closest('.table-container').querySelector('table');
                const rows = table.querySelectorAll('tbody tr');
                
                rows.forEach(row => {
                    if (filterValue === 'all') {
                        row.style.display = '';
                    } else {
                        const matches = row.getAttribute('data-type') === filterValue || 
                                      row.getAttribute('data-status') === filterValue;
                        row.style.display = matches ? '' : 'none';
                    }
                });
            });
        });
    }

    setupTablePagination() {
        // This would be implemented for large datasets
        console.log('Table pagination ready for implementation');
    }

    // ===== CHARTS & DATA VISUALIZATION =====
    initCharts() {
        this.initStatsCounters();
        this.initSimpleCharts();
    }

    initStatsCounters() {
        const counters = document.querySelectorAll('.stat-number[data-count]');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                counter.textContent = Math.floor(current).toLocaleString();
            }, 16);
        });
    }

    initSimpleCharts() {
        // Simple progress bars
        const progressBars = document.querySelectorAll('.progress-bar');
        
        progressBars.forEach(bar => {
            const fill = bar.querySelector('.progress-fill');
            if (fill) {
                const width = fill.style.width;
                fill.style.width = '0%';
                
                setTimeout(() => {
                    fill.style.transition = 'width 1s ease-in-out';
                    fill.style.width = width;
                }, 500);
            }
        });
    }

    // ===== MODAL SYSTEM =====
    initModals() {
        this.setupModalTriggers();
    }

    setupModalTriggers() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });

        // Close modal with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => {
                    modal.style.display = 'none';
                });
            }
        });

        // Close buttons
        const closeButtons = document.querySelectorAll('.modal .close');
        closeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // ===== ANIMATIONS =====
    initAnimations() {
        this.setupScrollAnimations();
        this.setupHoverAnimations();
        this.setupPageTransitions();
    }

    setupScrollAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements with animation classes
        const animatedElements = document.querySelectorAll('.card, .feature-card, .stat-card');
        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    setupHoverAnimations() {
        // Add hover effects to interactive elements
        const interactiveElements = document.querySelectorAll('.btn, .card, .nav-link');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                e.target.style.transform = 'translateY(-2px)';
            });
            
            element.addEventListener('mouseleave', (e) => {
                e.target.style.transform = 'translateY(0)';
            });
        });
    }

    setupPageTransitions() {
        // Smooth page transitions for internal links
        const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="#"]');
        
        internalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(link.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
    }

    // ===== NOTIFICATION SYSTEM =====
    initNotifications() {
        // Auto-remove flash messages after 5 seconds
        const flashMessages = document.querySelectorAll('.flash-message');
        flashMessages.forEach(message => {
            setTimeout(() => {
                message.style.animation = 'slideInRight 0.3s ease reverse';
                setTimeout(() => message.remove(), 300);
            }, 5000);
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `flash-message flash-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            ${message}
            <button class="flash-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        const container = document.querySelector('.flash-container') || this.createFlashContainer();
        container.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    createFlashContainer() {
        const container = document.createElement('div');
        container.className = 'flash-container';
        document.body.appendChild(container);
        return container;
    }

    // ===== UTILITY FUNCTIONS =====
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    showLoadingState(button, text = 'Loading...') {
        const originalHTML = button.innerHTML;
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
        button.disabled = true;
        
        return () => {
            button.innerHTML = originalHTML;
            button.disabled = false;
        };
    }

    hideLoadingState(button, originalText) {
        button.innerHTML = originalText;
        button.disabled = false;
    }

    setupSmoothScrolling() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    setupLoadingStates() {
        // Global loading state for AJAX requests
        document.addEventListener('ajaxStart', () => {
            document.body.classList.add('loading');
        });
        
        document.addEventListener('ajaxComplete', () => {
            document.body.classList.remove('loading');
        });
    }

    setupTooltips() {
        // Simple tooltip system
        const elementsWithTooltip = document.querySelectorAll('[data-tooltip]');
        
        elementsWithTooltip.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = e.target.getAttribute('data-tooltip');
                document.body.appendChild(tooltip);
                
                const rect = e.target.getBoundingClientRect();
                tooltip.style.left = rect.left + 'px';
                tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
            });
            
            element.addEventListener('mouseleave', () => {
                const tooltip = document.querySelector('.tooltip');
                if (tooltip) tooltip.remove();
            });
        });
    }

    setupCounters() {
        // Animate numbers when they come into view
        const animatedNumbers = document.querySelectorAll('.count-up');
        
        const numberObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateValue(entry.target);
                    numberObserver.unobserve(entry.target);
                }
            });
        });
        
        animatedNumbers.forEach(number => numberObserver.observe(number));
    }

    animateValue(element) {
        const target = parseInt(element.textContent);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    }

    // ===== GLOBAL EVENT HANDLERS =====
    handleGlobalClick(e) {
        // Handle dynamic elements and delegated events
        if (e.target.matches('.btn-action')) {
            this.handleActionButton(e.target);
        }
    }

    handleActionButton(button) {
        const action = button.classList[1]; // btn-edit, btn-delete, etc.
        
        switch (action) {
            case 'btn-edit':
                // Edit functionality
                break;
            case 'btn-delete':
                // Delete confirmation
                break;
            case 'btn-info':
                // Show details
                break;
        }
    }

    handleKeyboardShortcuts(e) {
        // Global keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'k':
                    e.preventDefault();
                    this.focusSearch();
                    break;
                case 'n':
                    if (document.querySelector('[href="/add_crop"]')) {
                        e.preventDefault();
                        window.location.href = '/add_crop';
                    }
                    break;
            }
        }
    }

    focusSearch() {
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.focus();
        }
    }

    handleResize() {
        // Handle responsive behavior
        const navMenu = document.getElementById('navMenu');
        if (window.innerWidth > 768 && navMenu) {
            navMenu.classList.remove('active');
        }
    }

    // ===== DATA EXPORT =====
    exportToCSV(tableId, filename = 'data.csv') {
        const table = document.getElementById(tableId);
        if (!table) return;

        const rows = table.querySelectorAll('tr');
        const csv = [];
        
        rows.forEach(row => {
            const rowData = [];
            const cells = row.querySelectorAll('th, td');
            
            cells.forEach(cell => {
                let text = cell.textContent.trim();
                // Escape quotes and wrap in quotes if contains comma
                text = text.replace(/"/g, '""');
                if (text.includes(',')) {
                    text = `"${text}"`;
                }
                rowData.push(text);
            });
            
            csv.push(rowData.join(','));
        });
        
        const csvContent = csv.join('\n');
        this.downloadFile(csvContent, filename, 'text/csv');
    }

    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // ===== WEATHER INTEGRATION =====
    async fetchWeatherData() {
        try {
            // This would integrate with a weather API
            const response = await fetch('/api/weather');
            const data = await response.json();
            this.updateWeatherWidget(data);
        } catch (error) {
            console.warn('Weather data unavailable:', error);
        }
    }

    updateWeatherWidget(weatherData) {
        const widget = document.querySelector('.weather-widget');
        if (widget && weatherData) {
            // Update widget with real data
        }
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the main application
    window.farmSystem = new FarmManagementSystem();
    
    // Add global error handler
    window.addEventListener('error', (e) => {
        console.error('Global error:', e.error);
    });
    
    // Service worker registration for PWA (future enhancement)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    }
});

// ===== GLOBAL HELPER FUNCTIONS =====
// Crop management functions
window.showCropDetails = function(cropId) {
    // This would typically fetch crop details via AJAX
    const modal = document.getElementById('cropModal');
    const modalBody = document.getElementById('cropModalBody');
    
    if (modal && modalBody) {
        modalBody.innerHTML = `
            <div class="crop-details">
                <h3>Crop Details</h3>
                <p>Loading details for crop ID: ${cropId}</p>
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
        
        // Simulate API call
        setTimeout(() => {
            modalBody.innerHTML = `
                <div class="crop-details">
                    <h3>Crop Details #${cropId}</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Status:</label>
                            <span>Growing</span>
                        </div>
                        <div class="detail-item">
                            <label>Planted:</label>
                            <span>2024-03-15</span>
                        </div>
                        <div class="detail-item">
                            <label>Expected Harvest:</label>
                            <span>2024-07-20</span>
                        </div>
                    </div>
                </div>
            `;
        }, 1000);
    }
};

// Export functions
window.exportToCSV = function() {
    if (window.farmSystem) {
        window.farmSystem.exportToCSV('cropsTable', 'crops_export.csv');
    }
};

window.printCrops = function() {
    window.print();
};

// Share functionality
window.shareBlog = function(blogId) {
    if (navigator.share) {
        navigator.share({
            title: document.title,
            text: 'Check out this blog post!',
            url: window.location.href
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href).then(() => {
            if (window.farmSystem) {
                window.farmSystem.showNotification('Link copied to clipboard!', 'success');
            }
        });
    }
};

// ===== PERFORMANCE OPTIMIZATIONS =====
// Lazy loading for images
document.addEventListener('DOMContentLoaded', function() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
});

// Preload critical resources
function preloadCriticalResources() {
    const criticalResources = [
        '/static/style.css',
        '/static/script.js'
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'script';
        document.head.appendChild(link);
    });
}

// Initialize preloading
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadCriticalResources);
} else {
    preloadCriticalResources();
}

console.log('🚀 Farm Management System JavaScript Loaded Successfully!');