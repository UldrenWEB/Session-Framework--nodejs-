'use strict'

import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

//*Asi me permite leer un json con su ruta utilizando el Require que cree
export const readJSON = (path) => {
    try {
        return require(path)
    } catch (error) {
        console.log('Hubo un erro al requerir el objeto, verifique la ruta', error);
    }
}