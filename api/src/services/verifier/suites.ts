// @ts-ignore
import { Ed25519Signature2018 } from "@digitalbazaar/ed25519-signature-2018";
// @ts-ignore
import { Ed25519Signature2020 } from "@digitalbazaar/ed25519-signature-2020";
// @ts-ignore
import { ES256Signature2020 } from "@eecc/es256-signature-2020";
// @ts-ignore
import * as ecdsaSd2023Cryptosuite from "@digitalbazaar/ecdsa-sd-2023-cryptosuite";
// @ts-ignore
import { cryptosuite as eddsaRdfc2022CryptoSuite } from "@digitalbazaar/eddsa-rdfc-2022-cryptosuite";
// @ts-ignore
import { cryptosuite as ecdsaRdfc2019CryptoSuite } from "@digitalbazaar/ecdsa-rdfc-2019-cryptosuite";
// @ts-ignore
import { cryptosuite as rsaRdfc2025CryptoSuite } from "@eecc/rsa-rdfc-2025-cryptosuite";
// @ts-ignore
import { DataIntegrityProof } from "@digitalbazaar/data-integrity";

const { createVerifyCryptosuite } = ecdsaSd2023Cryptosuite;

function getDataIntegritySuite(cryptosuite?: string): unknown {
  if (!cryptosuite) {
    throw new Error('Cryptosuite is required for data integrity proof');
  }

  switch (cryptosuite) {
    case 'eddsa-rdfc-2022':  return eddsaRdfc2022CryptoSuite;
    case 'ecdsa-rdfc-2019':  return ecdsaRdfc2019CryptoSuite;
    case 'rsa-rdfc-2025':    return rsaRdfc2025CryptoSuite;
    case 'ecdsa-sd-2023':    return createVerifyCryptosuite();
    default:
      throw new Error(`Cryptosuite ${cryptosuite} not implemented`);
  }
}

export function getSuite(proof: any): unknown {
  switch (proof?.type) {
    case 'Ed25519Signature2018': return new Ed25519Signature2018();
    case 'Ed25519Signature2020': return new Ed25519Signature2020();
    case 'JsonWebSignature2020': return new ES256Signature2020();
    case 'DataIntegrityProof':
      return new DataIntegrityProof({ cryptosuite: getDataIntegritySuite(proof.cryptosuite) });
    default:
      throw new Error(`Proof type ${proof?.type} not implemented`);
  }
}

export function getSuites(proof: any | any[]): unknown[] {
  if (Array.isArray(proof)) {
    return proof.map(getSuite);
  }
  return [getSuite(proof)];
}
