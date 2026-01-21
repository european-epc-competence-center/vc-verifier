# Frontend Architecture

## Overview

The frontend is a Vue.js 3 single-page application (SPA) that provides a user interface for verifying W3C Verifiable Credentials and Presentations. It uses Vuex for state management, Vue Router for navigation, and Bootstrap 5 for styling.

## Technology Stack

- **Framework**: Vue.js 3.2
- **State Management**: Vuex 4
- **Routing**: Vue Router 4 (hash history)
- **HTTP Client**: Axios
- **UI Framework**: Bootstrap 5
- **Build Tool**: Vue CLI 5
- **Styling**: SCSS with custom variables
- **Testing**: Jest (unit), Cypress (E2E)

## Application Structure

### Entry Point (`main.js`)

**Responsibilities**:
- Create Vue app instance
- Register global plugins (router, store, toast)
- Configure global properties (`$api`, `$isURL`, `$getCredentialValue`)
- Mount app to DOM

### Root Component (`App.vue`)

Minimal root component containing only `<router-view />`. Imports global styles (SCSS, Bootstrap).

## Routing Architecture

**File**: `src/router/index.js`

### Route Structure
```javascript
/ (DefaultLayout)
  ├── /           → Entry.vue (credential input)
  ├── /verify     → Verify.vue (results display)
  └── /request    → PresentationRequest.vue (OID4VP)
```

**History Mode**: Hash-based (`createWebHashHistory`)
- URLs: `/#/`, `/#/verify`, `/#/request`
- Preserves deep links on static hosting

**Scroll Behavior**: Always scroll to top on navigation

## Layout System

### DefaultLayout (`layouts/DefaultLayout.vue`)

Wraps all pages with consistent header/footer structure. Contains:
- Application header (logo, version)
- Navigation elements
- Main content area (`<router-view />`)
- Footer

## View Components (Pages)

### Entry View (`views/Entry.vue`)

**Purpose**: Credential selection and input

**Features**:
- Upload credentials (files)
- Reference credentials (URL)
- Query credentials (subject ID)
- QR code scanner
- Authentication modal
- Navigation to verification

**State Actions**:
- `resetVerifiables()` on mount
- `addVerifiables()` on credential selection

### Verify View (`views/Verify.vue`)

**Purpose**: Display verification results

**Features**:
- Iterate through verified credentials
- Render individual credentials
- Render product passports (special credential type)
- Display verification status
- Export options (PDF, JSON, QR)

**State Dependencies**:
- `state.verifiables` - Array of verified credentials
- Listens for state changes

### PresentationRequest View (`views/PresentationRequest.vue`)

**Purpose**: Handle OpenID4VP presentation requests

**Features**:
- Parse presentation request parameters
- Display requested credential types
- Initiate wallet interactions
- Handle OID4VP protocol flow

## Component Architecture

### Display Components

#### Credential (`components/Credential.vue`)

**Purpose**: Single credential display card

**Features**:
- Credential metadata (issuer, dates, status)
- Proof verification display
- Credential subject data
- Action buttons (download, QR, disclose)
- Status indicators (verified, revoked, pending)

**Props**:
- Credential data
- Verification result
- Display options

#### ProductPassport (`components/ProductPassport.vue`)

**Purpose**: Specialized display for product passport credentials

**Features**:
- Product images
- GS1 digital link
- Product attributes (origin, dates, batch)
- Merged properties from multiple credentials
- Hierarchical product data

**Context Detection**: Recognizes `ProductPassportCredential` type

#### Passport (`components/Passport.vue`)

**Purpose**: Wrapper for product passport rendering

**Features**:
- Groups credentials by subject ID
- Merges properties from multiple credentials
- Delegates to `ProductPassport` for rendering

#### MergedProps (`components/MergedProps.vue`)

**Purpose**: Display merged properties from multiple credentials

**Features**:
- Property consolidation
- Override handling (newer credentials win)
- Nested property support
- JSON-LD context resolution

#### TrimmedBatch (`components/TrimmedBatch.vue`)

**Purpose**: Display long batch/serial numbers

**Features**:
- Truncation with ellipsis
- Tooltip on hover
- Click-to-copy functionality

### Modal Components

#### AuthModal (`components/AuthModal.vue`)

**Purpose**: Authentication for protected credentials

**Features**:
- JWT input field
- Bearer token support
- OID4VP authentication flow
- Store authentication state

**State Integration**:
- Updates `state.authentication`

#### DiscloseModal (`components/DiscloseModal.vue`)

**Purpose**: Request selective disclosure credentials

**Features**:
- QR code generation for OID4VP request
- Credential type selection
- Challenge/domain configuration
- Result handling

**Protocol**: OpenID4VC with Verifiable Presentations

#### QRModal (`components/QRModal.vue`)

**Purpose**: Display QR code for credential

**Features**:
- QR code rendering with `qrcode.vue`
- Copy to clipboard
- Download QR image
- Responsive sizing

#### ScanModal (`components/ScanModal.vue`)

**Purpose**: QR code scanner

**Features**:
- Camera access
- QR code detection (`vue3-qrcode-reader`)
- Auto-close on scan
- Error handling

## State Management (Vuex)

**File**: `src/store/index.js`

### State Structure
```javascript
{
  version: '3.2.1',
  authentication: undefined,           // Bearer token
  verifiables: [],                    // Array of credentials/presentations
  disclosedCredentials: [],           // IDs of disclosed credentials
  VC_REGISTRY: 'https://...',         // Registry URL
  OPENID_ENDPOINT: 'https://...'      // OID4VP endpoint
}
```

### Mutations

**`updateAuthentication(state, payload)`**
- Sets authentication token
- Used by AuthModal

**`addVerifiables(state, verifiables)`**
- Appends verifiables to state
- Handles single or array input

**`resetVerifiables(state)`**
- Clears verifiables array
- Called on Entry page mount

**`addDisclosedCredential(state, credential)`**
- Tracks disclosed credential IDs
- Prevents duplicate disclosure requests

### Actions

**`addVerifiables(context, verifiables)`**
- Wrapper for addVerifiables mutation

**`resetVerifiables()`**
- Wrapper for resetVerifiables mutation

**`makeAuthenticatedRequest(context, payload)`**
- Posts authenticated VP to endpoint
- Receives and stores disclosed credentials
- OID4VP with authVP extension

## API Integration

**File**: `src/api.js`

**Axios Instance Configuration**:
```javascript
baseURL: process.env.VUE_APP_VERIFIER_API || 'https://ssi.eecc.de/api/verifier'
timeout: 5000
headers: { 'Accept': 'application/ld+json,application/json,*/*' }
```

**Usage**:
- Injected as `this.$api` globally
- Used for verification requests
- Handles JSON-LD and JWT responses

## Utility Functions

**File**: `src/utils.js`

**Key Functions**:
- `isURL(string)` - URL validation (injected as `this.$isURL`)
- `getCredentialValue(credential, path)` - Deep property access (injected as `this.$getCredentialValue`)
- Various credential data extraction helpers

**PDF Generation**: `src/pdf.js`
- Uses `pdfmake` library
- Generates downloadable PDFs of credentials
- Custom styling and layout

## Styling Architecture

### Global Styles (`src/styles/`)

**`style.scss`**:
- Main stylesheet
- Imports Bootstrap
- Custom component styles
- Utility classes

**`_variables.scss`**:
- SCSS variables (colors, spacing, breakpoints)
- Bootstrap variable overrides
- Theme customization

### Component-level Styles

Most components use scoped styles:
```vue
<style scoped lang="scss">
// Component-specific styles
</style>
```

## Build Configuration

**File**: `vue.config.js`

**Key Configurations**:
- Public path configuration
- Environment variable injection
- Webpack customization
- PWA configuration

## Progressive Web App (PWA)

**Manifest**: `public/manifest.json`

**Features**:
- App icons (multiple sizes)
- Maskable icons (Android)
- Apple touch icons
- Offline capability (service worker)
- Installable on mobile devices

## Testing Setup

### Unit Tests (Jest)

**Config**: `jest.config.js`

**Test Types**:
- Component rendering tests
- State management tests
- Utility function tests

### E2E Tests (Cypress)

**Config**: `cypress.json`

**Test Scenarios**:
- Credential upload flow
- Verification result display
- Navigation between views
- Modal interactions

## Component Communication Patterns

### Parent-Child (Props)
```vue
<Credential :credential="cred" :verificationResult="result" />
```

### Child-Parent (Events)
```vue
// Child
this.$emit('credential-selected', credential)

// Parent
<Component @credential-selected="handleSelection" />
```

### Sibling (Vuex Store)
```vue
// Component A
this.$store.commit('addVerifiables', credentials)

// Component B
computed: {
  credentials() { return this.$store.state.verifiables }
}
```

### Global Event Bus (Toast Notifications)
```vue
this.$toast.success('Credential verified!')
this.$toast.error('Verification failed')
```

## Routing Patterns

### Programmatic Navigation
```javascript
// Navigate to verify page
this.$router.push('/verify')

// Navigate with query params
this.$router.push({
  path: '/verify',
  query: { subjectId: 'https://...' }
})
```

### Route Guards
None currently implemented. All routes are public.

## Data Flow

### Verification Flow

```
User Input (Entry.vue)
    ↓
Upload/Reference/Query credentials
    ↓
Call API via axios (this.$api)
    ↓
Receive verification results
    ↓
Store in Vuex (addVerifiables)
    ↓
Navigate to /verify
    ↓
Verify.vue reads from store
    ↓
Render Credential components
```

### Authentication Flow

```
Protected resource encountered
    ↓
Open AuthModal
    ↓
User provides JWT
    ↓
Store authentication (Vuex mutation)
    ↓
Retry request with Bearer token
    ↓
Store returned credentials
```

## Configuration & Environment

### Environment Variables

**`.env` files**:
- `.env` - Default values
- `.env.local` - Local overrides (gitignored)
- `.env.production` - Production values

**Variables**:
- `VUE_APP_VERIFIER_API` - API base URL
- `VC_REGISTRY` - Credential registry
- `OPENID_ENDPOINT` - OID4VP endpoint
- `BASE_URL` - App base URL
- `PUBLIC_PATH` - Public path for assets

## Performance Considerations

### Lazy Loading

**Routes**: All route components are lazy-loaded
```javascript
component: () => import('@/views/Verify.vue')
```

### Bundle Optimization
- Vue CLI automatic code splitting
- Vendor chunk separation
- CSS extraction

### Reactive Data
- Only essential data in Vuex state
- Computed properties for derived data
- v-if for conditional rendering (not v-show for large components)

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast color scheme

## Browser Support

**Targets** (from browserslist):
- Modern browsers (ES2015+)
- Last 2 versions of major browsers
- No IE support

## Deployment

**Static Hosting**: Nginx container serves built files

**Dockerfile Pattern**:
1. Build stage: `npm run build`
2. Production stage: Nginx with built files
3. Env variable injection at runtime
