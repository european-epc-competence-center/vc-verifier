import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';


export class VerifyRoutes {

    verifyCredential = async (req: Request, res: Response, next: NextFunction): Promise<any> => {}

    verifyCredentials = async (req: Request, res: Response, next: NextFunction): Promise<any[]> => {

        return []

    }

    verifySubjectsVCs = async (req: Request, res: Response, next: NextFunction): Promise<any[]> => {

        return []

    }

}