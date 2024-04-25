'use trict'

import bcrypt from 'bcryptjs'

//Componente para poder encriptar la clave y a su vez compararla

export class Encrypt {
    constructor() {
        this.encryptor = bcrypt;
    }


    encryptText = async ({ text, salt, isPass = true }) => {

        try {
            let modifiedText;
            if (!isPass) {
                modifiedText = text.toLowerCase()
            } else {
                modifiedText = text;

            }

            let numS = await this.encryptor.genSalt(salt);

            let hashPassword = await this.encryptor.hash(modifiedText, numS)

            return hashPassword;
        } catch (error) {
            console.log('Hubo un error al encriptar el texto ingresado', error);
            return false;
        }


    }

    compareEncrypt = async ({ textPlain, hashedText, isPass = true }) => {
        try {
            let modifiedTextPlain;
            if (!isPass) {
                modifiedTextPlain = textPlain.toLowerCase();
            } else {
                modifiedTextPlain = textPlain;

            }


            let isMatch = await this.encryptor.compare(modifiedTextPlain, hashedText)

            return isMatch;
        } catch (error) {
            console.log('Hubo un error al comparar textos', error);
        }
    }

}