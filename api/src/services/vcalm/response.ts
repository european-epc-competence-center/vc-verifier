/**
 * Maps a `Verifier` result onto the VCALM verification body.
 * HTTP 200 is returned only when `verified` is true. The VCALM presentation
 * draft returns 200 after a completed check even when `verified` is false;
 * this profile returns 400 so a W3C harness does not count a rejection as a pass.
 */

const CRYPTOGRAPHIC_SECURITY_ERROR =
  'https://www.w3.org/TR/vc-data-model-2.0#CRYPTOGRAPHIC_SECURITY_ERROR';
const STATUS_VERIFICATION_ERROR =
  'https://www.w3.org/TR/vc-bitstring-status-list#STATUS_VERIFICATION_ERROR';
const INVALID_INPUT = 'https://ssi.eecc.de/api/vcalm/problems/invalid-input';

export class VcalmInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VcalmInputError';
  }
}

export interface VcalmProblemDetail {
  type: string;
  title: string;
  detail: string;
}

export interface VcalmCallOptions {
  challenge?: string;
  domain?: string;
  returnResults: boolean;
  returnCredential: boolean;
  returnPresentation: boolean;
}

export interface VcalmView {
  kind: 'credential' | 'presentation';
  document?: unknown;
  options?: VcalmCallOptions;
}

export interface VcalmVerificationBody {
  verified: boolean;
  problemDetails: VcalmProblemDetail[];
  results: Record<string, unknown>;
  credential?: unknown;
  verifiablePresentation?: unknown;
}

export interface VcalmHttpResponse {
  status: 200 | 400;
  body: VcalmVerificationBody;
}

export function toVcalmResponse(result: any, view: VcalmView): VcalmHttpResponse {
  const verified = result?.verified === true;
  const body: VcalmVerificationBody = {
    verified,
    problemDetails: verified ? [] : problemsFromResult(result),
    results: view.options?.returnResults ? buildResults(result, view) : {},
  };
  attachDocument(body, view);
  return { status: verified ? 200 : 400, body };
}

export function failureToVcalmResponse(
  error: unknown,
  view: VcalmView
): VcalmHttpResponse {
  const message = messageOf(error) ?? 'The request could not be verified';
  const body: VcalmVerificationBody = {
    verified: false,
    problemDetails: [problem(problemType(error, message), message)],
    results: {},
  };
  attachDocument(body, view);
  return { status: 400, body };
}

function attachDocument(body: VcalmVerificationBody, view: VcalmView): void {
  if (view.document === undefined || !view.options) return;
  if (view.kind === 'credential' && view.options.returnCredential) {
    body.credential = view.document;
  }
  if (view.kind === 'presentation' && view.options.returnPresentation) {
    body.verifiablePresentation = view.document;
  }
}

function buildResults(result: any, view: VcalmView): Record<string, unknown> {
  if (view.kind === 'presentation') {
    return presentationResults(result, view.document, view.options);
  }
  return credentialResults(result, view.document);
}

function credentialResults(result: any, credential: any): Record<string, unknown> {
  const view: Record<string, unknown> = {};
  const proofs = proofResults(result?.results);
  if (proofs.length > 0) view.proof = proofs;

  if (result?.statusResult && credential?.credentialStatus) {
    const statuses = Array.isArray(credential.credentialStatus)
      ? credential.credentialStatus
      : [credential.credentialStatus];
    const perStatus = Array.isArray(result.statusResult.results)
      ? result.statusResult.results
      : statuses.map(() => result.statusResult);
    view.credentialStatus = statuses.map((input: unknown, index: number) => {
      const entry = perStatus[index] ?? result.statusResult;
      const item: Record<string, unknown> = {
        verified: entry?.verified === true,
        input,
      };
      if (typeof entry?.status === 'number') item.value = entry.status;
      return item;
    });
  }

  return view;
}

function presentationResults(
  result: any,
  presentation: any,
  options?: VcalmCallOptions
): Record<string, unknown> {
  const presentationResult = result?.presentationResult;
  const purposeValid = presentationPurposeValid(presentationResult);
  const presentationView: Record<string, unknown> = {};

  if (options?.challenge !== undefined) {
    presentationView.challenge = { verified: purposeValid, input: options.challenge };
  }
  if (options?.domain !== undefined) {
    presentationView.domain = { verified: purposeValid, input: options.domain };
  }

  const proofs = proofResults(presentationResult?.results);
  if (proofs.length > 0) presentationView.proof = proofs;

  const credentials = asList(presentation?.verifiableCredential);
  const credentialResultsList = Array.isArray(result?.credentialResults)
    ? result.credentialResults
    : [];

  return {
    presentation: presentationView,
    credentials: credentialResultsList.map((credentialResult: any, index: number) => ({
      verified: credentialResult?.verified === true,
      problemDetails: credentialResult?.verified === true
        ? []
        : problemsFromResult(credentialResult),
      results: credentialResults(credentialResult, credentials[index]),
    })),
  };
}

function presentationPurposeValid(presentationResult: any): boolean {
  if (!presentationResult || presentationResult.verified === false) return false;
  const results = presentationResult.results;
  if (!Array.isArray(results) || results.length === 0) {
    return presentationResult.verified === true;
  }
  return results.every((entry: any) => entry?.purposeResult?.valid !== false);
}

function proofResults(results: unknown): Array<{ verified: boolean; input: unknown }> {
  if (!Array.isArray(results)) return [];
  return results.map((entry: any) => ({
    verified: entry?.verified === true,
    input: entry?.proof ?? entry,
  }));
}

function problemsFromResult(result: any): VcalmProblemDetail[] {
  if (!result || result.verified === true) return [];

  const problems: VcalmProblemDetail[] = [];
  const statusFailed = result.statusResult?.verified === false;
  if (statusFailed) {
    problems.push(problem(
      STATUS_VERIFICATION_ERROR,
      messageOf(result.statusResult.error) ?? 'Credential status verification failed'
    ));
  }

  for (const entry of errorEntries(result)) {
    const message = messageOf(entry);
    if (!message) continue;
    const explicitType = httpsProblemType(entry);
    if (statusFailed && !explicitType && /status/i.test(message)) continue;
    problems.push(problem(explicitType ?? CRYPTOGRAPHIC_SECURITY_ERROR, message));
  }

  if (Array.isArray(result.credentialResults)) {
    for (const credentialResult of result.credentialResults) {
      problems.push(...problemsFromResult(credentialResult));
    }
  }

  if (result.presentationResult) {
    problems.push(...problemsFromResult({
      ...result.presentationResult,
      credentialResults: undefined,
    }));
  }

  if (problems.length === 0) {
    problems.push(problem(CRYPTOGRAPHIC_SECURITY_ERROR, 'Verification failed'));
  }

  return dedupe(problems);
}

function problemType(error: unknown, message: string): string {
  if (error instanceof VcalmInputError) return INVALID_INPUT;
  if (/status/i.test(message)) return STATUS_VERIFICATION_ERROR;
  if (/invalid verifiable|unknown type|jwt format|must be|missing /i.test(message)) {
    return INVALID_INPUT;
  }
  return CRYPTOGRAPHIC_SECURITY_ERROR;
}

function problem(type: string, detail: string): VcalmProblemDetail {
  const marker = type.includes('#') ? '#' : '/';
  const title = type.slice(type.lastIndexOf(marker) + 1);
  return { type, title, detail };
}

function errorEntries(result: any): unknown[] {
  if (Array.isArray(result.errors) && result.errors.length > 0) return result.errors;
  return result.error ? [result.error] : [];
}

function httpsProblemType(entry: unknown): string | undefined {
  if (!entry || typeof entry !== 'object' || !('type' in entry)) return undefined;
  const type = (entry as { type?: unknown }).type;
  return typeof type === 'string' && type.startsWith('https://') ? type : undefined;
}

function messageOf(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value instanceof Error && value.message.trim()) return value.message.trim();
  if (value && typeof value === 'object' && 'message' in value) {
    const message = (value as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message.trim();
  }
  return undefined;
}

function dedupe(problems: VcalmProblemDetail[]): VcalmProblemDetail[] {
  const seen = new Set<string>();
  return problems.filter((item) => {
    const key = `${item.type}\n${item.detail}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function asList(value: unknown): unknown[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}
