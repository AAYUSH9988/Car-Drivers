# Contributing to GoPilot

Thank you for your interest in contributing to GoPilot! This document outlines the guidelines for contributing to the project.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Follow the [Setup Guide](SETUP.md) to get the project running
4. Create a new branch for your feature or fix

## Development Workflow

### Branch Naming

Use descriptive branch names:

- `feature/description` — New features
- `fix/description` — Bug fixes
- `docs/description` — Documentation updates
- `refactor/description` — Code refactoring

Example:
```bash
git checkout -b feature/driver-search-filter
git checkout -b fix/login-error-handling
```

### Commit Messages

Write clear, concise commit messages:

```
feat: add driver availability toggle
fix: correct JWT expiration time
docs: update API endpoint documentation
refactor: simplify booking validation logic
```

### Pull Request Process

1. Ensure your branch is up to date with the main branch
2. Run the full test suite (if available) and ensure it passes
3. Update documentation if needed
4. Create a pull request with a clear description
5. Link any related issues

## Code Style

### JavaScript/React

- Use ESLint configuration (included in each workspace)
- Follow the existing code patterns
- Use meaningful variable and function names
- Add comments for complex logic only

### CSS/Tailwind

- Use Tailwind utility classes
- Avoid arbitrary values where possible
- Follow the existing design system
- No `rounded-full`, `shadow-*`, or `text-gray-*` classes (use the design system tokens)

## Testing

Before submitting a PR:

- Test your changes locally
- Verify the build passes: `npm run build`
- Check for console errors
- Test on multiple screen sizes (if UI related)

## Reporting Issues

When reporting issues, please include:

- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, Node version)

## Code Review

All contributions are reviewed before merging. Feedback is provided to maintain code quality and consistency.

## Questions?

Feel free to open an issue for any questions or discussion.

