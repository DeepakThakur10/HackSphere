# Contributing to HackSphere

Thank you for contributing to HackSphere! Follow these guidelines to submit high-quality features and bug fixes.

---

## 1. Branch Naming Convention

- Feature branches: `feature/short-description`
- Bug fixes: `fix/short-description`
- Documentation: `docs/short-description`

---

## 2. Development Workflow

1. Fork and clone the repository.
2. Create a feature branch: `git checkout -b feature/team-chat-enhancements`.
3. Make changes and verify frontend build:
   ```bash
   cd HackSphere-frontend
   npm run build
   ```
4. Run Jest unit tests:
   ```bash
   cd HackSphere-backend
   npm test
   ```
5. Commit changes with conventional messages (`feat: add team chat stream`, `fix: registration modal destructuring`).
6. Push branch and open a Pull Request.
