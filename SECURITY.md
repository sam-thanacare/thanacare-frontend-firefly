# Security Scanning Setup

This project uses a comprehensive security scanning approach with multiple tools to ensure code quality and security.

## Security Tools

### 1. npm audit
- **Purpose**: Scans npm dependencies for known vulnerabilities
- **Configuration**: Set to `moderate` severity threshold
- **Usage**: `make security-scan` or `npm run security-scan`

### 2. Snyk
- **Purpose**: Advanced security scanning for JavaScript/TypeScript applications
- **Features**:
  - Static Application Security Testing (SAST)
  - Software Composition Analysis (SCA)
  - Container scanning capabilities
- **Configuration**: Set to `medium` severity threshold

## Local Development

### Authentication Setup
Before running Snyk scans locally, you need to authenticate:

```bash
make security-scan-snyk-auth
```

This will open a browser window for you to authenticate with your Snyk account.

### Security Commands

```bash
# Run npm audit only
make security-scan

# Run Snyk scan only (requires authentication)
make security-scan-snyk

# Run complete security scan (npm + Snyk)
make security-scan-full

# Authenticate with Snyk
make security-scan-snyk-auth
```

### CI Pipeline Integration

The CI pipeline runs the following security checks:

1. **npm audit** - Dependency vulnerability scanning
2. **Snyk test** - Comprehensive security analysis
3. **Results upload** - Security findings uploaded to GitHub Security tab

## GitHub Actions Configuration

### Required Secrets
To enable Snyk scanning in GitHub Actions, add the following secret:
- `SNYK_TOKEN`: Your Snyk authentication token

### Getting Snyk Token
1. Sign up at [snyk.io](https://snyk.io)
2. Get your token from the Snyk dashboard
3. Add it as `SNYK_TOKEN` in your GitHub repository secrets

## Security Scan Results

### Local Results
- npm audit results are displayed in the terminal
- Snyk results include detailed vulnerability information
- Both tools provide severity levels and remediation suggestions

### CI Results
- Results are displayed in the GitHub Actions logs
- Snyk results are uploaded to GitHub Security tab for tracking
- Failed security checks will cause the pipeline to fail

## Severity Thresholds

### npm audit
- **moderate**: Only vulnerabilities with moderate or higher severity will fail the scan

### Snyk
- **medium**: Only vulnerabilities with medium or higher severity will fail the scan

## Handling False Positives

If Snyk reports false positives:

1. Review the vulnerability details
2. Use Snyk's ignore functionality if appropriate
3. Document the decision in your security policy

## Best Practices

1. **Regular Updates**: Keep dependencies updated to avoid known vulnerabilities
2. **Authentication**: Set up Snyk authentication for comprehensive scanning
3. **Review Results**: Regularly review security scan results
4. **CI Integration**: Ensure security scans are part of your CI pipeline
5. **Team Awareness**: Share security findings with your development team

## Troubleshooting

### Snyk Authentication Issues
```bash
# Re-authenticate with Snyk
make security-scan-snyk-auth

# Check Snyk installation
snyk --version
```

### npm Audit Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install
```

## Security Contacts

For security-related issues or questions:
- Create an issue in this repository
- Contact the development team
- Refer to [GitHub Security Advisories](https://github.com/jdsingh122918/thanacare-frontend/security/advisories)
