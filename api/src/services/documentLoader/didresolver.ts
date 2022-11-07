import { Resolver } from 'did-resolver'
import * as web from 'web-did-resolver'

export function getResolver() {
    return new Resolver({
        ...web.getResolver()
        //...you can flatten multiple resolver methods into the Resolver
    },
    {
        cache: true
    })
}