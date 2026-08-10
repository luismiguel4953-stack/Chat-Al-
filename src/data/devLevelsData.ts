import { DevLevel } from '../types';

export const GENERATED_100_LEVELS: DevLevel[] = Array.from({ length: 100 }, (_, index) => {
  const levelNum = index + 1;
  
  if (levelNum === 1) {
    return {
      id: 1,
      title: '¡Hola Mundo en Programación!',
      category: 'HTML & CSS',
      description: 'El primer paso de todo programador es imprimir la mítica frase "Hola Mundo".',
      task: 'Completa la función o etiqueta para mostrar "Hola Mundo".',
      codeTemplate: 'function saludar() {\n  return "Hola ";\n}\n\n// Agrega "Mundo" al retorno',
      expectedOutputOrTest: 'Hola Mundo',
      hint: 'Modifica la cadena de texto para que sea "Hola Mundo".',
      xpReward: 100,
    };
  }

  if (levelNum === 2) {
    return {
      id: 2,
      title: 'Variables y Constantes en JS',
      category: 'Lógica JS',
      description: 'Aprende a declarar variables con let y const.',
      task: 'Crea una constante llamada "nombre" con el valor "LM" y retorna un saludo.',
      codeTemplate: 'function obtenerNombre() {\n  // Declara la variable nombre\n  const nombre = "LM";\n  return "Creador: " + nombre;\n}',
      expectedOutputOrTest: 'Creador: LM',
      hint: 'Asegúrate de que la función retorne "Creador: LM".',
      xpReward: 120,
    };
  }

  if (levelNum === 3) {
    return {
      id: 3,
      title: 'Sumando Números e Inteligencia',
      category: 'Lógica JS',
      description: 'Las operaciones matemáticas son la base de los algoritmos de la IA.',
      task: 'Retorna la suma de dos variables a = 15 y b = 25.',
      codeTemplate: 'function sumarValores(a, b) {\n  return a + b;\n}',
      expectedOutputOrTest: '40',
      hint: 'Invoca la función sumarValores(15, 25).',
      xpReward: 150,
    };
  }

  if (levelNum === 4) {
    return {
      id: 4,
      title: 'Condicionales IF & ELSE',
      category: 'Lógica JS',
      description: 'Toma de decisiones en el código.',
      task: 'Si la velocidad es mayor a 100 retorna "Rápido", de lo contrario "Normal".',
      codeTemplate: 'function verificarVelocidad(v) {\n  if (v > 100) {\n    return "Rápido";\n  }\n  return "Normal";\n}',
      expectedOutputOrTest: 'Rápido',
      hint: 'Prueba la función con verificarVelocidad(120).',
      xpReward: 180,
    };
  }

  if (levelNum === 5) {
    return {
      id: 5,
      title: 'Arrays y Listas de Datos',
      category: 'Lógica JS',
      description: 'Almacenar múltiples elementos en una sola variable.',
      task: 'Añade el lenguaje "TypeScript" al array de lenguajes y retorna su longitud.',
      codeTemplate: 'function agregarLenguaje() {\n  const lenguajes = ["HTML", "CSS", "JavaScript"];\n  lenguajes.push("TypeScript");\n  return lenguajes.length;\n}',
      expectedOutputOrTest: '4',
      hint: 'Usa .push() y luego .length.',
      xpReward: 200,
    };
  }

  // Categorization across 100 levels
  let category: DevLevel['category'] = 'HTML & CSS';
  if (levelNum > 10 && levelNum <= 30) category = 'Lógica JS';
  else if (levelNum > 30 && levelNum <= 60) category = 'React & UI';
  else if (levelNum > 60 && levelNum <= 85) category = 'Python & Algoritmos';
  else if (levelNum > 85) category = 'Full-Stack AI';

  const isPro = levelNum > 15;

  return {
    id: levelNum,
    title: `Nivel ${levelNum}: ${category} - Desafío Dev`,
    category,
    description: `Aprende conceptos fundamentales y avanzados del nivel ${levelNum} para convertirte en desarrollador con asistencia IA.`,
    task: `Resuelve el ejercicio de código para el Nivel ${levelNum} y acumula XP.`,
    codeTemplate: `function retoNivel${levelNum}() {\n  // Escribe tu código para el Nivel ${levelNum}\n  const nivel = ${levelNum};\n  return "Nivel " + nivel + " Completado";\n}`,
    expectedOutputOrTest: `Nivel ${levelNum} Completado`,
    hint: `Asegúrate de retornar la cadena exacta 'Nivel ${levelNum} Completado'.`,
    xpReward: 100 + levelNum * 10,
    isProRequired: isPro,
  };
});
