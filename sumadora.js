let inp_num1 = document.getElementById('num1');
let inp_num2 = document.getElementById('num2');
let resultado = document.getElementById('resultado');
let btnSumar = document.getElementById('btnSumar');

function sumar() {
    let num1 = parseFloat(inp_num1.value) || 0;
    let num2 = parseFloat(inp_num2.value) || 0;
    
    let sumaTotal = num1 + num2;
    resultado.value = sumaTotal;
}

btnSumar.addEventListener('click', sumar);