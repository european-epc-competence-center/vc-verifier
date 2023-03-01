import { NextFunction, Request, response, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuid } from 'uuid';

import { Verifier, fetch_json } from '../../services/index.js';

const VC_REGISTRY = process.env.VC_REGISTRY ? process.env.VC_REGISTRY : 'https://ssi.eecc.de/api/registry/vcs/';

type MapType = {
    [id: string]: any;
}

var presentation_requests: MapType = {};
var presentations: MapType = {};

export class VerifyRoutes {

    fetchAndVerify = async (req: Request, res: Response, next: NextFunction): Promise<any> => {

        try {

            // fetch credential
            let credential;

            try {

                credential = await fetch_json(req.params.vcid) as Verifiable;

            } catch (error) {
                return res.status(StatusCodes.NOT_FOUND);
            }

            const result = await Verifier.verify(credential);

            return res.status(StatusCodes.OK).json(result);

        } catch (error) {
            return res.status(StatusCodes.BAD_REQUEST).send(error);
        }

    }

    verify = async (req: Request, res: Response, next: NextFunction): Promise<any> => {

        try {

            let tasks = Promise.all(req.body.map(function (verifialbe: Verifiable) {

                return Verifier.verify(verifialbe);

            }));

            // wait for all verifiables to be verified
            const results = await tasks;

            return res.status(StatusCodes.OK).json(results);

        } catch (error) {
            return res.status(StatusCodes.BAD_REQUEST).send(error);
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
            return res.status(StatusCodes.BAD_REQUEST).send(error);
        }

    }

    generatePresentationRequest = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            var request_id = uuid()
            var presentation_definition_id = uuid()

            presentation_requests[request_id] = {
                "nonce": uuid(),
                "response_mode": "direct_post",
                "response_type": "vp_token",
                "client_id": "https://ssi.eecc.de/api/verifier/openid-presentation",
                "redirect_uri": "https://ssi.eecc.de/api/verifier/openid-presentation",
                "presentation_definition":
                {
                    "id": presentation_definition_id,
                    "input_descriptors": [
                        {
                            "id": uuid(),
                            "format": {
                                "ldp_vc": {
                                    "proof_type": [
                                        "Ed25519Signature2020"
                                    ]
                                }
                            },
                            "constraints": {
                                "fields": [
                                    {
                                        "path": [
                                            "$.type"
                                        ],
                                        "filter": {
                                            "type": "array",
                                            "contains": {
                                                "type": "string",
                                                "const": "EMailCredential"
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            }

            var base_path = 'https://ssi.eecc.de/api/verifier'
            var endpoint = base_path + '/openid-presentation'
            var request_uri = base_path + '/openid-presentation-request/' + request_id

            var request_uri = 'openid-presentation-request://?client_id=' +
                encodeURI(endpoint) + '&request_uri=' + encodeURI(request_uri)

            var result = {
                "request_id": request_id,
                "request_uri": request_uri,
                "presentation_definition_id": presentation_definition_id,
                "resource": presentation_requests[request_id]
            }

            console.log("returning new presentation request:", result)

            return res.status(StatusCodes.OK).json(result);
        } catch (error) {
            console.warn("error generating presentation request", error)
            return res.status(StatusCodes.BAD_REQUEST).send(error);
        }

    }

    getPresentationRequest = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            if (!req.params.requestId) {
                return res.status(StatusCodes.BAD_REQUEST).send("No request id given");
            }
            if (req.params.requestId in presentation_requests) {
                return res.status(StatusCodes.OK).json(presentation_requests[req.params.requestId]);
            }

            console.log("No request with id", req.params.requestId)
            console.log("Stored requests", presentation_requests)
            
            return res.status(StatusCodes.NOT_FOUND).send("Not found");

        } catch (error) {
            console.warn(error)
            return res.status(StatusCodes.BAD_REQUEST).send(error);
        }

    }

    verifyPresentation = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            console.log("presentation received:", req.body);
            var verifiable_presentation = req.body.vp_token;

            presentations[verifiable_presentation.presentation_submission.definition_id] = verifiable_presentation

            return res.status(StatusCodes.OK).send("Ok");

        } catch (error) {
            console.warn(error)
            return res.status(StatusCodes.BAD_REQUEST).send(error);
        }

    }

    getPresentation = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            if (!req.params.presentationId) {
                return res.status(StatusCodes.BAD_REQUEST).send("No id given");
            }
            if (req.params.presentationId in presentations) {
                return res.status(StatusCodes.OK).json(presentations[req.params.presentationId]);
            }

            return res.status(StatusCodes.NOT_FOUND).send("Presentation not found: " + req.params.presentationId);

        } catch (error) {
            console.warn(error)
            return res.status(StatusCodes.BAD_REQUEST).send(error);
        }

    }


}