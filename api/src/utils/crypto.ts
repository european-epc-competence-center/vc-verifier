import { decode } from 'multibase';
import { varint } from 'multiformats';

export type KNOWN_KEY_TYPE = 'Secp256k1' | 'Ed25519' | 'X25519' | 'Bls12381G1' | 'Bls12381G2' | 'P-256';

export type KNOWN_CODECS = 'ed25519-pub' | 'x25519-pub' | 'secp256k1-pub' | 'p256-pub';

export function stringToBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

export function base64ToBytes(s: string): Uint8Array {
  const inputBase64Url = s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const binaryString = atob(inputBase64Url.replace(/-/g, '+').replace(/_/g, '/').padEnd(inputBase64Url.length + (4 - inputBase64Url.length % 4) % 4, '='));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function base58ToBytes(s: string): Uint8Array {
  return decode('z' + s);
}

const supportedCodecs: Record<KNOWN_CODECS, number> = {
  'ed25519-pub': 0xed,
  'x25519-pub': 0xec,
  'secp256k1-pub': 0xe7,
  'p256-pub': 0x1200,
};

const CODEC_TO_KEY_TYPE: Record<KNOWN_CODECS, KNOWN_KEY_TYPE> = {
  'ed25519-pub': 'Ed25519',
  'p256-pub': 'P-256',
  'secp256k1-pub': 'Secp256k1',
  'x25519-pub': 'X25519',
};

const VM_TO_KEY_TYPE: Record<string, KNOWN_KEY_TYPE | undefined> = {
  'Ed25519VerificationKey2018': 'Ed25519',
  'Ed25519VerificationKey2020': 'Ed25519',
  'JsonWebKey2020': undefined,
};

function multibaseToBytes(s: string): { keyBytes: Uint8Array; keyType?: KNOWN_KEY_TYPE } {
  const bytes = decode(s);

  if ([32, 33, 48, 64, 65, 96].includes(bytes.length)) {
    return { keyBytes: bytes };
  }

  try {
    const [codec, length] = varint.decode(bytes);
    const possibleCodec = Object.entries(supportedCodecs).find(([, code]) => code === codec)?.[0];
    return { 
      keyBytes: bytes.slice(length), 
      keyType: possibleCodec ? CODEC_TO_KEY_TYPE[possibleCodec as KNOWN_CODECS] : undefined 
    };
  } catch (e) {
    return { keyBytes: bytes };
  }
}

export function extractPublicKeyBytes(pk: any): { keyBytes: Uint8Array; keyType?: KNOWN_KEY_TYPE } {
  if (pk.publicKeyBase58) {
    return {
      keyBytes: base58ToBytes(pk.publicKeyBase58),
      keyType: VM_TO_KEY_TYPE[pk.type as string],
    };
  }
  
  if (pk.publicKeyBase64) {
    return {
      keyBytes: base64ToBytes(pk.publicKeyBase64),
      keyType: VM_TO_KEY_TYPE[pk.type as string],
    };
  }
  
  if (pk.publicKeyJwk && pk.publicKeyJwk.kty === 'OKP' && pk.publicKeyJwk.x) {
    return { 
      keyBytes: base64ToBytes(pk.publicKeyJwk.x), 
      keyType: pk.publicKeyJwk.crv as KNOWN_KEY_TYPE 
    };
  }
  
  if (pk.publicKeyMultibase) {
    const { keyBytes, keyType } = multibaseToBytes(pk.publicKeyMultibase);
    return { keyBytes, keyType: keyType ?? VM_TO_KEY_TYPE[pk.type as string] };
  }
  
  return { keyBytes: new Uint8Array() };
}