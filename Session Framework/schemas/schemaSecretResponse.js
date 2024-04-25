'use strict'

import z from 'zod'

export let validateObjResp = (input) => {
    const objetoSchema = z.object({});

    for (const key in input) {
        if (Object.hasOwnProperty.call(input, key)) {
            objetoSchema.shape[key] = z.string();
        }
    }

    try {
        // console.log('El objeto es válido. Todas las propiedades son strings');
        return objetoSchema.parse(input);
    } catch (error) {
        // console.log('El objeto no es válido. Al menos una propiedad no es un string');
        return false;
    }
};
