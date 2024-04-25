'use strict'

import express from 'express'
import { Router } from 'express'

export default class Adapter {
    constructor() {
        //* No se definieron las variables aqui para como globales para que asi no sean visibles desde otro punto
    }

    //*Metodo que devuelve lo que es express
    #getModule = () => {
        let module = express
        return module
    }

    //*Metodo para crear la aplicacion de express
    createApp = () => {
        let app = this.#getModule()
        return app()
    }

    //Metodo para crear los Router de express
    createRouter = () => {
        let router = new Router()
        return router
    }

    middlewareJSON = () => {
        let middleware = this.#getModule().json()
        return middleware;
    }


}








