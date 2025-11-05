import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

/**
 * Health Routes Class
 * Provides health and readiness endpoints for Kubernetes probes
 */
export class HealthRoutes {
    private startTime: Date;
    private isReady: boolean = false;

    constructor() {
        this.startTime = new Date();
        // Set ready state after a brief initialization period
        setTimeout(() => {
            this.isReady = true;
        }, 1000);
    }

    /**
     * Health check endpoint - indicates if the service is alive
     * This should always return 200 OK if the process is running
     * Used by Kubernetes liveness probe
     */
    public health = async (req: Request, res: Response): Promise<void> => {
        try {
            const healthStatus = {
                status: 'UP',
                timestamp: new Date().toISOString(),
                uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
                service: 'vc-verifier-api',
                version: process.env.npm_package_version || '3.0.2'
            };

            res.status(StatusCodes.OK).json(healthStatus);
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                status: 'DOWN',
                timestamp: new Date().toISOString(),
                error: 'Health check failed'
            });
        }
    };

    /**
     * Readiness check endpoint - indicates if the service is ready to accept traffic
     * This should return 200 OK only when the service is fully initialized
     * Used by Kubernetes readiness probe
     */
    public ready = async (req: Request, res: Response): Promise<void> => {
        try {
            if (!this.isReady) {
                res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
                    status: 'NOT_READY',
                    timestamp: new Date().toISOString(),
                    message: 'Service is still initializing'
                });
                return;
            }

            // Perform additional readiness checks here if needed
            // For example: database connectivity, external service availability, etc.
            const readinessStatus = {
                status: 'READY',
                timestamp: new Date().toISOString(),
                uptime: Math.floor((Date.now() - this.startTime.getTime()) / 1000),
                service: 'vc-verifier-api',
                checks: {
                    initialization: 'OK',
                    // Add more checks as needed:
                    // database: await this.checkDatabase(),
                    // externalServices: await this.checkExternalServices()
                }
            };

            res.status(StatusCodes.OK).json(readinessStatus);
        } catch (error) {
            res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
                status: 'NOT_READY',
                timestamp: new Date().toISOString(),
                error: 'Readiness check failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * Set the ready state manually
     * Useful for more complex initialization scenarios
     */
    public setReady(ready: boolean): void {
        this.isReady = ready;
    }

    /**
     * Get current ready state
     */
    public getReadyState(): boolean {
        return this.isReady;
    }

    // Example method for database connectivity check
    // private async checkDatabase(): Promise<string> {
    //     try {
    //         // Add your database connection check here
    //         return 'OK';
    //     } catch (error) {
    //         throw new Error('Database connection failed');
    //     }
    // }

    // Example method for external services check
    // private async checkExternalServices(): Promise<string> {
    //     try {
    //         // Add checks for external dependencies here
    //         return 'OK';
    //     } catch (error) {
    //         throw new Error('External services check failed');
    //     }
    // }
}
