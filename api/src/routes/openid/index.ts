import { NextFunction, Request, response, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuid } from 'uuid';


const presentation_requests = new Map<string, any>()
const presentations = new Map<string, any>()

export class OpenIdRoutes {


    generatePresentationRequest = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const request_id = uuid()
            const presentation_definition_id = uuid()

            const presentation_request = {
                "nonce": uuid(),
                "response_mode": "direct_post",
                "response_type": "vp_token",
                "client_id": "https://ssi.eecc.de/api/verifier/openid/presentation",
                "redirect_uri": "https://ssi.eecc.de/api/verifier/openid/presentation",
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

            presentation_requests.set(request_id, presentation_request)

            var base_path = 'https://ssi.eecc.de/api/verifier/openid'
            var endpoint = base_path + '/presentation'
            var request_uri = base_path + '/presentation-request/' + request_id

            var request_uri = 'openid-presentation-request://?client_id=' +
                encodeURI(endpoint) + '&request_uri=' + encodeURI(request_uri)

            var result = {
                "request_id": request_id,
                "request_uri": request_uri,
                "presentation_definition_id": presentation_definition_id,
                "resource": presentation_requests.get(request_id)
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
                return res.status(StatusCodes.OK).json(presentation_requests.get(req.params.requestId));
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

            presentations.set(verifiable_presentation.presentation_submission.definition_id, verifiable_presentation)

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
                return res.status(StatusCodes.OK).json(presentations.get(req.params.presentationId));
            }

            return res.status(StatusCodes.NOT_FOUND).send("Presentation not found: " + req.params.presentationId);

        } catch (error) {
            console.warn(error)
            return res.status(StatusCodes.BAD_REQUEST).send(error);
        }

    }


}