'use strict'

import { Adapter } from "../imports.js"

import { SelectProfileController } from "../controllers/selectProfileController.js"

const adapter = new Adapter()

export const createSelectProfileRouter = () => {
    const selectProfileController = new SelectProfileController()

    const selectProfileRouter = adapter.createRouter()

    selectProfileRouter.use('/', selectProfileController.middleWare)
    selectProfileRouter.get('/', selectProfileController.viewOptions)

    selectProfileRouter.post('/', selectProfileController.selectedProfile)

    return selectProfileRouter;
}



