'use strict'


import { validateObjRegister } from '../../../schemas/schemaRegisterUser.js'
import {
    ManagerDB,
    UserModel,
    nameQuerys,
    objProp,
    Encrypt
} from '../../../imports.js'


export default class Register {
    constructor() {
        this.model = new UserModel()
        this.encrypt = new Encrypt()
        this.manager = new ManagerDB({
            directory: 'configs',
            apart: 'data',
            configPool: 'configPool.json',
            objQuerys: 'querys.json'
        })

    }

    #validateObj = (obj) => {
        let result = validateObjRegister(obj);
        if (result.error) {
            // console.log('Los parametros enviados son invalidos');
            return false;
        }

        return result.data
    }

    #validateUser = async (user) => {

        if (!typeof user === 'string') {
            console.log('El nombre de usuario debe ser un string');
            return false
        }

        let obj = { user: user }
        let result = await this.model.existUser({
            keyQuery: nameQuerys.selectAllUser,
            objComp: obj,
            objProp: objProp
        })

        return result;
    }

    registeruser = async (nameUser, password, email) => {

        let object = this.#validateObj({
            user: nameUser,
            pass: password,
            email: email
        })

        if (!object) {
            console.log('Los parametros enviados son invalidos, por favor verifique los datos');
            return false;
        }
        try {

            let encryptPass = await this.encrypt.encryptText({
                salt: 10,
                text: password
            })

            if (!encryptPass) {
                console.log('Hubo un error al encriptar password');
                return false;
            }

            let rows = await this.manager.modifiedDB({
                key: nameQuerys.insertUser,
                params: [nameUser, encryptPass, email]
            })

            if (rows <= 0) {
                console.log('Hubo un error al insertar el usuario');
                return false
            }

            console.log('Se inserto el usuario correctamente');
            return true;

        } catch (error) {
            console.log('Hubo un error al insertar un usuario: ', error);
        }

    }

    asignquestionuser = async (question, response, user) => {

        let result = await this.#validateUser(user)

        if (!result) {
            console.log('Este usuario es invalido, por favor verifique los datos ingresados');
            return false;
        }


        let encryptResp = await this.encrypt.encryptText({
            salt: 10,
            text: response,
            isPass: false
        })
        let rows = await this.manager.modifiedDB({
            key: nameQuerys.insertQuestion,
            params: [question, encryptResp, user]
        })

        if (rows > 0) {
            console.log('Se asigno correctamente la pregunta con el usuario');
            return true
        }

        console.log('Hubo un error al asignar la pregunta con el usuario');
        return false;
    }

    deleteuser = async (user) => {
        let result = await this.#validateUser(user)

        if (!result) {
            console.log('El usuario ingresado es invalido, por favor verifique los datos ingresados');
            return false;
        }

        let rows = await this.manager.modifiedDB({
            key: nameQuerys.deleteUser,
            params: [user]
        })

        if (rows <= 0) {
            console.log('Hubo un error al borrar un usuario');
            return false;
        }

        console.log('Se borro correctamente el usuario de la base de datos');
        return true;
    }

}