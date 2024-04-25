import Adapter from '../adapter/adapterExpress.js'
import { KeyChangeController } from '../controllers/keyChangeController.js'

const adapter = new Adapter()

export const createKeyChangeRouter = () => {
    let keyChangeController = new KeyChangeController()

    const keyChangeRouter = adapter.createRouter()

    keyChangeRouter.use('/', keyChangeController.middleware)

    keyChangeRouter.get('/', keyChangeController.correctoLogin)
    keyChangeRouter.post('/', keyChangeController.changeTest)

    return keyChangeRouter;

}