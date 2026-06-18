import {
  applyCredentialHolderBinding,
  checkHolderMatchesController,
  checkHolderMatchesCredentialSubject,
  checkPayloadHolderMatches,
  resolveEntityId,
  resolveHolderFromVerificationMethod,
  validateCredentialHolderBinding,
} from '../src/services/verifier/holder.js';
import { JWTService } from '../src/services/verifier/jwt.js';

const holderDid = 'did:example:holder';
const subjectDid = 'did:example:subject';

describe('presentation holder binding helpers', () => {
  test('resolveEntityId supports string and object forms', () => {
    expect(resolveEntityId(holderDid)).toBe(holderDid);
    expect(resolveEntityId({ id: holderDid })).toBe(holderDid);
  });

  test('accepts matching DID holder and credential subject', () => {
    expect(
      checkHolderMatchesCredentialSubject(holderDid, holderDid)
    ).toEqual({ valid: true });
  });

  test('rejects mismatched DID holder and credential subject', () => {
    const result = checkHolderMatchesCredentialSubject(holderDid, subjectDid);

    expect(result.valid).toBe(false);
    expect(result.error?.message).toContain('does not match credential subject');
  });

  test('skips holder-subject enforcement for non-DID subjects', () => {
    expect(
      checkHolderMatchesCredentialSubject(
        holderDid,
        'https://example.com/product/123'
      )
    ).toEqual({ valid: true });
  });

  test('rejects when holder does not match signing key controller', () => {
    const result = checkHolderMatchesController(holderDid, subjectDid);

    expect(result.valid).toBe(false);
    expect(result.error?.message).toContain('does not match signing key controller');
  });

  test('resolveHolderFromVerificationMethod prefers controller over verification method id', () => {
    expect(
      resolveHolderFromVerificationMethod({
        id: `${subjectDid}#key-1`,
        controller: holderDid,
      })
    ).toBe(holderDid);
  });

  test('resolveHolderFromVerificationMethod falls back to verification method id prefix', () => {
    expect(
      resolveHolderFromVerificationMethod({
        id: `${holderDid}#key-1`,
      })
    ).toBe(holderDid);
  });

  test('checkPayloadHolderMatches accepts absent holder claim', () => {
    expect(checkPayloadHolderMatches(holderDid, undefined)).toEqual({
      valid: true,
    });
  });

  test('checkPayloadHolderMatches rejects mismatched holder claim', () => {
    const result = checkPayloadHolderMatches(holderDid, subjectDid);

    expect(result.valid).toBe(false);
    expect(result.error?.message).toContain('does not match signing key holder');
  });

  test('validateCredentialHolderBinding rejects mismatched DID subjects', () => {
    const result = validateCredentialHolderBinding({
      holder: holderDid,
      verifiableCredential: {
        credentialSubject: { id: subjectDid },
      },
    });

    expect(result.valid).toBe(false);
    expect(result.error?.message).toContain('does not match credential subject');
  });

  test('applyCredentialHolderBinding skips validation when enforcement is disabled', () => {
    const presentationResult = { verified: true, results: [] };
    const presentation = {
      holder: holderDid,
      verifiableCredential: {
        credentialSubject: { id: subjectDid },
      },
    };

    expect(
      applyCredentialHolderBinding(presentationResult, presentation, false)
    ).toBe(presentationResult);
  });
});

describe('JWT presentation holder-controller binding', () => {
  const payload = {
    nonce: 'kIDRUmrLE6c6rwVAuhCqdD8xo_DMCQbv',
    aud: 'redirect_uri:https://example.com/response',
    holder: holderDid,
  };

  const holderDocumentLoader = async (url: string) => ({
    document: {
      id: url,
      '@context': 'https://www.w3.org/ns/did/v1',
      authentication: [`${url}#key-1`],
    },
  });

  test('rejects when JWT holder claim does not match signing key controller', async () => {
    const binding = JWTService.holderBindingFromPayload(payload);
    const verificationMethod = {
      id: `${subjectDid}#key-1`,
      controller: subjectDid,
    };

    const result = await JWTService.validatePresentationHolderBinding(
      { nonce: payload.nonce, aud: payload.aud },
      binding,
      verificationMethod,
      holderDocumentLoader
    );

    expect(result.valid).toBe(false);
    expect(result.error?.message).toContain('does not match signing key holder');
  });

  test('skips JWT holder claim check when enforcement is disabled', async () => {
    const binding = JWTService.holderBindingFromPayload(payload);
    const verificationMethod = {
      id: `${subjectDid}#key-1`,
      controller: subjectDid,
    };

    const result = await JWTService.validatePresentationHolderBinding(
      { nonce: payload.nonce, aud: payload.aud },
      binding,
      verificationMethod,
      holderDocumentLoader,
      false
    );

    expect(result.valid).toBe(true);
    expect(result.holder).toBe(subjectDid);
  });
});
