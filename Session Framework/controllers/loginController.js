'use strict'


import { validateObjUser } from '../schemas/schemaUser.js'
import {
    Session,
    UserModel,
    nameQuerys,
    objProp
} from '../imports.js'



//*Se instancia indicando el nombre del directorio donde se encuentran todos los archivos de configuraciones y asi mismo el nombre del archivo de configPool y el de querys para que pueda funcionar este componente

export class LoginController {
    constructor() {
        this.session = new Session();
        this.model = new UserModel();
    }

    #validateObj = (req) => {

        const result = validateObjUser(req.body)
        if (result.error) {
            return false
        }

        return true;
    }


    testUser = async (req, res, next) => {
        // console.log('Paso por el controlador');
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
                return res.status(404).json({ message: 'El usuario no existe no puede hacer login' })
            }


            //*Aqui verifica y se bloquea al usuario si no tiene los intentos
            let attemps = await this.model.validateAttemps({
                keyQuery: nameQuerys.selectOneUser,
                objComp: req.body,
                objProp: objProp
            })

            // console.log('Intentos', attemps);
            if (attemps <= 0) {
                await this.model.blockUserOrDisblockUser({
                    keyQuery: nameQuerys.blockUser,
                    objComp: req.body,
                    bool: true
                })
            }

            //*Aqui valido si el usuario se encuentra bloqueado
            let isBlocked = await this.model.validateIsBlockedByUser({
                keyQuery: nameQuerys.selectOneUser,
                objComp: req.body,
                objProp: objProp
            })

            if (isBlocked) {
                return res.status(400).json({ message: 'Este usuario se encuentra bloqueado' })
            }

            let validatePass = await this.model.correctPass({
                keyQuery: nameQuerys.selectAllUser,
                objComp: req.body,
                objProp: objProp
            })

            if (!validatePass) {

                await this.model.reduceCounter({
                    keyQuery: nameQuerys.reduceCont,
                    objComp: req.body
                })
                return res.status(400).json({ message: 'El password es incorrecto' })
            }

            let asignEmail = await this.#asignEmailUser(req)

            if (!asignEmail) {
                return res.status(400).json({ message: 'Hubo un error al encontrar el email del user' })
            }

            //*Si llega hasta aqui se reinician sus intentos
            await this.model.resetCounter({
                keyQuery: nameQuerys.resetCont,
                attemps: 4,
                objComp: req.body
            })

            // console.log('El usuario y el password son correctos');
            return next()


        } catch (error) {
            console.log('Hubo un error al hacer un test al Usuario: ', error);
            return res.status(400).json({ message: 'No se pudo iniciar session' })
        }

    }

    #asignEmailUser = async (req) => {
        try {
            let email = await this.model.extractEmailUser({
                keyQuery: nameQuerys.selectEmailUser,
                objComp: req.body,
                objProp: objProp
            })

            // console.log('Este es el email', email);
            req.session.email = email;
            return true;
        } catch (error) {
            console.log('Hubo un error al asignar el email', error);
            return false;
        }
    }

    //*Metodo el cual interpreta los perfiles del usuario
    searchProfile = async (req) => {

        try {

            let result = await this.model.searchProfile({ keyQuery: nameQuerys.selectProfileByUser, user: req.body.user })

            //*Asigno a la session una serie de perfiles
            if (result.length > 1) {
                //Significa que tiene mas de un perfil
                // console.log('Tiene mas de un perfil');
                const array = result.map(obj => obj.id_profile)
                console.log(array);

                req.session.profile = array;
                return false;

            } else {
                // console.log('Solo tiene un perfil el cual se le asigno');
                req.session.profile = result[0]['id_profile']
                return true;
            }


        } catch (error) {
            console.log('Hubo un error al buscar el perfil del usuario: ', error);
        }

    }


    createSession = (req, res, next) => {
        // console.log(req.body);
        this.session.createSession(req, req.body)

        return next()
    }

    validarSession = (req, res) => {
        let bool = this.session.hasSession(req);

        if (!bool) return res.status(400).json({ message: 'La session no existe' })

        return res.status(200).json({ message: 'La session existe y eres: ' + req.session.user })
    }

    correctSession = async (req, res) => {
        try {
            let bool = await this.searchProfile(req);

            if (bool) {
                // console.log('El usuario solo cuenta con un solo perfil');
                return res.status(201).json({ message: 'La session fue creada exitosamente, usuario con un perfil' })
            } else {
                // console.log('El usuario cuenta con mas de un perfil');
                return res.redirect('/selectProfile')
            }

        } catch (error) {
            console.log('Hubo un error al verificar el perfil del usuario si cuenta con mas de uno: ', error);
        }
    }
}