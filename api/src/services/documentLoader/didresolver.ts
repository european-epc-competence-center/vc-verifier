import { Resolver } from 'did-resolver'
import * as web from 'web-did-resolver'

export default new Resolver({
    ...web.getResolver()
    //...you can flatten multiple resolver methods into the Resolver
})