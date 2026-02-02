# Security Policy

## Supported Versions

We actively support and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Security Updates

This project uses the following dependencies with known security considerations:

### Next.js
- **Current Version**: 15.2.3+
- **Security Patches**: Includes fixes for DoS vulnerabilities, authorization bypass, cache poisoning, and SSRF
- **Critical Vulnerabilities Addressed**:
  - CVE: HTTP request deserialization DoS with Server Components
  - CVE: Authorization bypass in Next.js middleware
  - CVE: Next.js cache poisoning
  - CVE: Server-Side Request Forgery in Server Actions

### React
- **Current Version**: 19.0.0+
- Updated to support Next.js 15+ security features

### Clerk Authentication
- **Current Version**: 6.15.1+
- Updated for Next.js 15 compatibility and enhanced security

## Reporting a Vulnerability

If you discover a security vulnerability in AccordFlow, please follow these steps:

### 1. Do Not Open a Public Issue

Please **do not** create a public GitHub issue for security vulnerabilities, as this could put users at risk.

### 2. Report Privately

Send an email to the maintainers with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

### 3. Response Timeline

- **Initial Response**: Within 48 hours
- **Assessment**: Within 1 week
- **Fix & Disclosure**: Coordinated with reporter

## Security Best Practices

When using AccordFlow, follow these security practices:

### Environment Variables
- Never commit `.env` files to version control
- Use strong, unique values for all secrets
- Rotate credentials regularly
- Use different credentials for dev/staging/production

### Clerk Authentication
- Enable Multi-Factor Authentication (MFA) in production
- Use production Clerk keys only in production environments
- Configure allowed redirect URLs properly
- Enable bot detection and rate limiting

### Database
- Use strong passwords for PostgreSQL
- Enable SSL/TLS for database connections in production
- Regularly backup your database
- Use managed database services with automatic security patches

### API Security
- Always use HTTPS in production
- Implement rate limiting (Redis-based)
- Validate all input data
- Use proper CORS configuration
- Keep API keys secure

### Dependencies
- Regularly run `npm audit` to check for vulnerabilities
- Keep all dependencies updated
- Review dependency updates for breaking changes
- Use `npm audit fix` to auto-fix vulnerabilities

### Docker
- Don't use default passwords in production
- Use secrets management for sensitive data
- Keep Docker images updated
- Scan images for vulnerabilities

## Dependency Security Checks

### Automatic Checks

Run security audits regularly:

```bash
# Check for vulnerabilities
npm audit

# Fix automatically fixable vulnerabilities
npm audit fix

# Force fix (may introduce breaking changes)
npm audit fix --force
```

### Manual Updates

For major version updates (like Next.js):

```bash
# Check outdated packages
npm outdated

# Update specific package
npm install next@latest

# Update all packages (careful with breaking changes)
npm update
```

## Security Features

AccordFlow includes the following built-in security features:

### Multi-Tenant Isolation
- Row-level data isolation via `tenantId`
- Middleware enforces tenant context
- No cross-tenant data access
- User-tenant relationship validation

### Authentication
- Clerk handles authentication
- JWT token validation
- Session management
- Social login support

### Authorization
- Role-based access control (RBAC)
- Tenant-scoped permissions
- Guard-based route protection
- Middleware authorization checks

### Input Validation
- DTO validation with class-validator
- Type-safe database queries with Prisma
- SQL injection prevention
- XSS protection via React

### Audit Trail
- Activity logging for all mutations
- User attribution for actions
- Timestamp tracking
- Metadata storage for context

## Known Limitations

### Current State
- Redis integration is prepared but not fully implemented
- Rate limiting not yet active (planned)
- File upload security not implemented (no file uploads yet)
- API key rotation not automated

### Planned Security Enhancements
- [ ] Implement Redis-based rate limiting
- [ ] Add API key management
- [ ] Implement file upload with virus scanning
- [ ] Add intrusion detection
- [ ] Implement automated security scanning in CI/CD
- [ ] Add security headers middleware
- [ ] Implement CSP (Content Security Policy)

## Compliance

AccordFlow is designed with the following compliance considerations:

### GDPR
- User data can be deleted
- Activity logs for audit trail
- Tenant data isolation
- Data export capabilities (to be implemented)

### SOC 2
- Audit trail via Activity model
- User attribution
- Timestamp tracking
- Access control

### Data Privacy
- Encryption in transit (HTTPS)
- Encryption at rest (database level)
- Secure authentication via Clerk
- No sensitive data in logs

## Security Contacts

For security-related questions or to report vulnerabilities:
- Check existing security issues
- Review this security policy
- Contact maintainers privately for sensitive issues

## License

This security policy is part of the AccordFlow project and is licensed under the MIT License.

---

Last Updated: 2024-02-02
