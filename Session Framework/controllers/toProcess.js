'use strict'


import { Session, Security } from '../imports.js'

//*Controlador para ejecutar un metodo 

export class ExecuteController {
    constructor() {
        this.session = new Session();
        this.security = new Security();
    }

    middleWare = (req, res, next) => {
        let bool = this.session.loggedIn(req);

        if (!bool) {
            return res.status(400).json({ message: 'No ha hecho login antes, por favor hago login' })
        }

        if (isNaN(req.session.profile) || !req.session.profile) {
            return res.status(400).json({ message: 'No cuenta con un perfil' })
        }

        // console.log('La session existe y eres: ', req.session.user);
        return next()
    }

    #getKey = (req) => {

        let receivedProfile = req.session.profile
        let key = parseInt(receivedProfile)
        return key;
    }

    validatePermission = (req, res, next) => {
        // console.log('Entro a validar');
        let key = this.#getKey(req);
        // console.log(key);

        let bool = this.security.validatePermission(req.body, key)

        if (!bool) {
            return res.status(400).json({ message: 'No cuenta con los permisos' })
        }

        return next();
    }

    executeMethod = async (req, res) => {
        try {
            let result = await this.security.executeMethod(req.body)

            // console.log(result);

            if (!result) {
                return res.status(400).json({ message: 'Hubo un error al ejecutar el metodo verifique los valores' })
            }

            return res.status(200).json({ message: `Todo fue correcto el resultado de la operacion es: ${result}` })

        } catch (error) {
            console.log('Hubo un error al intentar ejecutar el metodo seleccionado');

        }
    }







}