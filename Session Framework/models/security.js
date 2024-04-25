'use strict'

import { ManagerDB } from "./managerDB.js";
import { nameQuerys } from "../imports.js";
//*Componente de Seguridad que comprueba si el Usuario tiene permisos o no para ejecutar un metodo especifico

export class Security {
    constructor() {

        this.manager = new ManagerDB({
            directory: 'configs',
            apart: 'data',
            configPool: 'configPool.json',
            objQuerys: 'querys.json'
        })

        this.map

        this.#chargePermissions({
            map: this.map,
            keyQuery: 'selectPermission'
        })

            .then(myMap => {
                this.map = myMap
                // console.log('Se cargo correctamente el mapa');
                // console.log('Este es el mapa', this.map);
            })
            .catch(err => {
                console.log('Hubo algun error', err);
            })


    }

    #chargePermissions = async ({ map, keyQuery }) => {
        try {
            const result = await this.manager.searchDB({
                key: keyQuery
            })
            // console.log(result);


            //Pasa dos argumentos el acumulador y el objeto el cual ira procesando del arreglo de objeto de la consulta
            map = result.reduce((map, obj) => {

                const id = obj.id_profile;
                const moduleName = obj.no_module.toLowerCase();
                const objectName = obj.no_object.toLowerCase();
                const methodName = obj.no_method.toLowerCase();

                if (map.has(id)) {
                    const array = map.get(id).permission;

                    //Verificar si los nombres ya existen en los arreglos
                    if (!array.modules.includes(moduleName)) {
                        array.modules.push(moduleName);
                    }

                    if (!array.objects.includes(objectName)) {
                        array.objects.push(objectName);
                    }

                    if (!array.methods.includes(methodName)) {
                        array.methods.push(methodName);
                    }
                } else {
                    const arrays = {
                        modules: [moduleName],
                        objects: [objectName],
                        methods: [methodName]
                    };
                    map.set(id, { sts: true, permission: arrays });
                }

                return map;

            }, new Map());

            // console.log('Fue correcto');

            console.log(map.get(1).sts, map.get(1).permission.objects, map.get(1).permission.modules);
            // console.log(mapaIDs.get(2).permission.methods);
            // console.log(mapaIDs.get(3).permission.methods);

            return map;
        } catch (error) {
            console.log('Hubo un error al hacer la busqueda de permisos y cargarlos al mapa', error.message);
        }

    }



    getPermissions = async () => {
        if (this.map.size <= 0) {
            console.log('El mapa no cargo');
            let map = await this.#chargePermissions({ map: this.map, keyQuery: nameQuerys.selectPermission })
            this.map = map

            return this.map;
        }

        return this.map
    }

    securePermissions = (key) => {
        // console.log(this.map);

        if (!this.map.has(key)) {
            console.log('Este usuario no tiene permisos por lo que no se le pueden asegurar');
        } else {
            if (!this.map.get(key).sts) {
                console.log('Su perfil no contaba con los permisos pero se le aseguraran dichos permisos');
                this.map.get(key).sts = true;
            } else {
                console.log('Ya tiene seguro los permisos');
            }
        }
    }

    addPermisions = async (objComp) => {

        const profile = objComp.profile
        const module = objComp.module
        const object = objComp.object
        const method = objComp.method


        try {
            let result = await this.manager.searchDB({ key: nameQuerys.selectAllModule, params: [module] })

            let bool = result.find(obj => obj.no_module === module)

            if (!bool) {
                console.log('El modulo ingresado no existe');
                return false;
            }

        } catch (error) {
            console.log('Hubo un error al buscar si el modulo existe', error);
            return false;
        }

        if (this.map.has(profile)) {
            const array = this.map.get(profile).permission;

            // Verificar si los nombres ya existen en los arreglos
            if (!array.modules.includes(moduleName)) {
                array.modules.push(moduleName);
            }

            if (!array.objects.includes(objectName)) {
                array.objects.push(objectName);
            }

            if (!array.methods.includes(methodName)) {
                array.methods.push(methodName);
            }
        } else {
            const arrays = {
                modules: [module],
                objects: [object],
                methods: [method]
            };
            this.map.set(id, { sts: true, permission: arrays });
        }

        try {
            let idMethod = await this.manager.returnByProp({
                keyQuery: nameQuerys.getIdMethod,
                viewProp: 'id_method',
                user: method
            })

            let existProfile = await this.manager.searchDB({
                key: nameQuerys.existProfile,
                params: [profile]
            })

            if (existProfile.length <= 0) {
                console.log('El perfil ingresado no existe');
                return false;
            }

            let addPermission = await this.manager.modifiedDB({
                key: nameQuerys.addPermission,
                params: [profile, idMethod]
            })

            if (addPermission > 0) {
                console.log('Se ingreso correctamente un nuevo permiso');
            }
        } catch (error) {
            console.log('Hubo un error al ingresar un nuevo permiso, verifique si el perfil, el tipo de permiso o metodo que ingreso son validos', error);
        }
    }

    removePermissions = async (key) => {

        if (!this.map.has(key)) {
            console.log('El usuario no existe');
            return false
        }

        this.map.get(key).sts = false

        if (!this.map.get(key).sts) {
            console.log('El permiso fue eliminado correctamente');
        } else {
            console.log('El usuario no existe por lo que no se puede eliminar');
        }

        console.log('El profile que se removera es:', key);

        try {
            await this.manager.modifiedDB({
                key: nameQuerys.deletePermission,
                params: [key]
            })
            console.log('Se elimino correctamente el permiso del perfil');
        } catch (err) {
            console.log('Hubo un error al remover el permiso, verifique el key suministrado', err);
        }

    }
    validatePermission = (objComp, key) => {
        // Verificar si el usuario tiene los permisos necesarios
        if (
            this.map.has(key) &&
            this.map.get(key).permission.modules.includes(objComp.module) &&
            this.map.get(key).permission.objects.includes(objComp.objName) &&
            this.map.get(key).permission.methods.includes(objComp.method)
        ) {
            // console.log("El usuario tiene permisos para ejecutar el método.");
            return true;
        } else {
            console.log("El usuario no tiene permisos.");
            return false;
        }
    }


    hasPermission = (key) => {
        // console.log(this.map);
        // console.log('Este es el perfil', key);
        // console.log(this.map);

        if (this.map.has(key)) {

            if (this.map.get(key).sts) {
                // console.log('Si cuenta con permisos');
                return true;
            } else {
                // console.log('No tiene permisos');
                return false;
            }
        } else {
            console.log('No existe ese profile');
            return false;
        }
    }

    //Terminar este metodo
    executeMethod = async (j) => {

        let objName = (j.objName).toLowerCase()


        try {
            let objImport = await import(`../BO/${j.system}/${j.module}/${objName}.js`);
            let obj = new objImport.default();

            if (j.params) {
                // console.log('Si tiene parametros');
                return obj[j.method](...j.params)
            }

            return obj[j.method]()
        } catch (error) {
            console.log('Hubo un error no se encontro el modulo a ejecutar, verifique el objeto', error.message);
        }

    }

}


