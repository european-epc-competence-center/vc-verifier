import { NextFunction, Request, response, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { VCVerifier } from '../../services/index.js';

const VC_REGISTRY = 'https://ssi.eecc.de/api/registry/vcs/';


export class VerifyRoutes {

    verifyCredential = async (req: Request, res: Response, next: NextFunction): Promise<any> => {

        try {

            // fetch credential
            let credential;

            try {

                credential = await fetch(req.params.vcid);

            } catch(error) {
                return res.status(StatusCodes.NOT_FOUND);
            }

            credential = await credential.json();

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
            let credentials;

            try {

                credentials = await fetch(VC_REGISTRY + encodeURIComponent(req.params.subjectId));

            } catch(error) {
                return res.status(StatusCodes.NOT_FOUND);
            }

            const credentials_array: [any] = await credentials.json();

            let tasks = Promise.all(credentials_array.map(function(vc: any){

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