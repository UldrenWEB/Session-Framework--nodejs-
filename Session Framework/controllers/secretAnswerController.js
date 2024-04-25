'use strict'

import { SendEmail } from "../adapter/sendEmailToMailer.js"
import { validateObjResp } from "../schemas/schemaSecretResponse.js"

import {
    ManagerDB,
    Session,
    UserModel,
    Encrypt,
    nameQuerys,
    objProp
} from '../imports.js'

//*Controlador para la solicitud de preguntas



export class SecretAnswerController {
    constructor() {
        this.managerDB = new ManagerDB({
            directory: 'configs',
            apart: 'data',
            configPool: 'configPool.json',
            objQuerys: 'querys.json'
        })

        this.model = new UserModel();
        this.session = new Session();

        this.sendEmail = new SendEmail({
            configTransporter: 'config.json',
            auth: 'originUser.json'
        })

        this.encrypt = new Encrypt()

        this.newPass;
        this.questions;
    }

    middlewareValidateSession = (req, res, next) => {
        let bool = this.session.hasSession(req);

        if (!bool) return res.status(400).json({ message: 'La session no existe' })

        // console.log('La session existe');
        return next()
    }

    #getIndexRandom = (length, excludedIndex) => {
        let index = Math.floor(Math.random() * length);

        while (index === excludedIndex) {
            index = Math.floor(Math.random() * length);
            // console.log('go');
        }


        // console.log('Indice', index);
        return index;
    }

    #getTwoRandomQuestion = (arrayObject) => {
        const array = [];

        //Seleccion del primer objeto de manera aleatoria
        const indexFirstObject = this.#getIndexRandom(arrayObject.length)
        const firstObject = arrayObject[indexFirstObject];
        array.push(firstObject)

        const indexSecondObject = this.#getIndexRandom(arrayObject.length, indexFirstObject)
        const secondObject = arrayObject[indexSecondObject]
        array.push(secondObject)


        // console.log(array);
        return array;
    }

    #returnQuestion = async (req) => {
        try {
            let questions = await this.managerDB.searchDB({ key: nameQuerys.getQuestionUser, params: [req.session.user] });

            this.questions = this.#getTwoRandomQuestion(questions);
        } catch (error) {
            console.log('Hubo un error al buscar las preguntas secretas del usuario, verifique datos', error);
        }

    }

    viewQuestions = async (req, res) => {

        await this.#returnQuestion(req);

        let objeto = {};
        // console.log('Aqui preguntas', this.questions);
        this.questions.forEach((question, i) => {
            let questionName = `Pregunta ${i + 1}`
            objeto[questionName] = question['de_question']
        })

        return res.status(200).json(objeto)
    }

    #testResponse = async ({ req, objResp }) => {

        if (this.questions.length <= 0) {
            await this.#returnQuestion(req)
        }

        try {
            let result = this.questions

            let respCorrect1 = result[0]['res_question']
            let respUser1 = objResp.resp1

            let comp1 = await this.encrypt.compareEncrypt({ textPlain: respUser1, hashedText: respCorrect1, isPass: false })

            let respCorrect2 = result[1]['res_question']
            let respUser2 = objResp.resp2

            let comp2 = await this.encrypt.compareEncrypt({ textPlain: respUser2, hashedText: respCorrect2, isPass: false })

            console.log('Comparaciones: ', comp1, comp2);
            if (!comp1 || !comp2) return false

            return true;
        } catch (error) {
            console.log('Hubo un error al validar si las respuestas del usuario coinciden con las ingresadas', error);
        }

    }

    validateResponse = async (req, res, next) => {
        const result = validateObjResp(req.body)

        try {
            if (!result) {
                return res.status(400).json({ message: 'Todas las respuestas deben ser string' })
            }

            let bool = await this.#testResponse({ req: req, objResp: result })

            let attemps = await this.model.validateAttemps({
                keyQuery: nameQuerys.selectOneUser,
                objComp: req.session,
                objProp: objProp
            })

            if (attemps === 0) {
                await this.model.blockUserOrDisblockUser({
                    keyQuery: nameQuerys.blockUser,
                    objComp: req.session,
                    bool: true
                })
            }

            let isBlocked = await this.model.validateIsBlockedByUser({
                keyQuery: nameQuerys.selectOneUser,
                objComp: req.session,
                objProp: objProp
            })

            if (isBlocked) {
                return res.status(400).json({ message: 'Su usuario se encuentra bloqueado no puede realizar esta accion' })
            }



            if (!bool) {
                await this.model.reduceCounter({
                    keyQuery: nameQuerys.reduceCont,
                    objComp: req.session
                })
                return res.status(400).json({ message: 'Las respuestas no coinciden' })
            }

            await this.model.resetCounter({
                keyQuery: nameQuerys.resetCont,
                attemps: 4,
                objComp: req.session
            })

            // console.log('Las respuestas coinciden');
            return next();

        } catch (error) {
            console.log('Hubo un error al hacer un test a las respuestas o al reducir los contadores', error);
        }

    }

    #generatePass = (longitud) => {
        const char = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let clave = '';

        for (let i = 0; i < longitud; i++) {
            const indice = Math.floor(Math.random() * char.length);
            clave += char.charAt(indice);
        }

        return clave;
    }



    modifiedPass = async (req, res, next) => {
        this.newPass = this.#generatePass(8);
        // console.log('Esta es la new Pass ', newPass);
        try {

            let passEncrypt = await this.encrypt.encryptText({ text: this.newPass, salt: 10 })

            const oldPass = await this.managerDB.returnByProp({
                keyQuery: nameQuerys.selectOneUser,
                user: req.session.user,
                viewProp: objProp.pass
            })

            let result = await this.model.modifiedPass({
                user: req.session.user,
                keyQuery: nameQuerys.selectOneUser,
                keyModifiedQuery: nameQuerys.modifiedPass,
                newPass: passEncrypt,
                objProp: objProp,
                oldPass: oldPass
            })

            if (!result) {
                console.log('Hubo un errro al modificar la old password a la nueva password generada');
                return res.status(400).json({ message: 'Error al modificar password, verifique datos' })
            }

            return next()

        } catch (error) {
            console.log('Hubo un error al extraer, modificar o enviar la nueva password generada', error);
            return res.status(400).json({ message: 'Error al modificar password, verifique datos' })
        }


    }
    //Pasa a este metodo cuando todo sea valido y asi envia al correo proporcionado la nueva pass autogenerada y luego tiene que modificarla en la base de datos
    #sendNewPass = async (req, pass) => {
        //*Aqui creamos la fecha actual en timestamp
        const date = Date.now();

        const objTime = new Date(date);
        const fecha = objTime.toLocaleDateString()
        const hora = objTime.toLocaleTimeString()

        // console.log('Aqui', req.session.email, pass);
        this.sendEmail.contentEmail({
            to: req.session.email,
            subject: 'Cambio de clave',
            html: `Empresa informa, cambio de clave de usuario en Empresa Session Online el ${fecha} a las ${hora} Si no lo reconoce llame al <a href="www.twitter.com" style=" color: black;text-decoration: underline">0412-1528916</a>, su clave temporal es: <a style="color: purple; text-decoration: underline" href="www.google.com">${pass}</a>`,
        })

        try {
            await this.sendEmail.sendEmail();
            return true;
        } catch (error) {
            console.log('Hubo un error al enviar el correo de la nueva clave al usuario', error);
            return false;
        }

    }

    sendMessage = async (req, res) => {
        console.log(this.newPass);

        let bool = await this.#sendNewPass(req, this.newPass);

        if (!bool) {
            return res.status(400).json({ message: 'Hubo un error al enviar el correo al usuario' })
        }


        let destroySession = this.session.destroySession(req)
        if (!destroySession) {
            console.log('Hubo un error al destruir la session');
            return res.status(400).json({ message: 'El sistema tuvo un error al cerrar su session' })
        }


        return res.status(200).json({ message: 'Se ha enviado la nueva password a su correo' })

    }

}








