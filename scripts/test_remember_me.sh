#!/bin/bash

# Test script for Remember Me functionality
echo "🧪 Testing Remember Me functionality..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $message"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC}: $message"
    else
        echo -e "${YELLOW}⚠️  INFO${NC}: $message"
    fi
}

# Check if the frontend is running
echo "Checking if frontend is running..."
if curl -s http://localhost:3000 > /dev/null; then
    print_status "PASS" "Frontend is running on localhost:3000"
else
    print_status "FAIL" "Frontend is not running on localhost:3000"
    echo "Please start the frontend first: npm run dev"
    exit 1
fi

# Check if the backend is running
echo "Checking if backend is running..."
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    print_status "PASS" "Backend is running on localhost:8080"
else
    print_status "FAIL" "Backend is not running on localhost:8080"
    echo "Please start the backend first: make run"
    exit 1
fi

echo ""
echo "📋 Test Summary:"
echo "1. ✅ Frontend is running"
echo "2. ✅ Backend is running"
echo ""
echo "🎯 Manual Testing Steps:"
echo "1. Open http://localhost:3000/login in your browser"
echo "2. Check the 'Remember me' checkbox"
echo "3. Login with admin credentials"
echo "4. Close the browser completely"
echo "5. Reopen the browser and navigate to http://localhost:3000"
echo "6. Verify you're still logged in (remember me enabled)"
echo ""
echo "7. Logout and login again without checking 'Remember me'"
echo "8. Close the browser completely"
echo "9. Reopen the browser and navigate to http://localhost:3000"
echo "10. Verify you're NOT logged in (remember me disabled)"
echo ""
echo "🔍 Check Browser DevTools:"
echo "- Application tab > Local Storage > authToken (should persist if remember me enabled)"
echo "- Application tab > Session Storage > authToken (should persist only for session if remember me disabled)"
echo ""
echo "📝 Expected Behavior:"
echo "- With 'Remember me' checked: Token stored in localStorage, persists across browser restarts"
echo "- Without 'Remember me' checked: Token stored in sessionStorage, cleared when browser closes"
echo ""
echo "🚀 Ready to test! Follow the manual testing steps above."
