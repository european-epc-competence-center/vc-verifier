import { Verifier, type VerifyOptions } from '../verifier/index.js';
import { JWTService } from '../verifier/jwt.js';
import {
  VcalmInputError,
  failureToVcalmResponse,
  toVcalmResponse,
  type VcalmCallOptions,
  type VcalmHttpResponse,
  type VcalmView,
} from './response.js';

type VcalmKind = 'credential' | 'presentation';

const DOCUMENT_KEY = {
  credential: 'verifiableCredential',
  presentation: 'verifiablePresentation',
} as const;

/**
 * VCALM verify service. Proof checks are performed by `Verifier`.
 * HTTP 200 is used only when verification succeeds.
 */
export class VcalmService {
  static async verifyCredential(body: unknown): Promise<VcalmHttpResponse> {
    return this.verify(body, 'credential');
  }

  static async verifyPresentation(body: unknown): Promise<VcalmHttpResponse> {
    return this.verify(body, 'presentation');
  }

  private static async verify(body: unknown, kind: VcalmKind): Promise<VcalmHttpResponse> {
    const view: VcalmView = { kind };
    try {
      const parsed = parseRequest(body, kind);
      view.document = parsed.document;
      view.options = parsed.options;
      const result = await Verifier.verify(
        parsed.document as Verifiable | string,
        verifyOptions(parsed, kind)
      );
      return toVcalmResponse(result, view);
    } catch (error) {
      return failureToVcalmResponse(error, view);
    }
  }
}

interface ParsedRequest {
  document: unknown;
  options: VcalmCallOptions;
  checkStatus: boolean;
}

function parseRequest(body: unknown, kind: VcalmKind): ParsedRequest {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new VcalmInputError('Request body must be a JSON object');
  }

  const record = body as Record<string, unknown>;
  const key = DOCUMENT_KEY[kind];
  if (!(key in record)) {
    throw new VcalmInputError(`Request body must include ${key}`);
  }

  const { options, checkStatus } = readOptions(record.options);
  return {
    document: readDocument(record[key], key),
    options,
    checkStatus,
  };
}

function readDocument(document: unknown, key: string): unknown {
  if (typeof document === 'string') {
    if (!JWTService.isJWT(document)) {
      throw new VcalmInputError(`${key} must be a JSON object or a compact JWT string`);
    }
    return document;
  }

  if (!document || typeof document !== 'object' || Array.isArray(document)) {
    throw new VcalmInputError(`${key} must be a JSON object or a compact JWT string`);
  }

  return document;
}

function readOptions(value: unknown): { options: VcalmCallOptions; checkStatus: boolean } {
  if (value === undefined) {
    return {
      checkStatus: true,
      options: { returnResults: false, returnCredential: false, returnPresentation: false },
    };
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new VcalmInputError('options must be an object');
  }

  const options = value as Record<string, unknown>;
  return {
    checkStatus: statusCheckEnabled(options.checks),
    options: {
      challenge: optionalString(options.challenge, 'options.challenge'),
      domain: optionalString(options.domain, 'options.domain'),
      returnResults: options.returnResults === true,
      returnCredential: options.returnCredential === true,
      returnPresentation: options.returnPresentation === true,
    },
  };
}

function verifyOptions(parsed: ParsedRequest, kind: VcalmKind): VerifyOptions {
  const verify: VerifyOptions = { checkStatus: parsed.checkStatus };
  if (parsed.options.challenge !== undefined) verify.challenge = parsed.options.challenge;
  if (parsed.options.domain !== undefined) verify.domain = parsed.options.domain;
  if (kind === 'presentation') verify.holderBinding = false;
  return verify;
}

function statusCheckEnabled(checks: unknown): boolean {
  if (checks === undefined) return true;
  if (!Array.isArray(checks) || checks.some((check) => typeof check !== 'string')) {
    throw new VcalmInputError('options.checks must be an array of strings');
  }
  return checks.includes('credentialStatus');
}

function optionalString(value: unknown, name: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') {
    throw new VcalmInputError(`${name} must be a string`);
  }
  return value;
}
