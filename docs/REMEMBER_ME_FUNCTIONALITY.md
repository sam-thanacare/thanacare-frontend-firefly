# Remember Me Functionality

## Overview

The "Remember Me" functionality has been enhanced to provide a seamless authentication experience while maintaining security best practices. This feature allows users to stay logged in across browser sessions when enabled.

## How It Works

### 1. Token Storage Strategy

- **With "Remember Me" checked**: Token is stored in `localStorage` and persists across browser restarts
- **Without "Remember Me" checked**: Token is stored in `sessionStorage` and is cleared when the browser session ends

### 2. Architecture Components

#### Auth Middleware (`lib/store/middleware.ts`)

- Automatically handles token storage based on the `rememberMe` preference
- Clears tokens when logout occurs
- Coordinates with Redux actions for consistent state management

#### Auth Slice (`lib/store/slices/authSlice.ts`)

- Stores the `rememberMe` preference in Redux state
- Provides actions for login, logout, and token management
- Integrates with Redux persistence for state restoration

#### Auth Initializer (`components/auth-initializer.tsx`)

- Restores authentication state from stored tokens on app initialization
- Handles token expiration checking
- Coordinates with Redux persistence to avoid conflicts

#### Utility Functions (`lib/utils/auth.ts`)

- Provides helper functions for token validation and management
- Handles token expiration checking
- Manages storage operations consistently

### 3. Token Lifecycle

1. **Login**: User submits credentials with "Remember Me" preference
2. **Token Generation**: Backend generates JWT token with expiration
3. **Storage**: Token stored in appropriate storage based on preference
4. **State Management**: Redux state updated with user info and token
5. **Persistence**: Token persists according to storage type
6. **Restoration**: On app restart, token restored if valid and not expired
7. **Expiration**: Expired tokens are automatically cleared
8. **Logout**: All tokens cleared from storage

## Security Features

### Token Expiration

- JWT tokens have a 24-hour expiration (configurable in backend)
- Automatic expiration checking prevents use of stale tokens
- Expired tokens are automatically cleared from storage

### Storage Isolation

- Tokens are stored separately from other application data
- No sensitive user information stored in plain text
- Clear separation between persistent and session storage

### Automatic Cleanup

- Invalid tokens are automatically detected and removed
- Logout actions clear all stored authentication data
- Failed authentication attempts don't persist invalid state

## User Experience

### Login Flow

1. User enters credentials
2. User can optionally check "Remember Me"
3. On successful login, authentication state is established
4. Token is stored according to user preference

### Session Persistence

- **Remember Me enabled**: User stays logged in across browser restarts
- **Remember Me disabled**: User must re-authenticate after closing browser
- Seamless experience for returning users

### Automatic Logout

- Users are automatically logged out when tokens expire
- Clear feedback when authentication issues occur
- Graceful degradation of functionality

## Technical Implementation

### Redux Integration

```typescript
// Login action includes remember me preference
dispatch(loginSuccess({ user, token, rememberMe: values.remember }));

// State includes remember me status
interface AuthState {
  rememberMe: boolean;
  // ... other fields
}
```

### Middleware Pattern

```typescript
// Automatic token storage based on action
if (loginSuccess.match(action)) {
  const { token, rememberMe } = action.payload;
  storeToken(token, rememberMe);
}
```

### Storage Management

```typescript
// Utility functions for consistent storage operations
export function storeToken(token: string, rememberMe: boolean): void {
  clearStoredTokens(); // Clear existing tokens first

  if (rememberMe) {
    localStorage.setItem('authToken', token);
  } else {
    sessionStorage.setItem('authToken', token);
  }
}
```

## Testing

### Manual Testing

1. Login with "Remember Me" checked
2. Close browser completely
3. Reopen and verify persistent login
4. Login without "Remember Me"
5. Close browser and verify session-only storage

### Automated Testing

Run the test script to verify functionality:

```bash
./scripts/test_remember_me.sh
```

### Browser DevTools

- Check Application tab > Local Storage for persistent tokens
- Check Application tab > Session Storage for session tokens
- Monitor Network tab for authentication requests

## Configuration

### Backend Token Expiration

- Configured in `internal/services/auth.go`
- Default: 24 hours
- Adjustable via environment variables

### Frontend Storage Keys

- `authToken`: The authentication token
- `auth`: Redux persistence key for auth state

### Environment Variables

- `THANACARE_BACKEND`: Backend API URL
- `NODE_ENV`: Environment for debug features

## Troubleshooting

### Common Issues

#### Token Not Persisting

- Check if "Remember Me" is checked during login
- Verify localStorage is enabled in browser
- Check browser privacy settings

#### Unexpected Logouts

- Verify token expiration time
- Check for storage quota issues
- Monitor for authentication errors

#### State Restoration Issues

- Clear browser storage and re-login
- Check Redux DevTools for state consistency
- Verify middleware execution

### Debug Information

- Development mode shows debug info in login form
- Console logs track token storage operations
- Redux DevTools show state changes

## Future Enhancements

### Planned Features

- Token refresh mechanism
- Remember me preference persistence
- Enhanced security with refresh tokens
- Multi-device session management

### Security Improvements

- Biometric authentication support
- Device fingerprinting
- Risk-based authentication
- Session activity monitoring

## Best Practices

### For Developers

- Always use the provided utility functions
- Don't manually manipulate storage
- Handle authentication errors gracefully
- Test both storage scenarios

### For Users

- Use "Remember Me" only on trusted devices
- Logout when using shared computers
- Regularly change passwords
- Monitor for suspicious activity

## Conclusion

The enhanced "Remember Me" functionality provides a secure and user-friendly authentication experience. By implementing proper token management, automatic expiration handling, and clear storage strategies, users can enjoy persistent login while maintaining security best practices.

For questions or issues, refer to the troubleshooting section or contact the development team.
