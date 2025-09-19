import * as jose from 'jose';
import { ed25519 } from '@noble/curves/ed25519.js';
import { documentLoader } from '../documentLoader/index.js';
import { decode } from 'multibase';
import { varint } from 'multiformats';

export interface JWTDetectionResult {
  verified: boolean;
  results: JWTResult[];
}

export interface JWTResult {
  jwt: string;
  decoded: JWTDecoded | { error: string };
}

export interface JWTDecoded {
  header: any;
  payload: any;
}

// Types from the example
type KNOWN_KEY_TYPE = 'Secp256k1' | 'Ed25519' | 'X25519' | 'Bls12381G1' | 'Bls12381G2' | 'P-256'
type KNOWN_VERIFICATION_METHOD = 
  | 'JsonWebKey2020'
  | 'Ed25519VerificationKey2018'
  | 'Ed25519VerificationKey2020'
  | 'EcdsaSecp256k1VerificationKey2019'
  // ... add others as needed

type KNOWN_CODECS = 'ed25519-pub' | 'x25519-pub' | 'secp256k1-pub' | 'p256-pub'

// Helper functions from the example
function stringToBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function base64ToBytes(s: string): Uint8Array {
  const inputBase64Url = s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const binaryString = atob(inputBase64Url.replace(/-/g, '+').replace(/_/g, '/').padEnd(inputBase64Url.length + (4 - inputBase64Url.length % 4) % 4, '='));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function base58ToBytes(s: string): Uint8Array {
  // Using multibase decode with base58btc prefix
  return decode('z' + s);
}

const supportedCodecs: Record<KNOWN_CODECS, number> = {
  'ed25519-pub': 0xed,
  'x25519-pub': 0xec,
  'secp256k1-pub': 0xe7,
  'p256-pub': 0x1200,
}

const CODEC_TO_KEY_TYPE: Record<KNOWN_CODECS, KNOWN_KEY_TYPE> = {
  'ed25519-pub': 'Ed25519',
  'p256-pub': 'P-256',
  'secp256k1-pub': 'Secp256k1',
  'x25519-pub': 'X25519',
}

const VM_TO_KEY_TYPE: Record<string, KNOWN_KEY_TYPE | undefined> = {
  'Ed25519VerificationKey2018': 'Ed25519',
  'Ed25519VerificationKey2020': 'Ed25519',
  'JsonWebKey2020': undefined, // key type must be specified in the JWK
}

function multibaseToBytes(s: string): { keyBytes: Uint8Array; keyType?: KNOWN_KEY_TYPE } {
  const bytes = decode(s);

  // look for known key lengths first
  if ([32, 33, 48, 64, 65, 96].includes(bytes.length)) {
    return { keyBytes: bytes };
  }

  // then assume multicodec
  try {
    const [codec, length] = varint.decode(bytes);
    const possibleCodec: string | undefined =
      Object.entries(supportedCodecs).filter(([, code]) => code === codec)?.[0][0] ?? '';
    return { keyBytes: bytes.slice(length), keyType: CODEC_TO_KEY_TYPE[possibleCodec as KNOWN_CODECS] };
  } catch (e) {
    return { keyBytes: bytes };
  }
}

function extractPublicKeyBytes(pk: any): { keyBytes: Uint8Array; keyType?: KNOWN_KEY_TYPE } {
  if (pk.publicKeyBase58) {
    return {
      keyBytes: base58ToBytes(pk.publicKeyBase58),
      keyType: VM_TO_KEY_TYPE[pk.type as string],
    };
  } else if (pk.publicKeyBase64) {
    return {
      keyBytes: base64ToBytes(pk.publicKeyBase64),
      keyType: VM_TO_KEY_TYPE[pk.type as string],
    };
  } else if (pk.publicKeyJwk && pk.publicKeyJwk.kty === 'OKP' && pk.publicKeyJwk.x) {
    return { 
      keyBytes: base64ToBytes(pk.publicKeyJwk.x), 
      keyType: pk.publicKeyJwk.crv as KNOWN_KEY_TYPE 
    };
  } else if (pk.publicKeyMultibase) {
    const { keyBytes, keyType } = multibaseToBytes(pk.publicKeyMultibase);
    return { keyBytes, keyType: keyType ?? VM_TO_KEY_TYPE[pk.type as string] };
  }
  return { keyBytes: new Uint8Array() };
}

export class JWTService {
  static isJWT(input: string): boolean {
    if (typeof input !== 'string') return false;
    return /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(input.trim());
  }

  static decodeJWT(jwt: string): JWTDecoded | { error: string } {
    try {
      const decoded = jose.decodeJwt(jwt);
      const header = jose.decodeProtectedHeader(jwt);

      return {
        header,
        payload: decoded
      };
    } catch (error) {
      return { error: `Invalid JWT format: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  static async verifyJWT(jwt: string): Promise<JWTDetectionResult> {
    const decoded = this.decodeJWT(jwt);

    if ('error' in decoded) {
      return {
        verified: false,
        results: [{
          jwt,
          decoded
        }]
      };
    }

    let verified = false;
    const issuer = decoded.payload.issuer?.id || decoded.payload.issuer || decoded.payload.iss;
    const kid = decoded.header.kid;
    const alg = decoded.header.alg;

    if (!issuer || !kid) {
      return {
        verified: false,
        results: [{
          jwt,
          decoded
        }]
      };
    }
    
    const verificationMethodUrl = kid.split('#').length > 1 ? kid : `${issuer}#${kid}`;

    let verificationMethod = null;
    try {
      const res = await documentLoader(verificationMethodUrl);
      verificationMethod = res.document;
    } catch (error) {
      return {
        verified: false,
        results: [{
          jwt,
          decoded
        }]
      };
    }

    if (!verificationMethod) {
      return {
        verified: false,
        results: [{
          jwt,
          decoded
        }]
      };
    }

    // Handle JsonWebKey (for ES256, ES256K, etc.)
    if (verificationMethod.type === 'JsonWebKey' && verificationMethod.publicKeyJwk) {
      try {
        const jwk = { ...verificationMethod.publicKeyJwk };
        if (!jwk.alg && alg) {
          jwk.alg = alg;
        }
        
        const publicKey = await jose.importJWK(jwk);
        await jose.jwtVerify(jwt, publicKey, {
          algorithms: [alg]
        });
        
        verified = true;
        console.log(`      JWT verified: ${alg} signature`);

      } catch (error) {
        return {
          verified: false,
          results: [{
            jwt,
            decoded
          }]
        };
      }
    }
    // Handle Ed25519 verification methods
    else if ((verificationMethod.type === 'Ed25519VerificationKey2020' || 
              verificationMethod.type === 'Ed25519VerificationKey2018') &&
             (alg === 'Ed25519' || alg === 'EdDSA')) {
      
      try {
        const [headerB64, payloadB64, signatureB64] = jwt.split('.');
        const signingInput = headerB64 + '.' + payloadB64;
        const signingInputBytes = stringToBytes(signingInput);
        const signatureBytes = base64ToBytes(signatureB64);
        const { keyBytes, keyType } = extractPublicKeyBytes(verificationMethod);
        
        if (keyType === 'Ed25519') {
          const isValid = ed25519.verify(signatureBytes, signingInputBytes, keyBytes);
          if (isValid) {
            verified = true;
            console.log(`      JWT verified: ${alg} signature`);
          } else {
            return {
              verified: false,
              results: [{
                jwt,
                decoded
              }]
            };
          }
        } else {
          return {
            verified: false,
            results: [{
              jwt,
              decoded
            }]
          };
        }

      } catch (error) {
        return {
          verified: false,
          results: [{
            jwt,
            decoded
          }]
        };
      }
    }
    else {
      return {
        verified: false,
        results: [{
          jwt,
          decoded
        }]
      };
    }

    return {
      verified,
      results: [{
        jwt,
        decoded
      }]
    };
  }
}