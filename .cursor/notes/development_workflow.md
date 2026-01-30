# Development Workflow

## Project Setup

### Prerequisites
- **Node.js**: Version compatible with ES2022 modules
- **npm**: Package manager
- **Docker**: For containerized deployment
- **Git**: Version control

### Initial Setup

**API**:
```bash
cd api/
npm install
```

**Frontend**:
```bash
cd frontend/
npm install
```

## Development Modes

### API Development

**Development Server with Hot Reload**:
```bash
cd api/
npm run dev
```

**Process**:
- Uses `tsc-watch` to watch TypeScript files
- Compiles on changes
- Restarts server with `nodemon`
- Server runs on port 3000 (or `PORT` env var)

**Environment Variables** (`.env` file):
```
PORT=3000
VC_REGISTRY=https://ssi.eecc.de/api/registry/vcs/
DOCUMENT_CACHE_TTL_HOURS=1
```

### Frontend Development

**Development Server**:
```bash
cd frontend/
npm run dev
# or
npm run serve
```

**Process**:
- Vue CLI dev server
- Hot module replacement (HMR)
- Runs on port 8080 by default
- Proxies API calls if configured

**Environment Variables** (`.env.local` file):
```
VUE_APP_VERIFIER_API=http://localhost:3000/api/verifier
VC_REGISTRY=https://ssi.eecc.de/api/registry/vcs/
OPENID_ENDPOINT=https://ssi.eecc.de/api/openid/
```

## Building

### API Build

**TypeScript Compilation**:
```bash
cd api/
npm run build-tsc
```

**Process**:
1. Compiles TypeScript to JavaScript (ES2022 modules)
2. Outputs to `api/dist/`
3. Copies JSON schemas via `copyfiles`

**Output Structure**:
```
dist/
├── index.js
├── routers/
├── routes/
├── services/
│   └── verifier/
│       └── schemas/  # JSON schemas copied here
└── utils/
```

### Frontend Build

**Production Build**:
```bash
cd frontend/
npm run build
```

**Process**:
1. Vue CLI builds optimized production bundle
2. Outputs to `frontend/dist/`
3. Minification, tree-shaking, code splitting
4. Asset optimization (images, fonts)

**Output Structure**:
```
dist/
├── index.html
├── js/           # Code-split bundles
├── css/          # Extracted CSS
├── img/          # Optimized images
└── manifest.json # PWA manifest
```

## Testing

### API Tests

**Run All Tests**:
```bash
cd api/
npm test
```

**Test Configuration** (`jest.config.ts`):
- Framework: Jest
- Transform: ts-jest
- Module type: ES modules (`NODE_OPTIONS=--experimental-vm-modules`)
- Coverage: Enabled with verbose output

**Test Files**: `api/__tests__/*.test.ts`

**Test Coverage Output**: `api/coverage/`

**Writing Tests**:
```typescript
import request from 'supertest';
import server from '../src/index.js';

describe('Credential Verification', () => {
  it('should verify valid credential', async () => {
    const response = await request(server)
      .post('/api/verifier')
      .send([testCredential])
      .expect(200);
    
    expect(response.body[0].verified).toBe(true);
  });
});
```

### Frontend Tests

**Unit Tests**:
```bash
cd frontend/
npm run test:unit
```

**E2E Tests**:
```bash
cd frontend/
npm run test:e2e
```

**Unit Test Configuration** (`jest.config.js`):
- Framework: Jest
- Test utils: `@vue/test-utils`
- Transform: `@vue/vue3-jest`

**E2E Test Configuration** (`cypress.json`):
- Framework: Cypress
- Browser automation

## Code Quality

### Linting

**Frontend Linting**:
```bash
cd frontend/
npm run lint
```

**Linter**: ESLint with Vue plugin
**Configuration**: `.eslintrc.js` (if present) or `package.json`
**Auto-fix**: `npm run lint -- --fix`

### TypeScript Type Checking

**API**:
```bash
cd api/
npx tsc --noEmit
```

Checks types without emitting files.

## Docker Containerization

### Building Images

**API Docker Image**:
```bash
cd api/
docker build -t vc-verifier-api .
```

**Dockerfile Pattern**:
1. Base: Node.js image
2. Install dependencies (`npm i` installs all from `package.json`)
3. Copy source
4. Build TypeScript
5. Expose port 3000
6. Start server

**Important**: The API uses `@eecc/vc-verifier-rules` (specified in `package.json`), not `@gs1us/vc-verifier-rules`. Dependencies are installed via `npm i`, which reads from `package.json`.

**Frontend Docker Image**:
```bash
cd frontend/
docker build -t vc-verifier-frontend .
```

**Dockerfile Pattern** (multi-stage):
1. **Build stage**: Node.js, install deps, build
2. **Production stage**: Nginx, copy built files
3. Expose port 80
4. Serve static files

### Running with Docker Compose

**Start All Services**:
```bash
docker-compose up
```

**Configuration** (`docker-compose.yml`):
- `api` service: Port 3000
- `frontend` service: Port 80
- Environment variables from `.env` file

**Environment File** (`.env`):
```
API_PORT=3000
FRONTEND_PORT=80
VC_REGISTRY=https://ssi.eecc.de/api/registry/vcs/
FRONTEND_PUBLIC_PATH=/verifier/
NODE_ENV=production
BASE_URL=/verifier/
```

**Stop Services**:
```bash
docker-compose down
```

**Rebuild Images**:
```bash
docker-compose up --build
```

## Deployment

### Production Deployment

**Pre-built Images**:
- GitHub Container Registry hosts images
- Images: 
  - `ghcr.io/european-epc-competence-center/vc-verifier/vc_verifier_api`
  - `ghcr.io/european-epc-competence-center/vc-verifier/vc_verifier_frontend`

**Pull and Run**:
```bash
docker-compose pull
docker-compose up -d
```

### Health Checks

**API Health Endpoint**: `GET /health`
- Returns 200 if server is running
- Used by Kubernetes liveness probes

**API Readiness Endpoint**: `GET /ready`
- Returns 200 if server is ready to accept requests
- Used by Kubernetes readiness probes

### Environment Configuration

**API Runtime Variables**:
- `PORT` - Server port
- `VC_REGISTRY` - Credential registry URL
- `DOCUMENT_CACHE_TTL_HOURS` - Cache TTL

**Frontend Runtime Variables**:
- Injected at build time via Vue CLI
- Cannot be changed after build without rebuild

## CI/CD

### GitHub Actions Workflows

**Location**: `.github/workflows/`

**Workflows**:

**1. `tests.yml` - Run Tests**
- Trigger: Push, PR to main
- Steps:
  1. Checkout code
  2. Setup Node.js
  3. Install API dependencies
  4. Run API tests
  5. Upload coverage

**2. `build-all.yml` - Build Containers**
- Trigger: Push to main, tags
- Steps:
  1. Checkout code
  2. Login to GitHub Container Registry
  3. Build API image
  4. Build frontend image
  5. Push images with version tags

**Container Tags**:
- `latest` - Latest main branch
- `<version>` - Semantic version tags (e.g., `3.2.1`)
- `<commit-sha>` - Specific commit tags

### Version Management

**Semantic Versioning**: MAJOR.MINOR.PATCH

**Version Locations**:
- `api/package.json` - API version
- `frontend/package.json` - Frontend version
- `frontend/src/store/index.js` - Displayed in UI
- Root `CHANGELOG.md` - Version history

**Versioning Strategy**:
- Both subprojects use same version number
- Synchronized releases
- Independent development possible

## Changelog Management

### Changelog Files

**Root**: `/CHANGELOG.md` - Consolidated history
**API**: `/api/CHANGELOG.md` - API-specific changes (if exists)
**Frontend**: `/frontend/CHANGELOG.md` - Frontend-specific changes (if exists)

### Update Process

1. Make changes to code
2. Add entry to `CHANGELOG.md` WIP section
3. Commit with descriptive message
4. On release, move WIP entries to new version section

### Changelog Format

```markdown
## [Unreleased]
- New feature X
- Bugfix Y

## 3.2.1 (2025-12-15)
- Fix data integrity version

## 3.2.0 (2025-12-15)
- Add support for all data integrity proof cryptosuites
```

**See**: `.cursor/rules/changelog-conventions.mdc` for detailed conventions

## Debugging

### API Debugging

**Console Logging**:
```typescript
console.log('Debug info:', data);
console.error('Error occurred:', error);
```

**VS Code Debug Configuration** (`.vscode/launch.json`):
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug API",
  "runtimeArgs": ["-r", "ts-node/register"],
  "args": ["${workspaceFolder}/api/src/index.ts"],
  "cwd": "${workspaceFolder}/api",
  "env": {
    "NODE_ENV": "development"
  }
}
```

**Swagger UI**: Navigate to `/api/verifier/swagger` for interactive API testing

### Frontend Debugging

**Vue DevTools**: Browser extension for Vue.js debugging

**Console Logging**:
```javascript
console.log('Component data:', this.$data);
console.log('Store state:', this.$store.state);
```

**Network Inspection**: Browser DevTools Network tab to inspect API calls

## Common Tasks

### Adding a New API Endpoint

1. Define route in `api/src/routers/verify/index.ts`
2. Add handler method in `api/src/routes/verify/index.ts`
3. Add JSDoc comments for Swagger
4. Implement business logic (or call service)
5. Add tests in `api/__tests__/`
6. Update API changelog

### Adding a New Frontend Component

1. Create component in `frontend/src/components/`
2. Import in parent component/view
3. Add props, data, methods
4. Style with scoped SCSS
5. Add to component documentation (if needed)
6. Update frontend changelog

### Adding a New Cryptographic Suite

1. Install suite library: `npm install @digitalbazaar/new-suite`
2. Import in `api/src/services/verifier/index.ts`
3. Add case in `getDataIntegritySuite()` or `getSuite()`
4. Add test credential with new proof type
5. Add test in `api/__tests__/`
6. Update verification_system.md notes
7. Update API changelog

### Updating Dependencies

**Check Outdated**:
```bash
npm outdated
```

**Update**:
```bash
npm update
# or for major versions
npm install package@latest
```

**Test After Update**:
```bash
npm test
```

**Important**: Update `package-lock.json` by running `npm install`

#### Known Breaking Changes (January 2026)

The following major version upgrades introduced breaking changes:

**API Dependencies:**

1. **`@digitalbazaar/ecdsa-sd-2023-cryptosuite` (1.0.2 → 3.4.1)**
   - **Breaking Change**: Stricter validation for selective disclosure proofs
   - **Error**: `"publicKey" must be a Uint8Array of length 35`
   - **Impact**: Old test credentials with ecdsa-sd-2023 proofs fail verification
   - **Solution**: Regenerate credentials using v3.x cryptosuite, or pin to `^1.0.2`
   - **Test Status**: `"Verify single DataIntegrityProof credential"` test skipped

2. **`@digitalbazaar/vc-revocation-list` (5.0.1 → 7.0.0)**
   - **Breaking Change**: Behavior changes in RevocationList2020 status checking
   - **Impact**: Revoked credentials may not be detected as revoked
   - **Solution**: Investigate if RevocationList2020 is still needed, or migrate to BitstringStatusListEntry (StatusList2021)
   - **Test Status**: `"Verify revoked credential - RevocationList2020"` test skipped
   - **Note**: StatusList2021 and BitstringStatusListEntry tests pass successfully

3. **Express (4.x → 5.x)**
   - No breaking changes affecting current codebase
   - All tests pass with Express 5

4. **TypeScript (4.9 → 5.9)**
   - No breaking changes affecting current codebase
   - Compilation successful

**Frontend Dependencies:**

1. **ESLint (8.x required, not 9.x)**
   - ESLint 9 has breaking changes incompatible with Vue CLI 5
   - Keep at `eslint@^8.0.0` until Vue CLI updates
   - Vue CLI 5 is in maintenance mode; consider future migration to Vite

2. **Vue ecosystem updates**
   - All Vue 3.2 → 3.5 updates compatible
   - No breaking changes in Bootstrap 5.2 → 5.3

**Recommendations:**
- When upgrading Digital Bazaar libraries, check for test credential compatibility
- Consider generating test credentials with a test harness that uses current library versions
- Monitor RevocationList2020 deprecation; StatusList2021/BitstringStatusList is the newer standard
- For ecdsa-sd-2023 credentials, use v3.x format or pin to older cryptosuite version

## Troubleshooting

### API Won't Start

**Check**:
- Port 3000 available? (`lsof -i :3000`)
- Environment variables set?
- Dependencies installed? (`npm install`)
- TypeScript compiled? (`npm run build-tsc`)

### Frontend Build Fails

**Check**:
- Node version compatible?
- Dependencies installed? (`npm install`)
- Disk space available?
- Clear cache: `rm -rf node_modules/.cache`

### Tests Failing

**Check**:
- All dependencies installed?
- Environment variables for tests set?
- Test database/services available?
- Run single test: `npm test -- --testNamePattern="test name"`

### Docker Build Fails

**Check**:
- Dockerfile syntax correct?
- Base image available?
- Build context correct?
- Use `--no-cache` to force rebuild: `docker build --no-cache`

### Verification Fails in Production

**Check**:
- Document loader can reach external URLs?
- Firewall/proxy blocking requests?
- DID documents accessible?
- Check logs for error details
- Test with `/api/verifier/swagger` UI

## Best Practices

### Code Organization
- Keep routers thin (route definitions only)
- Business logic in route handlers
- Complex logic in services
- Reusable utilities in separate files

### Error Handling
- Always use try-catch in async handlers
- Return meaningful error messages
- Log errors on server side
- Don't expose sensitive details in error responses

### Testing
- Write tests for new features
- Aim for high coverage on critical paths
- Test both success and error cases
- Mock external services in unit tests

### Git Workflow
- Commit frequently with clear messages
- Use feature branches for development
- Keep main branch stable
- Update changelog with each feature/fix

### Documentation
- Update notes after significant changes
- Document complex logic with comments
- Keep README up to date
- Update API documentation (JSDoc/Swagger)
