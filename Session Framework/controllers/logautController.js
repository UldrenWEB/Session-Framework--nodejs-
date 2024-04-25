'use strict'
import { Session } from "../imports.js"

export class LogautController {
    constructor() {
        this.session = new Session()
    }

    validateSessionMiddleware = (req, res, next) => {
        const bool = this.session.hasSession(req)
        if (!bool) {
            // console.log('No tiene session por lo que no existe y no se puede destruir');
            return res.status(404).json({ message: 'No tiene session inicie session en: http://localhost:1234/login' })
        }

        // console.log('Si tiene session');
        return next()
    }

    destroySession = (req, res) => {
        try {
            req.session.destroy();
            return res.status(200).json({ message: 'La session se destruyo correctamente' })
        } catch (error) {
            return res.status(200).json({ message: 'Hubo un error al destruir la session' })
        }
        // console.log(req.session, req.sessionID);
    }




}


