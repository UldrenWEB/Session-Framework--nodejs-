'use strict'

import Adapter from "../adapter/adapterExpress.js"
import { SecretAnswerController } from "../controllers/secretAnswerController.js"

const adapter = new Adapter()

export const createSecretAnswerRouter = () => {
    const secretAnswerController = new SecretAnswerController()

    const secretAnswerRouter = adapter.createRouter()

    secretAnswerRouter.use(secretAnswerController.middlewareValidateSession)

    secretAnswerRouter.get('/', secretAnswerController.viewQuestions)

    //Todo: Aqui esto tiene que verifica si y no enviar a pass de una
    secretAnswerRouter.post('/', secretAnswerController.validateResponse, secretAnswerController.modifiedPass, secretAnswerController.sendMessage);

    return secretAnswerRouter;
}

