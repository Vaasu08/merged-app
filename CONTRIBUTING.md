# Contributing to Horizon

Thank you for your interest in contributing to Horizon! We welcome contributions from the community.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, Node version, browser)

### Suggesting Features

We love new ideas! Open an issue with:

- Clear description of the feature
- Use cases and benefits
- Any implementation ideas you have

### Pull Requests

1. **Fork the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/merged-app.git
   cd merged-app
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Set up your development environment**

   ```bash
   # Install dependencies
   npm install
   cd server && npm install && cd ..

   # Copy environment files
   cp .env.example .env
   cp server/.env.example server/.env
   # Add your API keys to both .env files
   ```

4. **Make your changes**

   - Write clean, readable code
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

5. **Test your changes**

   ```bash
   npm run lint
   npm run build
   # Test manually in the browser
   ```

6. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

   Use conventional commits:

   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `style:` for formatting
   - `refactor:` for code restructuring
   - `test:` for tests
   - `chore:` for maintenance

7. **Push and create a PR**
   ```bash
   git push origin feature/amazing-feature
   ```
   Then open a pull request on GitHub.

## 📋 Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Use Tailwind CSS for styling

### File Organization

- Components go in `src/components/`
- Pages go in `src/pages/`
- Services/utilities go in `src/lib/`
- Types go in `src/types/`

### Commit Messages

Write clear, descriptive commit messages:

```
feat: add career assessment scoring algorithm

- Implemented weighted scoring system
- Added AI-powered recommendations
- Updated UI to display results
```

### Pull Request Guidelines

- Fill out the PR template completely
- Link related issues
- Provide screenshots for UI changes
- Ensure all checks pass
- Respond to review feedback promptly

## 🔒 Security

**Never commit sensitive data!**

- API keys go in `.env` files (gitignored)
- Use `.env.example` for documentation
- Report security issues privately (see SECURITY.md)

## 🧪 Testing

- Test your changes thoroughly
- Check both frontend and backend
- Test with different user scenarios
- Verify mobile responsiveness

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Google Gemini AI](https://ai.google.dev/docs)

## ❓ Questions?

Feel free to:

- Open an issue for discussion
- Ask in pull request comments
- Reach out to maintainers

## 🎉 Recognition

Contributors will be acknowledged in:

- README.md
- Release notes
- Project documentation

Thank you for making Horizon better! 🚀
