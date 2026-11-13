import { Request, Response } from 'express';
import { VcalmService } from '../../services/vcalm/index.js';

/** HTTP adapter for the VCALM verify service. Status and body come from the service. */
export class VcalmRoutes {
  verifyCredential = async (req: Request, res: Response): Promise<void> => {
    const outcome = await VcalmService.verifyCredential(req.body);
    res.status(outcome.status).json(outcome.body);
  };

  verifyPresentation = async (req: Request, res: Response): Promise<void> => {
    const outcome = await VcalmService.verifyPresentation(req.body);
    res.status(outcome.status).json(outcome.body);
  };
}
