# Contributing to AccordFlow

Thank you for your interest in contributing to AccordFlow! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards others

## Getting Started

### 1. Fork the Repository

Click the "Fork" button on GitHub to create your own copy of the repository.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/AccordFlow.git
cd AccordFlow
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/tbmobb813/AccordFlow.git
```

### 4. Set Up Development Environment

Follow the instructions in [SETUP.md](./SETUP.md) to set up your local development environment.

## Development Workflow

### 1. Create a Feature Branch

```bash
# Update your local main branch
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments where necessary
- Update tests if applicable
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run linters
npm run lint

# Run builds to check for errors
npm run build

# Test locally
npm run dev
```

### 4. Commit Your Changes

Follow conventional commit format:

```bash
git add .
git commit -m "feat: add contact export functionality"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build process or auxiliary tool changes

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

1. Go to your fork on GitHub
2. Click "Pull Request"
3. Select your feature branch
4. Fill in the PR template
5. Submit the pull request

## Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow existing naming conventions
- Use meaningful variable names
- Add JSDoc comments for public APIs
- Use async/await over promises
- Prefer const over let, never use var

```typescript
// ✅ Good
const getUserById = async (id: string): Promise<User> => {
  return await prisma.user.findUnique({ where: { id } });
};

// ❌ Bad
function getUser(id) {
  return prisma.user.findUnique({ where: { id } }).then(user => user);
}
```

### NestJS Backend

- One feature per module
- Controllers handle HTTP, services handle logic
- Use DTOs for validation
- Use decorators appropriately
- Follow dependency injection patterns

```typescript
// ✅ Good structure
@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}
  
  async findAll(tenantId: string) {
    return this.prisma.contact.findMany({
      where: { tenantId }
    });
  }
}
```

### Next.js Frontend

- Use App Router conventions
- Server components by default
- Use 'use client' only when needed
- Follow Next.js best practices
- Keep components small and focused

```tsx
// ✅ Good
export default function ContactCard({ contact }: { contact: Contact }) {
  return (
    <div className="rounded-lg border p-4">
      <h3>{contact.firstName} {contact.lastName}</h3>
      <p>{contact.email}</p>
    </div>
  );
}
```

### CSS/Tailwind

- Use Tailwind utility classes
- Create component classes for repeated patterns
- Keep styles consistent with design system
- Use responsive design classes

```tsx
// ✅ Good
<button className="rounded bg-primary-600 px-4 py-2 text-white hover:bg-primary-700">
  Click Me
</button>

// ❌ Bad - inline styles
<button style={{ background: 'blue', padding: '8px' }}>
  Click Me
</button>
```

## Database Changes

### Modifying Prisma Schema

1. Update `packages/database/prisma/schema.prisma`
2. Generate migration or push changes
3. Update seed data if needed
4. Regenerate Prisma client

```bash
cd packages/database

# For development
npm run db:push

# For production-ready changes
npm run db:migrate

# Regenerate client
npm run db:generate
```

### Adding a New Model

When adding a new entity:
1. Add the model to schema.prisma
2. Include `tenantId` for multi-tenancy
3. Add to Activity entity relationships if needed
4. Create corresponding NestJS module
5. Add CRUD endpoints
6. Update frontend if necessary

## Testing

### Writing Tests

(Tests not yet implemented - this is a future contribution area)

When we add testing:
- Write unit tests for services
- Write integration tests for APIs
- Write E2E tests for critical flows
- Maintain >80% code coverage

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## Documentation

### When to Update Documentation

Update documentation when you:
- Add a new feature
- Change existing behavior
- Add new API endpoints
- Modify database schema
- Change environment variables
- Update dependencies

### Documentation Files

- `README.md` - Project overview
- `SETUP.md` - Setup instructions
- `ARCHITECTURE.md` - Technical architecture
- `CONTRIBUTING.md` - This file
- API docs - Auto-generated via Swagger
- Code comments - For complex logic

## Pull Request Guidelines

### PR Checklist

Before submitting a PR, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass (when implemented)
- [ ] Documentation is updated
- [ ] Commit messages follow conventions
- [ ] No console.log or debug code left in
- [ ] No sensitive data or secrets
- [ ] PR description explains changes clearly

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Item 1
- Item 2

## Testing
How to test these changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Additional Notes
Any other relevant information
```

### Review Process

1. Automated checks run on PR
2. Maintainer reviews code
3. Feedback addressed by contributor
4. PR approved and merged

## Reporting Bugs

### Before Reporting

- Check existing issues
- Verify it's not a setup problem
- Confirm on latest version

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., macOS, Windows, Linux]
- Node version: [e.g., 18.0.0]
- Browser: [e.g., Chrome, Safari]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information
```

## Feature Requests

We welcome feature requests! Please:

1. Check if it's already requested
2. Describe the feature clearly
3. Explain the use case
4. Suggest implementation if possible

## Questions?

- Check documentation first
- Search existing issues
- Join discussions on GitHub
- Create a new discussion if needed

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing to AccordFlow! 🎉
