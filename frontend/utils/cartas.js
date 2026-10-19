import { FRASES } from '../data/frases';

export const CARTAS_POR_DIA = 3;

// Hash simples (FNV-1a) para transformar texto em número
function hash(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Gerador de números pseudoaleatórios com semente (mulberry32)
function gerador(semente) {
  let a = semente;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Número do dia no calendário LOCAL (muda à meia-noite do aparelho)
export function numeroDoDia(data = new Date()) {
  return Math.floor(Date.UTC(data.getFullYear(), data.getMonth(), data.getDate()) / 86400000);
}

// Quantas frases entram no sorteio (múltiplo de 3 para um dia nunca cruzar dois ciclos)
export function totalUsavel() {
  return FRASES.length - (FRASES.length % CARTAS_POR_DIA);
}

// Cada pessoa tem uma ordem própria e embaralhada das frases.
// Dentro de um ciclo (total / 3 dias) nenhuma frase se repete.
const cacheOrdens = {};
function ordemDoCiclo(userId, ciclo) {
  const chave = `${userId}:${ciclo}`;
  if (!cacheOrdens[chave]) {
    const total = totalUsavel();
    const ordem = Array.from({ length: total }, (_, i) => i);
    const sorteio = gerador(hash(chave));
    for (let i = total - 1; i > 0; i--) {
      const j = Math.floor(sorteio() * (i + 1));
      const troca = ordem[i];
      ordem[i] = ordem[j];
      ordem[j] = troca;
    }
    cacheOrdens[chave] = ordem;
  }
  return cacheOrdens[chave];
}

// As 3 cartas de uma pessoa em um dia: sempre as mesmas para aquela pessoa
// naquele dia, mas diferentes entre pessoas e entre dias.
export function sortearCartas(userId, dia = numeroDoDia()) {
  const total = totalUsavel();
  const inicio = dia * CARTAS_POR_DIA;
  const cartas = [];
  for (let k = 0; k < CARTAS_POR_DIA; k++) {
    const posicao = inicio + k;
    const ciclo = Math.floor(posicao / total);
    cartas.push(FRASES[ordemDoCiclo(userId, ciclo)[posicao % total]]);
  }
  return cartas;
}
