'use strict'
import z from 'zod'


const objTest = z.object({
    user: z.string({
        invalid_type_error: "El usuario debe ser un String",
        required_error: "El titulo de la pelicula es Requerido"
    })
})

export let validateObjUser = (input) => objTest.safeParse(input)
