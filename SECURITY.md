# Security Policy

## 🔒 Reporting Security Vulnerabilities

We take security seriously. If you discover a security vulnerability, please report it privately.

### How to Report

**DO NOT** open a public issue for security vulnerabilities.

Instead, please email: security@horizon-careers.com (or create a private security advisory on GitHub)

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### What to Expect

- Acknowledgment within 48 hours
- Regular updates on our investigation
- Credit in the fix announcement (if desired)
- Responsible disclosure timeline

## 🛡️ Security Best Practices for Contributors

### Environment Variables

**NEVER commit these files:**

- `.env`
- `.env.local`
- `.env.production`
- Any file containing API keys or secrets

✅ **DO:**

- Use `.env.example` for documentation
- Add sensitive files to `.gitignore`
- Rotate keys if accidentally exposed
- Use environment variables for secrets

❌ **DON'T:**

- Commit API keys or tokens
- Share credentials in issues/PRs
- Hardcode sensitive data
- Push .env files to git

### API Key Security

If you accidentally commit API keys:

1. **Immediately rotate all exposed keys:**

   - Gemini API: https://makersuite.google.com/app/apikey
   - Supabase: Project Settings > API
   - RapidAPI: Account > Security

2. **Remove from git history:**

   ```bash
   # Using git-filter-repo (recommended)
   git filter-repo --path .env --invert-paths
   git filter-repo --path server/.env --invert-paths

   # Or using BFG Repo-Cleaner
   bfg --delete-files .env
   ```

3. **Force push (if repository is private):**

   ```bash
   git push origin --force --all
   ```

4. **Notify maintainers immediately**

### Supabase Security

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend
- Use Row Level Security (RLS) policies
- Validate user permissions server-side
- Use `SUPABASE_ANON_KEY` for client-side only

### Dependencies

- Keep dependencies updated
- Run `npm audit` regularly
- Review security advisories
- Use `npm audit fix` for patches

## 🔐 Supported Versions

| Version | Supported         |
| ------- | ----------------- |
| 1.x.x   | ✅ Active support |
| < 1.0   | ❌ Not supported  |

## 🚨 Known Security Considerations

### Client-Side Security

- VITE\_ prefixed env vars are public (embedded in client bundle)
- Never store sensitive data in localStorage
- Validate all user inputs
- Sanitize data before rendering

### Server-Side Security

- Rate limiting enabled on API endpoints
- CORS configured for known origins
- Input validation on all endpoints
- SQL injection protection via Supabase client

### Authentication

- Supabase handles secure auth
- JWT tokens expire automatically
- Passwords never stored in plain text
- Email verification required

## 📊 Security Checklist for PRs

Before submitting a PR, verify:

- [ ] No API keys or secrets committed
- [ ] No sensitive user data logged
- [ ] Input validation for user data
- [ ] XSS protection (sanitize HTML)
- [ ] CSRF protection where needed
- [ ] Secure HTTP headers set
- [ ] Dependencies have no known vulnerabilities
- [ ] Authentication required for protected routes

## 🛠️ Security Tools

We use:

- **GitHub Dependabot** - Automated dependency updates
- **npm audit** - Vulnerability scanning
- **ESLint security plugins** - Code analysis
- **Supabase RLS** - Database security

## 📞 Contact

For security concerns: security@horizon-careers.com

For general issues: Open a public GitHub issue

---

**Remember:** Security is everyone's responsibility. Thank you for helping keep Horizon secure! 🔐
