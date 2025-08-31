#!/bin/bash

# Test Profile Picture Functionality
echo "Testing Profile Picture Functionality..."
echo "======================================"

# Set backend URL
BACKEND_URL=${NEXT_PUBLIC_THANACARE_BACKEND:-"http://localhost:8080"}

echo "Backend URL: $BACKEND_URL"
echo ""

# Test 1: Check if profile picture endpoint is accessible
echo "Test 1: Checking profile picture endpoint accessibility..."
curl -s -o /dev/null -w "Profile picture endpoint status: %{http_code}\n" \
  "$BACKEND_URL/api/users/profile/picture"

echo ""

# Test 2: Check if profile picture upload endpoint is accessible
echo "Test 2: Checking profile picture upload endpoint accessibility..."
curl -s -o /dev/null -w "Profile picture upload endpoint status: %{http_code}\n" \
  "$BACKEND_URL/api/users/profile/picture/upload"

echo ""

# Test 3: Check if profile endpoint is accessible
echo "Test 3: Checking profile endpoint accessibility..."
curl -s -o /dev/null -w "Profile endpoint status: %{http_code}\n" \
  "$BACKEND_URL/api/users/profile"

echo ""
echo "Profile picture functionality test completed!"
echo ""
echo "To test the full functionality:"
echo "1. Start the backend server"
echo "2. Start the frontend server (npm run dev)"
echo "3. Login as admin"
echo "4. Navigate to admin dashboard"
echo "5. Upload a profile picture"
echo "6. Verify it appears in the header immediately"
echo "7. Refresh the page to verify persistence"
