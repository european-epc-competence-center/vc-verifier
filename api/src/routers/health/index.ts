import { Router } from "express";
import { HealthRoutes } from "../../routes/health/index.js";

const healthRoutes = new HealthRoutes();
const { health, ready } = healthRoutes;

export const healthRouter = Router();

/**
 * @tags Health - Kubernetes liveness and readiness probes (internal operations, not for credential verification)
 */

/**
 * GET /health
 * @summary Liveness probe
 * @description Returns `200 OK` while the Node.js process is running. Used by Kubernetes liveness probes; does not check external dependencies.
 * @tags Health
 * @operationId healthCheck
 * @return {object} 200 - Health status object
 * @return {object} 500 - Internal server error
 * @example response - 200 - Success response
 * {
 *   "status": "UP",
 *   "timestamp": "2023-11-05T10:30:00.000Z",
 *   "uptime": 3600,
 *   "service": "vc-verifier-api",
 *   "version": "3.0.1"
 * }
 */
healthRouter.get('/health', health);

/**
 * GET /ready
 * @summary Readiness probe
 * @description Returns `200 OK` once the service has finished startup initialization (~1 s after boot). Returns `503` while still initializing. Used by Kubernetes readiness probes before routing traffic.
 * @tags Health
 * @operationId readinessCheck
 * @return {object} 200 - Service is ready
 * @return {object} 503 - Service is not ready
 * @example response - 200 - Ready response
 * {
 *   "status": "READY",
 *   "timestamp": "2023-11-05T10:30:00.000Z",
 *   "uptime": 3600,
 *   "service": "vc-verifier-api",
 *   "checks": {
 *     "initialization": "OK"
 *   }
 * }
 * @example response - 503 - Not ready response
 * {
 *   "status": "NOT_READY",
 *   "timestamp": "2023-11-05T10:30:00.000Z",
 *   "message": "Service is still initializing"
 * }
 */
healthRouter.get('/ready', ready);

// Export the health routes instance for external access if needed
export { healthRoutes };
