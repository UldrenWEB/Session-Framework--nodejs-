import Adapter from "../adapter/adapterExpress.js";

import { ExecuteController } from "../controllers/toProcess.js"

const adapter = new Adapter()


export const createExecuteRouter = () => {
    const executeController = new ExecuteController()
    const executeRouter = adapter.createRouter();

    executeRouter.use(executeController.middleWare)
    executeRouter.post('/', executeController.validatePermission, executeController.executeMethod)

    return executeRouter;
}