'use strict'

import { ManagerDB } from './managerDB.js'
import { Encrypt } from '../adapter/encryptByBecrypt.js'


//Modelo el cual se encarga de hacer los accesos necesarios

const encrypt = new Encrypt()

export class UserModel {
    constructor() {

        //?Aqui se le puede pasar la carpeta como parametro para saber donde se encuetran todos los archivos de configuraciones
        this.manager = new ManagerDB({
            directory: 'configs',
            apart: 'data',
            configPool: 'configPool.json',
            objQuerys: 'querys.json'
        })
    }

    //?Aqui se modifico el parametro que pasa y asi poder pasarle el query que vamos a ejecutar y y el objeto con el cual lo vamos a comparar
    existUser = async ({ keyQuery, objComp, objProp }) => {

        try {

            let result = await this.manager.searchDB({ key: keyQuery })

            let bool = result.find(obj => obj[objProp.user] === objComp.user)

            if (!bool) {
                return false;
            }
            // console.log('Existe en la base de datos');
            return true;


        } catch (error) {
            console.log('Hubo un error al buscar el usuario y asi verificar si existe en la base de datos: ', error);
        }

    }

    searchProfile = async ({ keyQuery, user }) => {
        try {
            let result = await this.manager.searchDB({ key: keyQuery, params: [user] })

            return result;
        } catch (error) {
            console.log('Hubo un error al buscar los perfiles del usuario', error);
            return false
        }
    }



    correctPass = async ({ keyQuery, objComp, objProp }) => {

        try {


            let result = await this.manager.searchDB({ key: keyQuery })

            //Extraigo el objeto que tiene ese usuario y de ahi extraigo su password encriptada
            let obj = result.find(obj => obj[objProp.user] === objComp.user)


            let pass = obj[objProp.pass];
            // console.log('Esta es la pass', pass, objComp.pass);

            let bool = await encrypt.compareEncrypt({ textPlain: objComp.pass, hashedText: pass });

            if (!bool) {
                return false
            }

            return true;



        } catch (error) {
            console.log('Hubo un error al verificar si la password es correcta: ', error);
        }

    }


    validateUser = async ({ keyQuery, keyReturnId, objComp, objProp }) => {

        try {

            let result = await this.manager.searchDB({ key: keyQuery })

            for (let user of result) {
                if (user[objProp.user] === objComp.user && user[objProp.pass] === objComp.pass) {
                    //Significa que los dos campos coinciden por lo que esta correcto
                    let id = await this.manager.searchDB({ key: keyReturnId, params: [user[objProp.user], user[objProp.pass]] })


                    return id[0][objProp.id];
                }
            }


            return false;

        } catch (error) {
            console.log('Hubo un error al extraer el id del usuario apartir de su user y password', error);
        }

    }

    reduceCounter = async ({ keyQuery, objComp }) => {

        let result = await this.manager.modifiedDB({ key: keyQuery, params: [objComp.user] })
        // console.log(result);
        if (result > 0) {
            //Significa que hubieron filas que se modificaron
            // console.log('Se redujo correctamente los intentos del usuario');
            return true;
        } else {
            console.log('Hubo un error al reducir los intentos');
            return false;
        }


    }

    resetCounter = async ({ keyQuery, attemps, objComp }) => {
        let result = await this.manager.modifiedDB({ key: keyQuery, params: [attemps, objComp.user] })

        if (result > 0) {
            // console.log('Se reinicio correctamente el contador');
            return true;
        } else {
            console.log('Hubo un error al reiniciar el contador');
            return false;
        }

    }

    validateProfile = async ({ keyQuery, objComp, objProp }) => {

        try {


            let result = await this.manager.searchDB({
                key: keyQuery,
                params: [objComp.profile]
            })

            // console.log(result);

            let obj = result.find(obj => obj[objProp.user] === objComp.user)

            if (!obj) {
                console.log('El usuario no coincide con el perfil');
                return false;
            }

            // console.log('El usuario coincide con el perfil');
            return true;


        } catch (error) {
            console.log('Hubo un error al validar el perfil con el usuario', error);
        }

    }

    validateAttemps = async ({ keyQuery, objComp, objProp }) => {

        try {

            let result = await this.manager.returnByProp({
                keyQuery: keyQuery,
                user: objComp.user,
                viewProp: objProp.attemps
            })


            return result;
        } catch (error) {
            console.log('Hubo un error al extraer los intentos que tiene un usuario, verifique la entrada de parametros', error.message);
        }

    }


    validateIsBlockedByUser = async ({ keyQuery, objComp, objProp }) => {

        try {

            let result = await this.manager.returnByProp({
                keyQuery: keyQuery, user: objComp.user, viewProp: objProp.isBlocked
            })

            return result;
        } catch (error) {
            console.log('Hubo un error al extraer el valor de tipo bool del user para saber si esta bloqueado', error.message);
        }

    }


    validateIsBlockedById = async ({ keyQuery, id, objProp }) => {

        try {
            let result = await this.manager.returnByProp({ keyQuery: keyQuery, user: id, viewProp: objProp.isBlocked })

            return result;
        } catch (error) {
            console.log('Hubo un error al extraer el valor del usuario para saber si el usuario esta bloqueado', error.message);
        }

    }


    blockUserOrDisblockUser = async ({ keyQuery, objComp, bool }) => {
        let result = await this.manager.modifiedDB({ key: keyQuery, params: [bool, objComp.user] })

        if (result > 0) {
            // if (bool) console.log('Se bloqueo correctamente al usuario');

            // if (!bool) console.log('Se desbloqueo correctamente al usuario');
            return true;
        } else {
            console.log('Hubo un error al bloquear o desbloquear el usuario');
            return false;
        }

    }

    extractEmailUser = async ({ keyQuery, objComp, objProp }) => {

        try {
            let result = await this.manager.returnByProp({
                keyQuery: keyQuery,
                user: objComp.user,
                viewProp: objProp.email
            })

            return result;

        } catch (error) {
            console.log('Hubo un error al extraer el email del usuario verifique entrada de parametros', error.message);
        }
    }

    modifiedPass = async ({ keyQuery, keyModifiedQuery, user, oldPass, newPass, objProp }) => {
        if (!user) return false


        try {
            let pass = await this.manager.returnByProp({ keyQuery: keyQuery, user: user, viewProp: objProp.pass })

            if (pass === oldPass) {

                //Significa que si puede modificar su password
                let modifiedPass = await this.manager.modifiedDB({ key: keyModifiedQuery, params: [newPass, user] })

                if (modifiedPass > 0) {
                    // console.log('Se modifico correctamente el password');
                    return true;
                } else {
                    // console.log('Hubo un error al modificar la password');
                    return false;
                }
            } else {
                console.log('La old password ingresada no coincide con la orignal ');
                return false;
            }
        } catch (error) {
            console.log('Hubo un error al intentar modificar las password del usuario', error);
        }


    }


    //Todo: Fin Clase
}