import { NextFunction, Request, response, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { VCVerifier, fetch_json } from '../../services/index.js';

const VC_REGISTRY = process.env.VC_REGISTRY ? process.env.VC_REGISTRY : 'https://ssi.eecc.de/api/registry/vcs/';


export class VerifyRoutes {

    verifyCredential = async (req: Request, res: Response, next: NextFunction): Promise<any> => {

        try {

            // fetch credential
            let credential;

            try {

                credential = await fetch_json(req.params.vcid);

            } catch(error) {
                return res.status(StatusCodes.NOT_FOUND);
            }

            const result = await VCVerifier.verifyCredential(credential);

            return res.status(StatusCodes.OK).json(result);

        } catch (error) {
            return res.status(StatusCodes.BAD_REQUEST).send(error);
        }

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

        try {

            // fetch credentials
            let credentials: object;

            try {

                credentials = await fetch_json(VC_REGISTRY + encodeURIComponent(req.params.subjectId));

            } catch(error) {
                return res.status(StatusCodes.NOT_FOUND);
            }

            let tasks = Promise.all((credentials as [object]).map(function(vc: any){

                return VCVerifier.verifyCredential(vc);

            }));

            // wait for all vcs to be verified
            const results = await tasks;

            return res.status(StatusCodes.OK).json(results);

        } catch (error) {
            return res.status(StatusCodes.BAD_REQUEST).send(error);
        }

    }

}