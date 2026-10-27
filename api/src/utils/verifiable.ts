import { JWTService } from "../services/verifier/jwt.js";

/** Credentials carried inside a presentation, in their original form. */
export function enclosedCredentials(verifiable: unknown): unknown[] {
  const payload = payloadOf(verifiable);
  const presentation = isPresentation(payload) ? payload : payload?.vp;
  const credentials = presentation?.verifiableCredential;
  if (Array.isArray(credentials)) {
    return credentials;
  }
  if (credentials === undefined || credentials === null) {
    return [];
  }
  return [credentials];
}

/** Id of a verifiable credential. Presentations have no credential id here. */
export function credentialId(verifiable: unknown): string | undefined {
  const payload = payloadOf(verifiable);
  if (!payload || isPresentation(payload) || isPresentation(payload.vp)) {
    return undefined;
  }
  const body = payload.vc && typeof payload.vc === "object" ? payload.vc : payload;
  if (isPresentation(body)) {
    return undefined;
  }
  const id = typeof body.id === "string" && body.id ? body.id : payload.id;
  return typeof id === "string" && id ? id : undefined;
}

function payloadOf(verifiable: unknown): any {
  if (typeof verifiable === "string") {
    if (!JWTService.isJWT(verifiable)) {
      return undefined;
    }
    const decoded = JWTService.decodeJWT(verifiable);
    return "error" in decoded ? undefined : decoded.payload;
  }
  if (typeof verifiable === "object" && verifiable !== null) {
    return verifiable;
  }
  return undefined;
}

function isPresentation(body: any): boolean {
  const types = Array.isArray(body?.type)
    ? body.type
    : typeof body?.type === "string"
      ? [body.type]
      : [];
  return types.includes("VerifiablePresentation");
}
