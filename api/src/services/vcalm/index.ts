import { verify, type VerifyOptions } from '../verifier/index.js';
import { verifyGs1 } from '../verifier/gs1.js';
import { isJWT } from '../verifier/jwt.js';
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
 * VCALM verify service. Proof checks are performed by `verify`.
 * `options.checks` containing `gs1Rules` uses `verifyGs1` instead, then
 * drops `gs1Result` so the VCALM body stays unchanged.
 * HTTP 200 is used only when verification succeeds.
 */
export async function verifyCredential(body: unknown): Promise<VcalmHttpResponse> {
  return verifyDocument(body, 'credential');
}

export async function verifyPresentation(body: unknown): Promise<VcalmHttpResponse> {
  return verifyDocument(body, 'presentation');
}

async function verifyDocument(body: unknown, kind: VcalmKind): Promise<VcalmHttpResponse> {
    const view: VcalmView = { kind };
    try {
      const parsed = parseRequest(body, kind);
      view.document = parsed.document;
      view.options = parsed.options;
      const options = verifyOptions(parsed, kind);
      const result = parsed.gs1Rules
        ? await verifyWithGs1(parsed.document, options)
        : await verify(parsed.document as Verifiable | string, options);
      return toVcalmResponse(result, view);
    } catch (error) {
      return failureToVcalmResponse(error, view);
    }
  }

interface ParsedRequest {
  document: unknown;
  options: VcalmCallOptions;
  checkStatus: boolean;
  gs1Rules: boolean;
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

  const { options, checkStatus, gs1Rules } = readOptions(record.options);
  return {
    document: readDocument(record[key], key),
    options,
    checkStatus,
    gs1Rules,
  };
}

function readDocument(document: unknown, key: string): unknown {
  if (typeof document === 'string') {
    if (!isJWT(document)) {
      throw new VcalmInputError(`${key} must be a JSON object or a compact JWT string`);
    }
    return document;
  }

  if (!document || typeof document !== 'object' || Array.isArray(document)) {
    throw new VcalmInputError(`${key} must be a JSON object or a compact JWT string`);
  }

  return document;
}

function readOptions(
  value: unknown
): { options: VcalmCallOptions; checkStatus: boolean; gs1Rules: boolean } {
  if (value === undefined) {
    return {
      checkStatus: true,
      gs1Rules: false,
      options: { returnResults: false, returnCredential: false, returnPresentation: false },
    };
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new VcalmInputError('options must be an object');
  }

  const options = value as Record<string, unknown>;
  const checkStatus = statusCheckEnabled(options.checks);
  return {
    checkStatus,
    gs1Rules: Array.isArray(options.checks) && options.checks.includes('gs1Rules'),
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

const GS1_RULES_PROBLEM = 'https://ssi.eecc.de/api/vcalm/problems/gs1-rules';

/** Same verifier as `POST /api/verifier/gs1`, mapped onto a VCALM result. */
async function verifyWithGs1(document: unknown, options: VerifyOptions): Promise<any> {
  const response = await verifyGs1(
    document as Verifiable | string,
    options.challenge,
    options.domain,
    options.holderBinding !== false,
    undefined,
    options.checkStatus !== false
  );
  return withoutGs1Result(response);
}

function withoutGs1Result(response: {
  verified: boolean;
  gs1Result?: { verified?: boolean };
  errorMessage?: string;
  errors?: unknown[];
}): any {
  const { gs1Result, errorMessage, ...result } = response;
  if (gs1Result?.verified !== false) return result;

  const problems = gs1RuleProblems(gs1Result);
  const existing = Array.isArray(result.errors) ? result.errors : [];
  return {
    ...result,
    verified: false,
    errors: [
      ...existing,
      ...(problems.length > 0
        ? problems
        : [{
            message: errorMessage
              ? `GS1-010: ${errorMessage}`
              : 'GS1 rules verification failed',
            type: GS1_RULES_PROBLEM,
          }]),
    ],
  };
}

function gs1RuleProblems(
  gs1Result: unknown
): Array<{ code: string; message: string; type: string }> {
  const problems: Array<{ code: string; message: string; type: string }> = [];
  const seenMessages = new Set<string>();
  const seenObjects = new WeakSet<object>();

  const visit = (value: unknown) => {
    if (!value || typeof value !== 'object') return;
    if (seenObjects.has(value)) return;
    seenObjects.add(value);

    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }

    const record = value as Record<string, unknown>;
    if (Array.isArray(record.errors)) {
      for (const error of record.errors) {
        if (!error || typeof error !== 'object') continue;
        const code = (error as { code?: unknown }).code;
        const rule = (error as { rule?: unknown }).rule;
        if (typeof code !== 'string' || typeof rule !== 'string') continue;
        const key = `${code}\n${rule}`;
        if (seenMessages.has(key)) continue;
        seenMessages.add(key);
        problems.push({
          code,
          message: `${code}: ${rule}`,
          type: GS1_RULES_PROBLEM,
        });
      }
    }

    visit(record.result);
    visit(record.resolvedCredential);
  };

  visit(gs1Result);
  return problems;
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
