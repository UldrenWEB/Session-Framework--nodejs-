'use strict'

import pkg from 'pg'
const { Pool } = pkg //* Aqui se usa la destructuracion porque de otro modo no se puede exportar el Pool

//* DBComponet Clase de conexion a la base de datos

export class DBComponent {
    constructor(config) {

        this.pool = new Pool(config)

    }

    #connect = async () => {
        try {
            const client = await this.pool.connect()
            return client;
        } catch (err) {
            console.log('Hubo un error al conectarse: ', err);
            return false
        }

    }
    executeQuery = async ({ query, params = undefined }) => {
        const client = await this.#connect()
        await client.query('BEGIN')

        try {
            const { rowCount } = await client.query(query, params)

            await client.query('COMMIT')
            client.release()

            return rowCount;
        } catch (error) {
            console.log('Hubo un error al ejecutar la consulta Update, Delete or Insert', error);
            await client.query('ROLLBACK')
            client.release()

            return false;
        }

    }

    dbExecute = async ({ query, params = undefined }) => {
        const client = await this.#connect()
        try {

            const { rows } = await client.query(query, params)
            // console.log(rows);

            client.release()
            return rows;

        } catch (error) {
            console.log('Hubo un error al ejecutar la consulta', error);
            return false;
        }

    }

    endPool = async () => {
        try {
            await this.pool.end()

        } catch (error) {
            console.log('Hubo un error al intentar cerrar el grupo de conexiones', error);
        }
    }



}



