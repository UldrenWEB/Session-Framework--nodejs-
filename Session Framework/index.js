'use strict'

import {
    Adapter,
    Session,
    createExecuteRouter,
    createLogautRouter,
    createLoginRouter,
    createForgetDataRouter,
    createSecretAnswerRouter,
    createSelectProfileRouter,
    createKeyChangeRouter
} from './imports.js'

//Instacia del Adaptador
const adapter = new Adapter()

const app = adapter.createApp();
const session = new Session()
const PORT = process.env.PORT ?? 1234;

app.disable('x-powered-by')

//*Middlewares
app.use(adapter.middlewareJSON())
app.use(session.initializeSession())

//*EndPoints
app.use('/login', createLoginRouter())
app.use('/selectProfile', createSelectProfileRouter())
app.use('/logaut', createLogautRouter())
app.use('/toProcess', createExecuteRouter())
app.use('/keyChange', createKeyChangeRouter())
app.use('/forgetData', createForgetDataRouter())
app.use('/secretAnswer', createSecretAnswerRouter())


app.listen(PORT, () => {
    console.log(`Server listening on Port: http://localhost:${PORT}`);
})

