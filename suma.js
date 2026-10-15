// suma.js - Lógica para sumar dos números introducidos por el usuario

document.addEventListener('DOMContentLoaded', () => {
  const num1Input = document.getElementById('num1');
  const num2Input = document.getElementById('num2');
  const btnSumar = document.getElementById('btnSumar');
  const resultadoDiv = document.getElementById('resultado');

  function sumar() {
    const n1 = parseFloat(num1Input.value);
    const n2 = parseFloat(num2Input.value);

    // Validar que ambos campos tengan números válidos
    if (isNaN(n1) || isNaN(n2)) {
      resultadoDiv.textContent = '⚠️ Introduce dos números válidos';
      resultadoDiv.style.color = '#ffd166';
      return;
    }

    const suma = n1 + n2;
    resultadoDiv.textContent = `Resultado: ${suma}`;
    resultadoDiv.style.color = '#ffffff';
  }

  // Sumar al hacer clic en el botón
  btnSumar.addEventListener('click', sumar);

  // Sumar al presionar Enter en cualquiera de los inputs
  [num1Input, num2Input].forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sumar();
    });
  });
});