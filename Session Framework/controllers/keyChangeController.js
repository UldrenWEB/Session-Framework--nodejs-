'use strict'

import { validateObjPass } from '../schemas/schemaChangePass.js'
import {
    UserModel,
    Session,
    ManagerDB,
    Encrypt,
    nameQuerys,
    objProp
} from "../imports.js"



export class KeyChangeController {
    constructor() {
        this.model = new UserModel();
        this.session = new Session();
        this.encrypt = new Encrypt();
        this.manager = new ManagerDB({
            directory: 'configs',
            apart: 'data',
            configPool: 'configPool.json',
            objQuerys: 'querys.json'
        })
    }

    middleware = (req, res, next) => {
        let bool = this.session.loggedIn(req)

        if (!bool) {
            console.log('No tiene una session valida');
            return res.status(400).json({ message: 'No hizo login, si quiere cambiar su contraseña debe hacer login antes' })
        }

        return next()
    }

    #validateObjChange = (obj) => {

        let result = validateObjPass(obj);

        if (result.error) {
            return false;
        }

        return result.data
    }

    correctoLogin = (req, res) => {
        console.log('Si tiene login por lo que puede cambiar su contraseña');
        return res.status(200).json({ message: 'Hizo login correctamente por lo que puede modificar su contraseña' })
    }

    #validateOldPass = async (req) => {

        //Extraigo la oldPass de la base de datos la cual esta encriptada
        const oldPass = await this.manager.returnByProp({
            keyQuery: nameQuerys.selectOneUser,
            user: req.session.user,
            viewProp: objProp.pass
        })

        let bool = await this.encrypt.compareEncrypt({
            hashedText: oldPass,
            textPlain: req.body.pass,
        })

        if (!bool) {
            return false;
        }

        return oldPass;
    }

    changeTest = async (req, res) => {

        const object = this.#validateObjChange(req.body)

        if (!object) {
            return res.status(400).json({ message: 'Los datos ingresados son incorrectos por verifique la pass y newPass que ha enviado' })
        }

        try {
            //Encripto la password que ingreso en la base de datos
            const passEncrypt = await this.encrypt.encryptText({ text: object.newPass, salt: 10 })

            const oldPass = await this.#validateOldPass(req)

            if (!oldPass) {
                return res.status(400).json({ message: 'La contraseña actual ingresada es invalida ya que no coincide' })
            }

            //Ejecuto y compruebo la modificacion de la pass, primero viendo si la oldPass coindico
            const result = await this.model.modifiedPass({
                keyQuery: nameQuerys.selectOneUser,
                keyModifiedQuery: nameQuerys.modifiedPass,
                user: req.session.user,
                objProp: objProp,
                oldPass: oldPass,
                newPass: passEncrypt,
            })
            // console.log('Hola bebe', result);

            if (!result) {
                return res.status(400).json({ message: 'Error al modificar password, verifique datos' })
            }


            let destroySession = this.session.destroySession(req)
            if (!destroySession) {
                // console.log('Hubo un error al destruir la session');
                return res.status(400).json({ message: 'El sistema tuvo un error al cerrar su session' })
            }


            return res.status(200).json({ message: 'Se ha modificado coorectamente las password' })

        } catch (error) {
            console.log('Hubo un error inesperado', error);
        }


    }

}   