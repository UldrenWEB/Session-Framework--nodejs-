'use strict'

//*Desde aqui se hacen todos los imports

import Adapter from './adapter/adapterExpress.js'

import { createLoginRouter } from './routes/login.js'
import { createLogautRouter } from './routes/logaut.js'
import { createExecuteRouter } from './routes/toProcess.js'
import { createForgetDataRouter } from './routes/forgetData.js'
import { createSecretAnswerRouter } from './routes/secretAnswer.js'
import { createSelectProfileRouter } from './routes/selectProfile.js'
import { createKeyChangeRouter } from './routes/keyChange.js'

import { ManagerDB } from './models/managerDB.js'
import { UserModel } from './models/userModel.js'
import { Session } from './models/session.js'
import { Security } from './models/security.js'
import { readJSON } from './utils/util.js'
import { Encrypt } from './adapter/encryptByBecrypt.js'

const nameQuerys = readJSON('../configs/data/nameQuerys.json');
const objProp = readJSON('../configs/data/objProp.json');


export {
    Adapter,
    Session,
    UserModel,
    ManagerDB,
    Security,
    Encrypt,
    createLoginRouter,
    createLogautRouter,
    readJSON,
    createExecuteRouter,
    createForgetDataRouter,
    createSecretAnswerRouter,
    createSelectProfileRouter,
    createKeyChangeRouter,
    nameQuerys,
    objProp
}