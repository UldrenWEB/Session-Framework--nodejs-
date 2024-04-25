'use strict'

import mailer from 'nodemailer'
import path from 'node:path'
import { readJSON } from '../imports.js'


//Componente para enviar correos
export class SendEmail {
    constructor({ configTransporter, auth }) {

        let pathConfig = path.join(process.cwd(), 'configs', 'email', configTransporter)
        let pathAuth = path.join(process.cwd(), 'configs', 'email', auth)

        let transporter = readJSON(pathConfig)
        this.configAuth = readJSON(pathAuth)

        //*Se usa de esta manera el transporter ya que si su configuracion se usa de manera directa ocurre un error
        this.transporter = mailer.createTransport({
            host: transporter.host,
            port: transporter.port,
            secure: transporter.secure,
            auth: this.configAuth,
        })

        this.content;
    }

    //*Aqui pueda validar el contenido del objeto
    contentEmail = ({ to, subject, html }) => {
        let object = {
            from: this.configAuth.user,
            to: `${to}`,
            subject: subject,
            html: html
        }
        this.content = object;
    }

    sendEmail = () => {
        return new Promise((resolve, reject) => {
            let object = this.content;
            for (let prop in object) {
                if (!object[prop]) {
                    return reject('Error en el contenido del correo')
                }
            }
            this.transporter.sendMail(object, (error, info) => {
                if (error) {
                    return reject(error);
                }

                return resolve(info.response);
            })
        })

    }
}




