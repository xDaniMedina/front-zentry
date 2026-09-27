// Frases célebres en español (arte, creatividad, motivación y paz).
// Colección local: las APIs gratuitas de frases solo ofrecen textos en inglés y no permiten
// llamadas directas desde el navegador (CORS), así que se usan frases curadas con su autor.

export type QuoteCategory = 'arte' | 'creatividad' | 'motivacion' | 'paz'

export interface Quote {
  text: string
  author: string
  category: QuoteCategory
}

export const QUOTE_CATEGORIES: { id: QuoteCategory; label: string; emoji: string }[] = [
  { id: 'arte', label: 'Arte', emoji: '🎨' },
  { id: 'creatividad', label: 'Creatividad', emoji: '💡' },
  { id: 'motivacion', label: 'Motivación', emoji: '🔥' },
  { id: 'paz', label: 'Paz', emoji: '🕊️' },
]

export const QUOTES: Quote[] = [
  // Arte
  { text: 'El arte lava del alma el polvo de la vida cotidiana.', author: 'Pablo Picasso', category: 'arte' },
  { text: 'Todo niño es un artista. El problema es cómo seguir siéndolo al crecer.', author: 'Pablo Picasso', category: 'arte' },
  { text: 'El arte no reproduce lo visible, sino que hace visible lo que no siempre lo es.', author: 'Paul Klee', category: 'arte' },
  { text: 'Pinto flores para que no mueran.', author: 'Frida Kahlo', category: 'arte' },
  { text: 'Pies, ¿para qué los quiero si tengo alas para volar?', author: 'Frida Kahlo', category: 'arte' },
  { text: 'Sueño con pintar y luego pinto mi sueño.', author: 'Vincent van Gogh', category: 'arte' },
  { text: 'Si escuchas una voz que te dice que no puedes pintar, pinta, y esa voz se callará.', author: 'Vincent van Gogh', category: 'arte' },
  { text: 'El arte es la mentira que nos permite comprender la verdad.', author: 'Pablo Picasso', category: 'arte' },
  { text: 'La sencillez es la máxima sofisticación.', author: 'Leonardo da Vinci', category: 'arte' },
  { text: 'Cada artista moja su pincel en su propia alma y pinta su propia naturaleza.', author: 'Henry Ward Beecher', category: 'arte' },
  // Creatividad
  { text: 'La creatividad es la inteligencia divirtiéndose.', author: 'Albert Einstein', category: 'creatividad' },
  { text: 'La inspiración existe, pero tiene que encontrarte trabajando.', author: 'Pablo Picasso', category: 'creatividad' },
  { text: 'No puedes agotar la creatividad: cuanto más la usas, más tienes.', author: 'Maya Angelou', category: 'creatividad' },
  { text: 'La imaginación es más importante que el conocimiento.', author: 'Albert Einstein', category: 'creatividad' },
  { text: 'Crear es vivir dos veces.', author: 'Albert Camus', category: 'creatividad' },
  { text: 'El diseño no es solo cómo se ve o cómo se siente. El diseño es cómo funciona.', author: 'Steve Jobs', category: 'creatividad' },
  { text: 'Para ser creativo hay que perder el miedo a equivocarse.', author: 'Joseph Chilton Pearce', category: 'creatividad' },
  { text: 'La curiosidad sobrevivirá a la certeza.', author: 'Eduardo Galeano', category: 'creatividad' },
  // Motivación
  { text: 'El éxito es la suma de pequeños esfuerzos repetidos día tras día.', author: 'Robert Collier', category: 'motivacion' },
  { text: 'No cuentes los días, haz que los días cuenten.', author: 'Muhammad Ali', category: 'motivacion' },
  { text: 'Caminante, no hay camino: se hace camino al andar.', author: 'Antonio Machado', category: 'motivacion' },
  { text: 'Lo que hacemos por nosotros muere con nosotros; lo que hacemos por los demás permanece.', author: 'Albert Pike', category: 'motivacion' },
  { text: 'Siempre parece imposible hasta que se hace.', author: 'Nelson Mandela', category: 'motivacion' },
  { text: 'La disciplina es el puente entre las metas y los logros.', author: 'Jim Rohn', category: 'motivacion' },
  { text: 'El único modo de hacer un gran trabajo es amar lo que haces.', author: 'Steve Jobs', category: 'motivacion' },
  { text: 'Cae siete veces, levántate ocho.', author: 'Proverbio japonés', category: 'motivacion' },
  { text: 'Hecho es mejor que perfecto.', author: 'Sheryl Sandberg', category: 'motivacion' },
  { text: 'La utopía está en el horizonte: sirve para caminar.', author: 'Eduardo Galeano', category: 'motivacion' },
  // Paz
  { text: 'No hay camino para la paz: la paz es el camino.', author: 'Mahatma Gandhi', category: 'paz' },
  { text: 'La paz comienza con una sonrisa.', author: 'Madre Teresa de Calcuta', category: 'paz' },
  { text: 'La paz viene de dentro. No la busques fuera.', author: 'Buda', category: 'paz' },
  { text: 'Si quieres cambiar el mundo, cámbiate a ti mismo.', author: 'Mahatma Gandhi', category: 'paz' },
  { text: 'Adopta el ritmo de la naturaleza: su secreto es la paciencia.', author: 'Ralph Waldo Emerson', category: 'paz' },
  { text: 'Entre el respeto al derecho ajeno y el propio está la paz.', author: 'Benito Juárez', category: 'paz' },
  { text: 'Respira. Deja ir. Y recuerda que este momento es el único que sabes que tienes.', author: 'Oprah Winfrey', category: 'paz' },
  { text: 'La calma es la cuna del poder.', author: 'Josiah Gilbert Holland', category: 'paz' },
]

/** Frase del día: la misma para todos durante el día (cambia a medianoche) */
export function quoteOfTheDay(date = new Date()): Quote {
  const dayNumber = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000)
  return QUOTES[dayNumber % QUOTES.length]
}
