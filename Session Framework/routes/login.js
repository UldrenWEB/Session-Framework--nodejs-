'use strict'

import Adapter from "../adapter/adapterExpress.js"

import { LoginController } from '../controllers/loginController.js'

const adapter = new Adapter()

export const createLoginRouter = () => {
    const loginController = new LoginController()

    const loginRouter = adapter.createRouter()

    // loginRouter.use(loginController.attempsMiddleware)

    loginRouter.post('/', loginController.testUser, loginController.createSession, loginController.correctSession)

    loginRouter.get('/prueba', loginController.validarSession)

    return loginRouter;
}



