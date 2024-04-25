'use strict'

import z from 'zod'

const objTest = z.object({
    user: z.string({
        invalid_type_error: 'El nombre del usuario debe ser un String',
        required_error: 'El nombre del usuario es requerido'
    }),
    pass: z.string({
        invalid_type_error: 'La password debe ser un String',
        required_error: 'La password del usuario es requerida'
    }),
    email: z.string().email({
        message: 'El email es requerido y debe ser un email valido'
    })
})

export const validateObjRegister = (input) => objTest.safeParse(input)


