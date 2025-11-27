import { presentationSubmissionContext } from "./presentation-submission.js";
import { statusList2021Context } from "./status-list-2021.js";

export const contexts = new Map([
    ['https://w3id.org/vc/status-list/2021/v1', statusList2021Context],
    ['https://identity.foundation/presentation-exchange/submission/v1/', presentationSubmissionContext]
]);