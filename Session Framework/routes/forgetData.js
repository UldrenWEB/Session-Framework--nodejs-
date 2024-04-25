'use strict'

import Adapter from "../adapter/adapterExpress.js"
import { ForgetDataController } from '../controllers/forgetDataController.js'
//* Ruta para el manejo de olvido datos
const adapter = new Adapter()


export const createForgetDataRouter = () => {
    const forgetDataController = new ForgetDataController();

    const forgetDataRouter = adapter.createRouter()


    forgetDataRouter.post('/', forgetDataController.test, forgetDataController.createSession, forgetDataController.correctSession)

    return forgetDataRouter;
}





