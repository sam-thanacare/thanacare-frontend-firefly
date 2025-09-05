#!/bin/bash

# Frontend Production Debug Logging Enable Script
# This script safely enables debug logging in production environments

set -e

echo "🚀 Enabling Frontend Production Debug Logging"
echo "============================================="

# Configuration
FRONTEND_DIR="/var/www/thanacare-frontend"
BACKUP_DIR="/var/backups/thanacare-frontend-debug"
SERVICE_NAME="thanacare-frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check if user has sudo privileges
if ! sudo -n true 2>/dev/null; then
    print_error "This script requires sudo privileges"
    exit 1
fi

# Step 1: Create backup directory
print_info "Creating backup directory..."
sudo mkdir -p "$BACKUP_DIR"
sudo chown thanacare:thanacare "$BACKUP_DIR"
sudo chmod 755 "$BACKUP_DIR"
print_status "Backup directory created: $BACKUP_DIR"

# Step 2: Backup current configuration
print_info "Backing up current configuration..."
BACKUP_FILE="$BACKUP_DIR/frontend-config-backup-$(date +%Y%m%d-%H%M%S).tar.gz"

# Backup current .env.local if it exists
if [ -f "$FRONTEND_DIR/.env.local" ]; then
    sudo cp "$FRONTEND_DIR/.env.local" "$BACKUP_DIR/.env.local.backup"
fi

# Backup current .env.production if it exists
if [ -f "$FRONTEND_DIR/.env.production" ]; then
    sudo cp "$FRONTEND_DIR/.env.production" "$BACKUP_DIR/.env.production.backup"
fi

# Create backup archive
sudo tar -czf "$BACKUP_FILE" -C "$BACKUP_DIR" .env.local.backup .env.production.backup 2>/dev/null || true
print_status "Configuration backed up to: $BACKUP_FILE"

# Step 3: Create production debug configuration
print_info "Creating production debug configuration..."

# Create .env.production with debug settings
sudo tee "$FRONTEND_DIR/.env.production" << EOF
# Frontend Production Debug Configuration
# Generated on $(date)

# Global debug settings
NEXT_PUBLIC_DEBUG_ENABLED=true
NEXT_PUBLIC_DEBUG_LEVEL=error
NEXT_PUBLIC_DEBUG_CONSOLE=false
NEXT_PUBLIC_DEBUG_STORAGE=false
NEXT_PUBLIC_DEBUG_MAX_LOGS=50

# Component-specific settings
NEXT_PUBLIC_DEBUG_MEMBER_DASHBOARD=false
NEXT_PUBLIC_DEBUG_DOCUMENT_DETAIL=true
NEXT_PUBLIC_DEBUG_DEMENTIA_FORM=false
NEXT_PUBLIC_DEBUG_API=true
NEXT_PUBLIC_DEBUG_NAVIGATION=false
NEXT_PUBLIC_DEBUG_STATE=false

# Production settings
NODE_ENV=production
NEXT_PUBLIC_THANACARE_BACKEND=https://api.thanacare.com
EOF

print_status "Production debug configuration created"

# Step 4: Create .env.local for development debugging
print_info "Creating development debug configuration..."

sudo tee "$FRONTEND_DIR/.env.local" << EOF
# Frontend Development Debug Configuration
# Generated on $(date)

# Global debug settings
NEXT_PUBLIC_DEBUG_ENABLED=true
NEXT_PUBLIC_DEBUG_LEVEL=info
NEXT_PUBLIC_DEBUG_CONSOLE=true
NEXT_PUBLIC_DEBUG_STORAGE=true
NEXT_PUBLIC_DEBUG_MAX_LOGS=100

# Component-specific settings
NEXT_PUBLIC_DEBUG_MEMBER_DASHBOARD=true
NEXT_PUBLIC_DEBUG_DOCUMENT_DETAIL=true
NEXT_PUBLIC_DEBUG_DEMENTIA_FORM=true
NEXT_PUBLIC_DEBUG_API=true
NEXT_PUBLIC_DEBUG_NAVIGATION=true
NEXT_PUBLIC_DEBUG_STATE=true

# Development settings
NODE_ENV=development
NEXT_PUBLIC_THANACARE_BACKEND=http://localhost:8080
EOF

print_status "Development debug configuration created"

# Step 5: Create debug configuration for different scenarios
print_info "Creating scenario-specific configurations..."

# Document loading issue configuration
sudo tee "$FRONTEND_DIR/.env.document-debug" << EOF
# Document Loading Issue Debug Configuration
# Generated on $(date)

# Global debug settings
NEXT_PUBLIC_DEBUG_ENABLED=true
NEXT_PUBLIC_DEBUG_LEVEL=info
NEXT_PUBLIC_DEBUG_CONSOLE=false
NEXT_PUBLIC_DEBUG_STORAGE=true
NEXT_PUBLIC_DEBUG_MAX_LOGS=200

# Component-specific settings for document issues
NEXT_PUBLIC_DEBUG_MEMBER_DASHBOARD=true
NEXT_PUBLIC_DEBUG_DOCUMENT_DETAIL=true
NEXT_PUBLIC_DEBUG_DEMENTIA_FORM=false
NEXT_PUBLIC_DEBUG_API=true
NEXT_PUBLIC_DEBUG_NAVIGATION=true
NEXT_PUBLIC_DEBUG_STATE=false

# Production settings
NODE_ENV=production
NEXT_PUBLIC_THANACARE_BACKEND=https://api.thanacare.com
EOF

# Authentication issue configuration
sudo tee "$FRONTEND_DIR/.env.auth-debug" << EOF
# Authentication Issue Debug Configuration
# Generated on $(date)

# Global debug settings
NEXT_PUBLIC_DEBUG_ENABLED=true
NEXT_PUBLIC_DEBUG_LEVEL=info
NEXT_PUBLIC_DEBUG_CONSOLE=false
NEXT_PUBLIC_DEBUG_STORAGE=true
NEXT_PUBLIC_DEBUG_MAX_LOGS=100

# Component-specific settings for auth issues
NEXT_PUBLIC_DEBUG_MEMBER_DASHBOARD=false
NEXT_PUBLIC_DEBUG_DOCUMENT_DETAIL=false
NEXT_PUBLIC_DEBUG_DEMENTIA_FORM=false
NEXT_PUBLIC_DEBUG_API=true
NEXT_PUBLIC_DEBUG_NAVIGATION=false
NEXT_PUBLIC_DEBUG_STATE=false

# Production settings
NODE_ENV=production
NEXT_PUBLIC_THANACARE_BACKEND=https://api.thanacare.com
EOF

print_status "Scenario-specific configurations created"

# Step 6: Create debug utility script
print_info "Creating debug utility script..."

sudo tee "$FRONTEND_DIR/scripts/debug-utils.js" << 'EOF'
// Frontend Debug Utilities for Production
// This script provides utilities for debugging in production

// Debug configuration checker
function checkDebugConfig() {
    const config = {
        enabled: process.env.NEXT_PUBLIC_DEBUG_ENABLED === 'true',
        level: process.env.NEXT_PUBLIC_DEBUG_LEVEL || 'info',
        console: process.env.NEXT_PUBLIC_DEBUG_CONSOLE !== 'false',
        storage: process.env.NEXT_PUBLIC_DEBUG_STORAGE === 'true',
        maxLogs: parseInt(process.env.NEXT_PUBLIC_DEBUG_MAX_LOGS || '100', 10),
        components: {
            MemberDashboard: process.env.NEXT_PUBLIC_DEBUG_MEMBER_DASHBOARD !== 'false',
            DocumentDetailPage: process.env.NEXT_PUBLIC_DEBUG_DOCUMENT_DETAIL !== 'false',
            DementiaValuesForm: process.env.NEXT_PUBLIC_DEBUG_DEMENTIA_FORM !== 'false',
            API: process.env.NEXT_PUBLIC_DEBUG_API !== 'false',
            Navigation: process.env.NEXT_PUBLIC_DEBUG_NAVIGATION !== 'false',
            State: process.env.NEXT_PUBLIC_DEBUG_STATE !== 'false',
        }
    };
    
    console.log('🔧 Debug Configuration:', config);
    return config;
}

// Log level checker
function checkLogLevel(level) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 };
    const currentLevel = levels[process.env.NEXT_PUBLIC_DEBUG_LEVEL || 'info'];
    const requestedLevel = levels[level] || 1;
    return requestedLevel >= currentLevel;
}

// Component debug checker
function isComponentDebugEnabled(component) {
    const config = checkDebugConfig();
    return config.enabled && config.components[component] !== false;
}

// Debug logger status
function getDebugLoggerStatus() {
    if (typeof window !== 'undefined' && window.debugLogger) {
        const logs = window.debugLogger.getLogs();
        return {
            available: true,
            logCount: logs.length,
            maxLogs: parseInt(process.env.NEXT_PUBLIC_DEBUG_MAX_LOGS || '100', 10),
            recentLogs: logs.slice(-5)
        };
    }
    return { available: false };
}

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.debugUtils = {
        checkConfig: checkDebugConfig,
        checkLogLevel: checkLogLevel,
        isComponentEnabled: isComponentDebugEnabled,
        getLoggerStatus: getDebugLoggerStatus
    };
    
    console.log('🐛 Debug utilities loaded. Use window.debugUtils to access debug functions.');
}

module.exports = {
    checkDebugConfig,
    checkLogLevel,
    isComponentDebugEnabled,
    getDebugLoggerStatus
};
EOF

print_status "Debug utility script created"

# Step 7: Create debug monitoring script
print_info "Creating debug monitoring script..."

sudo tee /usr/local/bin/monitor-frontend-debug.sh << 'EOF'
#!/bin/bash
# Frontend Debug Monitoring Script

FRONTEND_DIR="/var/www/thanacare-frontend"
LOG_FILE="/var/log/thanacare/frontend-debug.log"

echo "🔍 Monitoring Frontend Debug Logs"
echo "================================="

# Create log file if it doesn't exist
sudo touch "$LOG_FILE"
sudo chown thanacare:thanacare "$LOG_FILE"

# Monitor browser console logs (if accessible)
echo "📊 Frontend Debug Status:"
echo "  - Debug enabled: $(grep NEXT_PUBLIC_DEBUG_ENABLED $FRONTEND_DIR/.env.local | cut -d'=' -f2)"
echo "  - Log level: $(grep NEXT_PUBLIC_DEBUG_LEVEL $FRONTEND_DIR/.env.local | cut -d'=' -f2)"
echo "  - Console output: $(grep NEXT_PUBLIC_DEBUG_CONSOLE $FRONTEND_DIR/.env.local | cut -d'=' -f2)"
echo "  - Storage enabled: $(grep NEXT_PUBLIC_DEBUG_STORAGE $FRONTEND_DIR/.env.local | cut -d'=' -f2)"
echo ""

# Monitor for specific patterns in browser logs
echo "🔍 Monitoring for debug patterns..."
echo "  - Document loading issues"
echo "  - API call failures"
echo "  - Authentication errors"
echo "  - Navigation problems"
echo ""

echo "📋 Available debug configurations:"
echo "  - Production: $FRONTEND_DIR/.env.production"
echo "  - Development: $FRONTEND_DIR/.env.local"
echo "  - Document issues: $FRONTEND_DIR/.env.document-debug"
echo "  - Auth issues: $FRONTEND_DIR/.env.auth-debug"
echo ""

echo "🔧 Debug utilities available in browser console:"
echo "  - window.debugUtils.checkConfig()"
echo "  - window.debugUtils.getLoggerStatus()"
echo "  - window.debugLogger.getLogs()"
echo ""

echo "📊 To monitor in real-time:"
echo "  1. Open browser Developer Tools (F12)"
echo "  2. Go to Console tab"
echo "  3. Look for emoji-prefixed debug messages"
echo "  4. Use window.debugUtils for configuration info"
EOF

sudo chmod +x /usr/local/bin/monitor-frontend-debug.sh
print_status "Debug monitoring script created"

# Step 8: Create configuration switcher script
print_info "Creating configuration switcher script..."

sudo tee /usr/local/bin/switch-frontend-debug.sh << 'EOF'
#!/bin/bash
# Frontend Debug Configuration Switcher

FRONTEND_DIR="/var/www/thanacare-frontend"
SERVICE_NAME="thanacare-frontend"

case "$1" in
    "production")
        echo "🔄 Switching to production debug configuration..."
        sudo cp "$FRONTEND_DIR/.env.production" "$FRONTEND_DIR/.env.local"
        ;;
    "development")
        echo "🔄 Switching to development debug configuration..."
        sudo cp "$FRONTEND_DIR/.env.local" "$FRONTEND_DIR/.env.local"
        ;;
    "document-debug")
        echo "🔄 Switching to document debug configuration..."
        sudo cp "$FRONTEND_DIR/.env.document-debug" "$FRONTEND_DIR/.env.local"
        ;;
    "auth-debug")
        echo "🔄 Switching to auth debug configuration..."
        sudo cp "$FRONTEND_DIR/.env.auth-debug" "$FRONTEND_DIR/.env.local"
        ;;
    "disable")
        echo "🔄 Disabling debug logging..."
        sudo tee "$FRONTEND_DIR/.env.local" << 'EOL'
NEXT_PUBLIC_DEBUG_ENABLED=false
NEXT_PUBLIC_DEBUG_LEVEL=silent
NEXT_PUBLIC_DEBUG_CONSOLE=false
NEXT_PUBLIC_DEBUG_STORAGE=false
EOL
        ;;
    *)
        echo "Usage: $0 {production|development|document-debug|auth-debug|disable}"
        echo ""
        echo "Available configurations:"
        echo "  production     - Production debug settings (error level, no console)"
        echo "  development    - Development debug settings (info level, console enabled)"
        echo "  document-debug - Document loading issue debugging"
        echo "  auth-debug     - Authentication issue debugging"
        echo "  disable        - Disable all debug logging"
        exit 1
        ;;
esac

# Restart frontend service
if systemctl is-active --quiet $SERVICE_NAME; then
    sudo systemctl restart $SERVICE_NAME
    echo "✅ Frontend service restarted"
else
    echo "⚠️  Frontend service not running"
fi

echo "✅ Configuration switched to: $1"
EOF

sudo chmod +x /usr/local/bin/switch-frontend-debug.sh
print_status "Configuration switcher script created"

# Step 9: Set proper permissions
print_info "Setting proper permissions..."
sudo chown -R thanacare:thanacare "$FRONTEND_DIR"
sudo chmod 644 "$FRONTEND_DIR/.env.production"
sudo chmod 644 "$FRONTEND_DIR/.env.local"
sudo chmod 644 "$FRONTEND_DIR/.env.document-debug"
sudo chmod 644 "$FRONTEND_DIR/.env.auth-debug"
sudo chmod 644 "$FRONTEND_DIR/scripts/debug-utils.js"
print_status "Permissions set"

# Step 10: Display usage information
print_status "Frontend production debug logging enabled successfully!"
echo ""
echo "📋 Summary:"
echo "  - Frontend directory: $FRONTEND_DIR"
echo "  - Backup: $BACKUP_FILE"
echo "  - Monitor script: /usr/local/bin/monitor-frontend-debug.sh"
echo "  - Switch script: /usr/local/bin/switch-frontend-debug.sh"
echo ""
echo "🔧 Available configurations:"
echo "  - Production: /usr/local/bin/switch-frontend-debug.sh production"
echo "  - Development: /usr/local/bin/switch-frontend-debug.sh development"
echo "  - Document issues: /usr/local/bin/switch-frontend-debug.sh document-debug"
echo "  - Auth issues: /usr/local/bin/switch-frontend-debug.sh auth-debug"
echo "  - Disable: /usr/local/bin/switch-frontend-debug.sh disable"
echo ""
echo "🔍 Monitoring:"
echo "  - Run: /usr/local/bin/monitor-frontend-debug.sh"
echo "  - Browser console: F12 → Console tab"
echo "  - Debug utilities: window.debugUtils in browser console"
echo ""
echo "📊 Next steps:"
echo "  1. Switch to appropriate configuration"
echo "  2. Restart frontend service"
echo "  3. Open browser and reproduce issue"
echo "  4. Check browser console for debug messages"
echo "  5. Use debug utilities for configuration info"
echo ""
echo "⚠️  Remember to disable debug logging after troubleshooting!"
