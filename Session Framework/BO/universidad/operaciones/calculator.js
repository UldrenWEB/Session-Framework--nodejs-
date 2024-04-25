

export default class Calculator {
    constructor() {

    }

    #ejecutaMetodo = (operation) => {
        let resultado = this[operation]();

        console.log(`El resultado de la operacion: ${resultado}`);
    }

    suma = (num1, num2) => num1 + num2;

    multiplicacion = (num1, num2) => num1 * num2

    division = (num1, num2) => num1 / num2

    resta = (num1, num2) => num1 - num2
}