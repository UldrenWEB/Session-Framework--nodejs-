'use strict'

import { UserModel, Session, nameQuerys, objProp } from '../imports.js'
import { validateObjUser } from "../schemas/schemaForgetData.js"



export class ForgetDataController {
    constructor() {
        this.session = new Session()
        this.model = new UserModel({
            directory: 'configs',
            configPool: 'configPool.json',
            objQuerys: 'querys.json'
        })
    }
    #validateObj = (req) => {

        const result = validateObjUser(req.body)
        if (result.error) {
            return false
        }

        return true;
    }

    #IsBlocked = async (req, res) => {
        try {

            let bool = await this.model.validateIsBlockedByUser({
                keyQuery: nameQuerys.selectOneUser,
                objComp: req.body,
                objProp: objProp
            })

            if (bool) {
                return true;
            }

            return false
        } catch (error) {
            console.log('Hubo un error al validar si esta bloqueado, verifique los datos', error);
        }
    }

    test = async (req, res, next) => {

        if (!this.#validateObj(req)) {
            return res.status(400).json({ message: 'Los datos ingresados no son validos' })
        }

        try {

            let validateUser = await this.model.existUser({
                keyQuery: nameQuerys.selectAllUser,
                objComp: req.body,
                objProp: objProp
            })

            if (!validateUser) {
                return res.status(404).json({ message: 'El usuario es incorrecto' })
            }

        } catch (error) {
            console.log('Hubo un error al validar si existe el usuario, verifique los datos', error);
        }


        let isBlocked = await this.#IsBlocked(req, res)
        if (isBlocked) {
            return res.status(400).json({ message: 'El usuario se encuentra bloqueado no puede usar esta funcion' })
        }

        return next()
    }

    #asignEmailUser = async (req) => {
        try {
            let email = await this.model.extractEmailUser({
                keyQuery: nameQuerys.selectEmailUser,
                objComp: req.body,
                objProp: objProp
            })

            console.log('Este es el email', email);
            req.session.email = email;
            return true;
        } catch (error) {
            console.log('Hubo un error al asignar el email', error);
            return false;
        }
    }

    createSession = (req, res, next) => {
        this.session.createSession(req, req.body)

        return next()
    }

    correctSession = async (req, res) => {
        try {
            await this.#asignEmailUser(req)
            res.redirect('/secretAnswer')

        } catch (error) {
            console.log('Hubo un error al asginar el email', error.message);
        }
    }



}