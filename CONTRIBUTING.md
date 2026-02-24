# Contributing to Smart Price Tracker

First off, thank you for considering contributing to Smart Price Tracker! It's people like you that make this project better for everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

**Our Standards:**
- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/smart-price-tracker.git
   cd smart-price-tracker
   ```
3. **Set up your development environment** using the [Quick Start Guide](./QUICK_START.md)
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, Node version, browser, etc.)

**Bug Report Template:**
```markdown
## Description
A clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
If applicable

## Environment
- OS: [e.g. Windows 11, macOS 14]
- Node.js: [e.g. v20.10.0]
- Browser: [e.g. Chrome 120, Safari 17]
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Step-by-step description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **Examples** from other projects (if applicable)

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:
- `good first issue` - Good for newcomers
- `help wanted` - Issues where we need community help
- `documentation` - Improvements to documentation

### Pull Requests

We actively welcome your pull requests! Here's what we're looking for:

1. **Small, focused changes** - Easier to review and merge
2. **Tests** - Add tests for new features
3. **Documentation** - Update docs for any changed functionality
4. **Consistent style** - Follow our coding standards

## Development Workflow

### 1. Set Up Development Environment

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Create a Feature Branch

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Urgent fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests

### 3. Make Your Changes

- Write clean, readable code
- Follow the coding standards below
- Add comments for complex logic
- Update documentation as needed

### 4. Test Your Changes

```bash
# Backend tests (when available)
cd backend
npm test

# Frontend tests (when available)
cd frontend
npm test

# Manual testing
# Start both servers and test the affected features
```

### 5. Commit Your Changes

```bash
git add .
git commit -m "feat: add product price tracking feature"
```

See [Commit Guidelines](#commit-guidelines) below.

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill in the PR template
4. Link any related issues
5. Submit the PR

## Coding Standards

### JavaScript/React Style Guide

#### General Principles
- Use ES6+ syntax
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for callbacks
- Use template literals for string interpolation
- Keep functions small and focused
- One component per file

#### Naming Conventions

```javascript
// Variables & Functions: camelCase
const userName = "John";
const fetchUserData = () => {};

// Components: PascalCase
const UserProfile = () => {};
const ProductCard = () => {};

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = "http://localhost:4000";
const MAX_RETRY_ATTEMPTS = 3;

// Private functions: prefix with underscore
const _helperFunction = () => {};
```

#### React Components

**Functional Components with Hooks:**
```javascript
import { useState, useEffect } from 'react';

/**
 * UserProfile component displays user information
 * @param {Object} props - Component props
 * @param {string} props.userId - User ID to fetch
 */
const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId);
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
    </div>
  );
};

export default UserProfile;
```

**Props Destructuring:**
```javascript
// ✅ Good
const Button = ({ text, onClick, variant = 'primary' }) => {
  return <button onClick={onClick}>{text}</button>;
};

// ❌ Avoid
const Button = (props) => {
  return <button onClick={props.onClick}>{props.text}</button>;
};
```

#### Backend Code Style

**Controller Pattern:**
```javascript
/**
 * Get all products for the authenticated user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
export const getProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const products = await prisma.product.findMany({
      where: { userId },
      include: { prices: true }
    });

    return res.status(200).json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
```

**Validation with Zod:**
```javascript
import { z } from 'zod';

const productSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  platform: z.enum(["amazon", "ebay", "walmart"]),
  targetPrice: z.number().positive().optional()
});

// In controller
const validatedData = productSchema.parse(req.body);
```

### CSS/Tailwind Guidelines

**Use Tailwind Utility Classes:**
```jsx
// ✅ Preferred
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-gray-800">Title</h2>
</div>

// ❌ Avoid inline styles
<div style={{ display: 'flex', padding: '16px' }}>
```

**Responsive Design:**
```jsx
<div className="
  grid grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4
">
```

**Conditional Classes:**
```javascript
const buttonClass = `
  px-4 py-2 rounded-md font-medium
  ${variant === 'primary' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}
  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
`;
```

### File Organization

```
src/
├── components/
│   ├── common/          # Reusable components
│   ├── features/        # Feature-specific components
│   └── layout/          # Layout components
├── pages/               # Page components
├── hooks/               # Custom hooks
├── utils/               # Utility functions
├── services/            # API services
├── store/               # Redux store
└── constants/           # Constants and configs
```

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, etc.
- `ci`: CI/CD changes

### Examples

```bash
# Simple commit
git commit -m "feat: add price alert notification system"

# With scope
git commit -m "fix(auth): resolve token expiration issue"

# With body
git commit -m "feat: add product comparison feature

Implemented side-by-side product comparison with price history charts.
Users can now compare up to 4 products simultaneously."

# Breaking change
git commit -m "refactor!: restructure API endpoints

BREAKING CHANGE: All API endpoints now use /api/v2 prefix"
```

### Best Practices

- **Use present tense**: "add feature" not "added feature"
- **Use imperative mood**: "move cursor to" not "moves cursor to"
- **Keep subject line under 50 characters**
- **Capitalize first letter** of subject
- **No period** at the end of subject
- **Explain why, not how** in the body

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Self-review of your code completed
- [ ] Comments added to complex code
- [ ] Documentation updated (if needed)
- [ ] No new warnings or errors
- [ ] Tests added/updated (if applicable)
- [ ] All tests pass
- [ ] Commits follow commit guidelines

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Fixes #(issue number)

## Changes Made
- Change 1
- Change 2
- Change 3

## Screenshots (if applicable)
Add screenshots here

## Testing
Describe how you tested your changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass
```

### Review Process

1. **Automated Checks** - CI/CD runs tests and linting
2. **Code Review** - Maintainer reviews your code
3. **Feedback** - Address any requested changes
4. **Approval** - Maintainer approves PR
5. **Merge** - PR is merged into main branch

### After Merge

- **Delete your branch** (both local and remote)
- **Update your fork**:
  ```bash
  git checkout main
  git pull upstream main
  git push origin main
  ```

## Community

### Communication Channels

- **GitHub Issues** - Bug reports and feature requests
- **Pull Requests** - Code contributions
- **Discussions** - General questions and ideas

### Getting Help

- Check the [Quick Start Guide](./QUICK_START.md)
- Read the [SDD](./SDD/Smart-Price-Tracker-SDD.md)
- Browse [API Documentation](./API_DOCUMENTATION.md)
- Search existing issues
- Ask in GitHub Discussions

### Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md (coming soon)
- Mentioned in release notes
- Credited in documentation

## Development Tips

### Debugging

**Backend:**
```javascript
// Use console.log with context
console.log("[AUTH] User login attempt:", { email: user.email });

// Use debugger
debugger;
```

**Frontend:**
```javascript
// React DevTools
// Redux DevTools
// Browser DevTools (Network tab for API calls)
```

### Common Issues

**"Cannot find module"**
```bash
npm install
```

**Port already in use:**
```bash
# Change port in .env file
PORT=4001
```

**Database connection error:**
```bash
# Check DATABASE_URL in .env
# Verify database is running
npx prisma studio  # Test connection
```

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (ISC License).

---

**Thank you for contributing to Smart Price Tracker! 🎉**

Your contributions make a difference! If you have questions, don't hesitate to ask.
