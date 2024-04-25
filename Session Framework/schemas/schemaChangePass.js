import z from 'zod'


const objTest = z.object({
    pass: z.string({
        invalid_type_error: "La password antigua debe ser un String",
        required_error: "La password antigua es requerida"
    }),
    newPass: z.string({
        invalid_type_error: 'La nueva password debe ser un string',
        required_error: 'La nueva password es requerida para realizar el cambio'
    })
})

export let validateObjPass = (input) => objTest.safeParse(input)
