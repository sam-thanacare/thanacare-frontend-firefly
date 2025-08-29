# Security Scanning Setup

This project uses a local-first security scanning approach with CodeQL for comprehensive static analysis and npm audit for dependency vulnerability scanning.

## Security Tools

### 1. npm audit

- **Purpose**: Scans npm dependencies for known vulnerabilities
- **Configuration**: Set to `moderate` severity threshold
- **Usage**: `make security-scan` or `npm run security-scan`

### 2. CodeQL (GitHub's Code Analysis)

- **Purpose**: Advanced static analysis for JavaScript/TypeScript applications
- **Features**:
  - Static Application Security Testing (SAST)
  - Taint analysis for security vulnerabilities
  - Custom query support for specific security patterns
  - SARIF output format for integration with security tools

## Local Development

### CodeQL Installation

Before running CodeQL scans locally, you need to install the CodeQL CLI:

#### Option 1: Download from GitHub

```bash
# Download CodeQL CLI for your platform
curl -L https://github.com/github/codeql-cli-binaries/releases/latest/download/codeql-linux64.zip -o codeql.zip
unzip codeql.zip
export PATH="$PWD/codeql:$PATH"
```

#### Option 2: Using package manager (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install codeql
```

#### Option 3: Using package manager (macOS)

```bash
brew install codeql
```

### Security Commands

```bash
# Run npm audit only
make security-scan

# Initialize CodeQL database
make security-scan-codeql-init

# Run CodeQL security scan (requires CodeQL CLI)
make security-scan-codeql

# Run complete security scan (npm + CodeQL)
make security-scan-full
```

### CI Pipeline Integration

The CI pipeline runs the following checks (security scanning is now local-only):

1. **ESLint** - Code quality and linting
2. **Prettier** - Code formatting verification
3. **npm audit** - Dependency vulnerability scanning
4. **Tests** - Unit and integration tests

**Note**: Security scanning with CodeQL is performed locally using the Makefile commands.

## CodeQL Database Management

### Creating a CodeQL Database

```bash
make security-scan-codeql-init
```

This creates a `codeql-db` directory with the analyzed codebase.

### Running CodeQL Analysis

```bash
make security-scan-codeql
```

This analyzes the database and generates a SARIF report (`codeql-results.sarif`).

### Cleaning Up

```bash
# Remove CodeQL database
rm -rf codeql-db

# Remove results file
rm -f codeql-results.sarif
```

## Security Scan Results

### Local Results

- **npm audit**: Results displayed in terminal with severity levels
- **CodeQL**: SARIF file generated with detailed findings
- Both tools provide remediation suggestions when available

### Viewing CodeQL Results

You can view CodeQL results using various tools:

```bash
# View results in terminal (requires jq)
cat codeql-results.sarif | jq '.runs[0].results[] | {rule: .ruleId, message: .message.text, location: .locations[0].physicalLocation}'

# Upload to GitHub Security tab (manual process)
# 1. Go to your repository's Security tab
# 2. Upload the codeql-results.sarif file
```

## Severity Thresholds

### npm audit

- **moderate**: Only vulnerabilities with moderate or higher severity will fail the scan

### CodeQL

- **Default**: All detected security issues are reported
- Custom queries can be configured for specific severity thresholds

## Handling Security Findings

### npm Audit Findings

1. Review the vulnerability details
2. Update dependencies to patched versions
3. If updates are not possible, evaluate risk mitigation strategies

### CodeQL Findings

1. Review the finding details in the SARIF report
2. Examine the code location and understand the vulnerability
3. Implement the suggested fix or mitigation
4. Consider writing custom CodeQL queries for specific patterns

## Best Practices

1. **Regular Scanning**: Run security scans regularly during development
2. **Dependency Updates**: Keep dependencies updated to avoid known vulnerabilities
3. **Code Review**: Use CodeQL findings to improve code review processes
4. **Team Awareness**: Share security findings with your development team
5. **Database Updates**: Regularly update CodeQL databases for new query coverage

## Troubleshooting

### CodeQL Installation Issues

```bash
# Verify CodeQL installation
codeql --version

# Check if CodeQL is in PATH
which codeql

# Reinstall CodeQL if needed
curl -L https://github.com/github/codeql-cli-binaries/releases/latest/download/codeql-linux64.zip -o codeql.zip
unzip codeql.zip
export PATH="$PWD/codeql:$PATH"
```

### npm Audit Issues

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# Check for outdated packages
npm outdated
```

### CodeQL Database Issues

```bash
# Remove corrupted database
rm -rf codeql-db

# Reinitialize
make security-scan-codeql-init
```

## Custom CodeQL Queries

You can create custom CodeQL queries for your specific security requirements:

1. Create a `.ql` file in your repository
2. Use the CodeQL query language to define security patterns
3. Run custom queries with:

```bash
codeql database analyze codeql-db your-custom-query.ql --format=sarif-latest --output=custom-results.sarif
```

## Security Contacts

For security-related issues or questions:

- Create an issue in this repository
- Contact the development team
- Refer to [GitHub Security Advisories](https://github.com/jdsingh122918/thanacare-frontend/security/advisories)
