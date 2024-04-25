'use strict'
import { ManagerDB } from "./managerDB.js";

import { nameQuerys } from "../../../imports.js";


export class ModifiedPermission {
    constructor() {

        //TODO: Hacer que en cada metodo que se quiera ejecutar compruebe si el mapa se cargo y sino se vuelve a cargar
        this.manager = new ManagerDB({
            directory: 'configs',
            configPool: 'configPool.json',
            objQuerys: 'querys.json'
        })

        this.map = new Map();

        this.#chargePermissions({
            map: this.map,
            keyQuery: 'selectPermission'
        }).then(data => {
            console.log('Se cargo correctamente el mapa');
            console.log('Este es el mapa', this.map);
        }).catch(err => {
            console.log('Hubo algun error', err);
        })


    }

    #chargePermissions = async ({ map, keyQuery }) => {

        let result = await this.manager.searchDB({
            key: keyQuery
        })

        result.forEach(obj => {
            let key = `${obj.id_profile}_${obj.no_module}_${obj.no_object}_${obj.no_method}`.toLowerCase()

            let mapa = new Map();
            map.set(key, { sts: true })
            // console.log(key);
        });

        return result;
    }
    securePermissions = (key) => {
        if (!this.map.get(key)) {
            console.log('Este usuario no tiene permisos por lo que no se le pueden asegurar');
            this.map.set(key, { sts: true })
        } else {
            if (!this.map.get(key).sts) {
                console.log('Su perfil no contaba con los permisos pero se le aseguraran los permisos');
                this.map.set(key, { sts: true })
            } else {
                console.log('Ya tiene seguro los permisos');
            }
        }
    }

    addPermisions = async (objComp) => {
        this.map.set(key, { sts: true })

        try {
            let idMethod = await this.manager.returnByProp({
                keyQuery: nameQuerys.getIdMethod,
                viewProp: 'id_method',
                user: objComp.method
            })

            let idTpPermission = await this.manager.returnByProp({
                keyQuery: nameQuerys.getIdPermission,
                viewProp: 'id_tp_permission',
                user: objComp.permission
            })

            let existProfile = await this.manager.searchDB({
                key: nameQuerys.existProfile,
                params: [objComp.profile]
            })

            let rows = await this.manager.modifiedDB({
                key: keyQuery,
                params: [idTpPermission, existProfile, idMethod]
            })

            if (rows > 0) {
                console.log('Se ingreso correctamente un nuevo permiso');
            }
        } catch (error) {
            console.log('Hubo un error al ingresar un nuevo permiso, verifique si el perfil, el tipo de permiso o metodo, que ingreso son validos', error);
        }
    }

    removePermissions = async (key) => {
        this.map.get(key).sts = false

        const match = key.match(/d+/)
        let idProfile = match[0];
        console.log('El profile que se removera es:', idProfile);

        try {
            await this.manager.modifiedDB({
                key: nameQuerys.deletePermission,
                params: [idProfile]
            })
            console.log('Se elimino correctamente el permiso del perfil');
        } catch (err) {
            console.log('Hubo un error al remover el permiso, verifique el key suministrado', err);
        }

        if (!this.map.get(key).sts) {
            console.log('El permiso fue eliminado correctamente');
        } else {
            console.log('El usuario no existe por lo que no se puede eliminar');
        }
    }

}




