import { Router } from "express";
import { HealthRoutes } from "../../routes/health/index.js";

const healthRoutes = new HealthRoutes();
const { health, ready } = healthRoutes;

export const healthRouter = Router();

/**
 * GET /health
 * @summary Health check endpoint for Kubernetes liveness probe
 * @description Returns the health status of the service. Always returns 200 OK if the process is running.
 * @tags Health
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
 * @summary Readiness check endpoint for Kubernetes readiness probe
 * @description Returns the readiness status of the service. Returns 200 OK only when fully initialized.
 * @tags Health
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
