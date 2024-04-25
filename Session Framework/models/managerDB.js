'use strict'

import path from 'node:path'
import { DBComponent } from "../db/dbComponent.js";
import { readJSON } from "../utils/util.js"


//*Esta es la clase manejadora del DBComponente

export class ManagerDB {
    constructor({ directory, apart, configPool, objQuerys }) {

        //*Aqui extremos la ruta absoluta de donde estamos trabajando para poder obtener apartir del nombre esos archivos de configuracion
        const pathConfig = path.join(process.cwd(), directory, apart);

        let config = path.join(pathConfig, configPool)
        let querys = path.join(pathConfig, objQuerys)

        this.configPool = readJSON(config);
        this.querys = readJSON(querys)

        this.dbComponent = new DBComponent(this.configPool);


    }

    //Metodo que ejecuta un query y le indicas el campo a devolver, apartir del user bien sea id o nombre de Usuario
    returnByProp = async ({ keyQuery, user, viewProp = false }) => {

        try {
            let result = await this.searchDB({ key: keyQuery, params: [user] });

            if (!viewProp) {
                return result
            }

            return result[0][viewProp]
        } catch (error) {
            console.log('Hubo un error al retornar un campo especifico: ', error);
        }
    }


    //*Este metodo es para ejecutar alguna consulta que te regrese las filas afectadas ya que eso es lo que retorna el metodo, como UPDATE, INSERT or DELETE
    modifiedDB = async ({ key, params = undefined }) => {

        try {
            let result = await this.dbComponent.executeQuery({
                query: this.querys[key],
                params: params
            })

            return result;
        } catch (error) {
            console.log('Hubo un error al ejecutar un query que modifica la base de datos: ', error);
        }
    }

    //*Este metodo ejecuta cualquier consulta SELECT y te retorna ese arreglo de objetos
    searchDB = async ({ key, params = undefined }) => {

        try {
            let result = await this.dbComponent.dbExecute({ query: this.querys[key], params: params })

            return result;
        } catch (error) {
            console.log('Hubo un error al aplicar una busqueda en la base de datos', error);
        }
    }




}