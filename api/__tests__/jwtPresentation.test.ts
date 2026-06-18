import { JWTService } from '../src/services/verifier/jwt.js';

const holderDid = 'did:example:holder';
const verificationMethod = {
  id: `${holderDid}#key-1`,
  controller: holderDid,
};

const holderDocumentLoader = async (url: string) => {
  expect(url).toBe(holderDid);
  return {
    document: {
      id: holderDid,
      '@context': 'https://www.w3.org/ns/did/v1',
      authentication: [`${holderDid}#key-1`],
    },
  };
};

describe('JWT presentation holder binding', () => {
  const payload = {
    nonce: 'kIDRUmrLE6c6rwVAuhCqdD8xo_DMCQbv',
    aud: 'redirect_uri:https://epcat2-dev.prod-k8s.eecc.de/api/auth/oid4vp/response',
  };

  test('extracts nonce and aud from JWT presentation payloads', () => {
    expect(JWTService.holderBindingFromPayload(payload)).toEqual({
      nonce: payload.nonce,
      aud: payload.aud,
    });
  });

  test('accepts matching nonce and aud via AuthenticationProofPurpose', async () => {
    const binding = JWTService.holderBindingFromPayload(payload);

    const result = await JWTService.validatePresentationHolderBinding(
      {
        challenge: payload.nonce,
        domain: payload.aud,
      },
      binding,
      verificationMethod,
      holderDocumentLoader
    );

    expect(result).toEqual({
      valid: true,
      nonce: payload.nonce,
    });
  });

  test('accepts aud when provided as an array', async () => {
    const binding = {
      nonce: 'abc123',
      aud: ['other', 'verifier'],
    };

    const result = await JWTService.validatePresentationHolderBinding(
      { challenge: 'abc123', domain: 'verifier' },
      binding,
      verificationMethod,
      holderDocumentLoader
    );

    expect(result.valid).toBe(true);
  });

  test('rejects missing nonce before delegating to AuthenticationProofPurpose', async () => {
    const result = await JWTService.validatePresentationHolderBinding(
      {},
      {},
      verificationMethod,
      holderDocumentLoader
    );

    expect(result.valid).toBe(false);
    expect(result.error?.message).toBe(
      'JWT presentation is missing required nonce claim.'
    );
  });

  test('rejects mismatched nonce', async () => {
    const binding = JWTService.holderBindingFromPayload(payload);

    const result = await JWTService.validatePresentationHolderBinding(
      { challenge: 'wrong-nonce' },
      binding,
      verificationMethod,
      holderDocumentLoader
    );

    expect(result.valid).toBe(false);
    expect(result.error?.message).toContain('The challenge is not as expected');
  });

  test('rejects missing nonce in payload when challenge is expected', async () => {
    const result = await JWTService.validatePresentationHolderBinding(
      { challenge: payload.nonce },
      { aud: payload.aud },
      verificationMethod,
      holderDocumentLoader
    );

    expect(result.valid).toBe(false);
    expect(result.error?.message).toContain('The challenge is not as expected');
  });

  test('rejects mismatched aud when domain option is provided', async () => {
    const binding = JWTService.holderBindingFromPayload(payload);

    const result = await JWTService.validatePresentationHolderBinding(
      {
        challenge: payload.nonce,
        domain: 'redirect_uri:https://other.example/response',
      },
      binding,
      verificationMethod,
      holderDocumentLoader
    );

    expect(result.valid).toBe(false);
    expect(result.error?.message).toContain('The domain is not as expected');
  });

  test('skips aud validation when no domain option is provided', async () => {
    const binding = JWTService.holderBindingFromPayload(payload);

    const result = await JWTService.validatePresentationHolderBinding(
      { challenge: payload.nonce },
      binding,
      verificationMethod,
      holderDocumentLoader
    );

    expect(result.valid).toBe(true);
  });
});
