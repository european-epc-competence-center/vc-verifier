import { NextFunction, Request, response, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { Verifier, fetch_json } from '../../services/index.js';

const VC_REGISTRY = process.env.VC_REGISTRY ? process.env.VC_REGISTRY : 'https://ssi.eecc.de/api/registry/vcs/';


export class VerifyRoutes {

    fetchAndVerify = async (req: Request, res: Response, next: NextFunction): Promise<any> => {

        try {

            // fetch credential
            let credential;

            try {

                credential = await fetch_json(decodeURIComponent(req.params.vcid)) as Verifiable;

            } catch (error) {
                console.log(error)
                return res.status(StatusCodes.NOT_FOUND).send('Credential not found!\n' + error);
            }

            const result = await Verifier.verify(credential);

            return res.status(StatusCodes.OK).json(result);

        } catch (error) {
            return res.status(StatusCodes.BAD_REQUEST).send('Something went wrong!\n' + error);
        }

    }

    verify = async (req: Request, res: Response, next: NextFunction): Promise<any> => {

        try {

            const challenge = req.query.challenge || req.query.nonce

            if (challenge && typeof challenge != 'string') throw new Error('The challenge/nonce must be provided as a string!');

            let tasks = Promise.all(req.body.map(function (verifialbe: Verifiable) {

                return Verifier.verify(verifialbe, challenge);

            }));

            // wait for all verifiables to be verified
            const results = await tasks;

            return res.status(StatusCodes.OK).json(results);

        } catch (error) {
            return res.status(StatusCodes.BAD_REQUEST).send('Something went wrong!\n' + error);
        }

    }

    verifySubjectsVCs = async (req: Request, res: Response, next: NextFunction): Promise<any> => {

        try {

            // fetch credentials
            let credentials: Verifiable[];

            try {

                credentials = await fetch_json(VC_REGISTRY + encodeURIComponent(req.params.subjectId)) as [Verifiable];

            } catch (error) {
                return res.status(StatusCodes.NOT_FOUND);
            }

            let tasks = Promise.all(credentials.map(function (vc) {

                return Verifier.verify(vc);

            }));

            // wait for all vcs to be verified
            const results = await tasks;

            return res.status(StatusCodes.OK).json(results);

        } catch (error) {
            return res.status(StatusCodes.BAD_REQUEST).send('Something went wrong!\n' + error);
        }

    }

}