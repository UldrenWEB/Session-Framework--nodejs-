'use strict'

import Adapter from '../adapter/adapterExpress.js'
import { LogautController } from '../controllers/logautController.js'

const adapter = new Adapter()

export const createLogautRouter = () => {
    let logautController = new LogautController()

    const logautRouter = adapter.createRouter()

    logautRouter.get('/', logautController.validateSessionMiddleware, logautController.destroySession)

    return logautRouter;

}






