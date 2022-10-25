import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { VCVerifier } from '../../services/index.js';


export class VerifyRoutes {

    verifyCredential = async (req: Request, res: Response, next: NextFunction): Promise<any> => {

    }

    verifyCredentials = async (req: Request, res: Response, next: NextFunction): Promise<any> => {

        try {

            let tasks = Promise.all(req.body.map(function(vc: any){

                return VCVerifier.verifyCredential(vc);

            }));

            // wait for all vcs to be verified
            const results = await tasks;

            return res.status(StatusCodes.OK).json(results);

        } catch (error) {
            return res.status(StatusCodes.BAD_REQUEST).send(error);
        }

    }

    verifySubjectsVCs = async (req: Request, res: Response, next: NextFunction): Promise<any> => {

        return []

    }

}