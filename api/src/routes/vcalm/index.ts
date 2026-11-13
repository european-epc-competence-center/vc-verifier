import { Request, Response } from 'express';
import {
  verifyCredential as verifyVcalmCredential,
  verifyPresentation as verifyVcalmPresentation,
} from '../../services/vcalm/index.js';

/** HTTP adapter for the VCALM verify service. Status and body come from the service. */
export async function verifyCredential(req: Request, res: Response): Promise<void> {
  const outcome = await verifyVcalmCredential(req.body);
  res.status(outcome.status).json(outcome.body);
}

export async function verifyPresentation(req: Request, res: Response): Promise<void> {
  const outcome = await verifyVcalmPresentation(req.body);
  res.status(outcome.status).json(outcome.body);
}
