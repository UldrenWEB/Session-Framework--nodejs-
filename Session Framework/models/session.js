'use strict'

import path from 'node:path'
import session from "express-session"
import { readJSON } from "../utils/util.js"

//Componente Session

export class Session {
    constructor() {
        // this.config = config

        let config = 'configSession.json'
        let pathConfig = path.join(process.cwd(), 'configs', 'data', config);

        this.configSession = readJSON(pathConfig);
    }

    //MiddleWare para inicializar la sesion en la solicitud en especifico
    middlewareSession = (req, res, next) => {
        return session(this.configSession)(req, res, next)
    }

    //*Esto se va a colocar como MiddleWare despues de que se cumpla una funcion en especifico y si es asi se hara un next a este middleware
    initializeSession = () => {

        return session(this.configSession)
    }

    createSession = (req, obj) => {
        for (let prop in obj) {
            req.session[prop] = obj[prop]
        }
        return this;
    }

    loggedIn = (req) => {
        if (req.session && req.session.user && req.session.pass && req.session.profile) return true

        return false;
    }

    hasSession = (req) => {
        if (req.session && req.session.user) return true

        return false;
    }

    destroySession = (req) => {

        try {
            req.session.destroy();
            console.log('La session se destruyo correctamente');
            return true
        } catch (error) {
            console.log('Hubo un error al destruir la session', error);
            return false
        }


    }
}