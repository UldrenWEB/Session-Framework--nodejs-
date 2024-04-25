'use strict'

//*Ruta para el controlador de seleccion de perfil

import {
    Session,
    UserModel,
    Security,
    nameQuerys
} from "../imports.js"



export class SelectProfileController {
    constructor() {
        this.model = new UserModel()
        this.session = new Session()
        this.security = new Security()


        this.arrayProfile;
    }

    middleWare = (req, res, next) => {
        let bool = this.session.hasSession(req);

        if (!bool) {
            return res.status(400).json({ message: 'La session no existe, debe loguearse antes' })
        }

        if (!Array.isArray(req.session.profile)) {
            return res.status(400).json({ message: 'Perfil no valido para este endPoint' })
        }

        // console.log('La session existe y eres: ', req.session.user);
        return next()

    }

    #optionsProfileObject = (req, map) => {
        this.arrayProfile = req.session.profile

        let objectProfile = {};
        let cont = 0;
        // Iterar sobre los perfiles del usuario
        for (const profileUser of this.arrayProfile) {
            // Verificar si el perfil del usuario está presente en el mapa
            if (map.has(profileUser)) {
                cont++;
                // Obtener los permisos del perfil del mapa
                const { permission } = map.get(profileUser);

                // Crear un objeto para almacenar los datos del perfil
                const profile = {
                    profile: `${profileUser}`,
                    permissions: {
                        modules: permission.modules,
                        objects: permission.objects,
                        methods: permission.methods
                    }
                };

                // Agregar el objeto del perfil al objeto principal
                objectProfile[`ID: ${cont}`] = profile;
            }
        }
        return objectProfile;
    }
    #optionsProfileString = (req, map) => {
        this.arrayProfile = req.session.profile;

        // Crear una cadena vacía para almacenar los resultados
        let cadena = '';

        // Iterar sobre los perfiles del usuario
        for (const profile of this.arrayProfile) {
            // Verificar si el perfil del usuario está presente en el mapa
            if (map.has(profile)) {
                // Obtener los permisos del perfil del mapa
                const { permission } = map.get(profile);

                // Agregar el nombre del perfil a la cadena
                cadena += `Perfil: ${profile}\n`;

                // Iterar sobre los permisos del perfil
                cadena += 'Permisos:\n';
                for (const module of permission.modules) {
                    cadena += `- Modulo: ${module}\n`;
                }
                for (const object of permission.objects) {
                    cadena += `- Objeto: ${object}\n`;
                }
                for (const method of permission.methods) {
                    cadena += `- Metodo: ${method}\n`;
                }

                // Agregar un separador entre perfiles
                cadena += '--------------------\n';
            }
        }
        return cadena;
    }

    viewOptions = async (req, res) => {

        try {
            const map = await this.security.getPermissions()

            // let cadena = this.#optionsProfileString(req, map)
            // res.status(200).send(cadena)

            let object = this.#optionsProfileObject(req, map)
            return res.status(200).json({ object })


        } catch (error) {
            console.log('Hubo un error al cargar el mapa para ver las opciones de perfiles', error.message);
        }

    }

    selectedProfile = async (req, res) => {

        if (isNaN(req.body.profile)) {
            return res.status(400).json({ message: 'El perfil enviado debe de ser un numero' });
        }


        // console.log('Aqui perfil enviado', req.body.profile);
        let profile = Number(req.body.profile)

        let bool = await this.#validateProfile(req, profile);

        if (!bool) {
            return res.status(400).json({ message: 'El perfil enviado no es valido' })
        }

        //*Se le asgino el perfil
        req.session.profile = profile;

        console.log('El perfil fue seleccionado correctamente');
        return res.redirect('/toProcess')

    }

    #validateProfile = async (req, profile) => {
        let arrayProfile = this.arrayProfile

        //Try catch para comprobar si es en realidad un arreglo lo que me estan pasando
        try {
            if (arrayProfile[0]) console.log('Si es un arreglo');
        } catch (error) {
            console.log('No cuenta con un perfil valido para esta seccion');
            return false;
        }

        let isCorrectProfile = arrayProfile.find(pr => pr === profile)

        if (!isCorrectProfile) {
            console.log('No esta en la lista de opciones ese perfil');
            return false;
        }

        try {

            let result = await this.model.searchProfile({
                keyQuery: nameQuerys.selectProfileByUser,
                user: req.session.user
            })

            let bool = result.find(pr => pr.id_profile === profile)
            console.log('Aqui el comprobante en la base de datos del perfil', result);
            if (!bool) {

                console.log('El usuario no cuenta con este perfil');
                //*Le asignamos de nuevo esos arreglo de perfiles a su session
                const array = result.map(obj => obj.id_profile);
                console.log(array);
                //Se le asignan los perfiles correspondientes con el usuario
                req.session.profile = array;

                //!Aqui se le puede redirigir para que vuelva a seleccionar el perfil correcto

                return false;
            }


            //Significa que todo fue correcto por lo que se le asigna el perfil y se ha logueado correctamente
            return true;

        } catch (error) {
            console.log('Hubo un error al validar el perfil para ver si existe para ese usuario', error.message);
        }


    }

}