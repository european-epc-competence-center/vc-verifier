const swaggerOptions: any = {
  info: {
    version: '4.0.1',
    title: 'EECC Verifiable Credential Verifier API',
    license: {
      name: 'Apache-2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0',
    },
    contact: {
      name: 'European EPC Competence Center GmbH (EECC)',
      url: 'https://eecc.de',
    },
    description: [
      'REST API for verifying [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/) and Verifiable Presentations.',
      '',
      '**Supported input formats**',
      '- JSON-LD credentials and presentations (VC Data Model v1.1 and v2.0)',
      '- Compact JWT strings (`application/vc+jwt`, `application/vp+jwt`)',
      '- Enveloped credentials (`EnvelopedVerifiableCredential`)',
      '',
      '**What verification covers**',
      '- Cryptographic proof validation (Ed25519, ECDSA, RSA, Data Integrity suites)',
      '- Issuer DID resolution and verification method checks',
      '- Credential status (revocation and suspension via BitstringStatusList)',
      '- Presentation proofs with optional challenge/nonce and domain/audience binding',
      '- Optional holder binding between presentation holder and credential subjects',
      '',
      '**GS1 endpoint** — `POST /api/verifier/gs1` applies the same cryptographic checks plus GS1 VC business rules (prefix licence chains, product credentials, etc.).',
      '',
      '**VCALM** — `POST /api/vcalm/credentials/verify` and `POST /api/vcalm/presentations/verify` each verify one document. HTTP 200 means it was accepted. HTTP 400 means it was rejected. `POST /api/verifier` is unchanged and still returns HTTP 200 with `verified: false` when a proof fails.',
      '',
      'Interactive UI: `/api/verifier/swagger` · OpenAPI JSON: `/api/docs`',
    ].join('\n'),
  },
  servers: [
    {
      url: '/',
      description: 'Current deployment host',
    },
  ],
  // Base directory which we use to locate your JSDOC files
  baseDir: './',
  // Glob pattern to find your jsdoc files (multiple patterns can be added in an array)
  filesPattern: './dist/**/*.js',
  // URL where SwaggerUI will be rendered
  swaggerUIPath: '/api/verifier/swagger',
  // Expose OpenAPI UI
  exposeSwaggerUI: true,
  // Expose Open API JSON Docs documentation in `apiDocsPath` path.
  exposeApiDocs: true,
  // Open API JSON Docs endpoint.
  apiDocsPath: '/api/docs',
  // Set non-required fields as nullable by default
  notRequiredAsNullable: false,
  // You can customize your UI options.
  // you can extend swagger-ui-express config. You can checkout an example of this
  // in the `example/configuration/swaggerOptions.js`
  swaggerUiOptions: {},
  // multiple option in case you want more that one instance
  multiple: true,
}

export default swaggerOptions;
