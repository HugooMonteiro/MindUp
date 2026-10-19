import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Animated, Easing,
  StyleSheet, Platform, useWindowDimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TEMAS } from '../data/frases';
import { sortearCartas, numeroDoDia, CARTAS_POR_DIA } from '../utils/cartas';
import { postsAPI } from '../services/api';

const usarDriverNativo = Platform.OS !== 'web';

// Uma carta que vira: verso misterioso -> frente com o tema sorteado
function Carta({ flip, largura, altura, tema, aberta, apagada, desativada, onPress }) {
  const rotacaoVerso = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const rotacaoFrente = flip.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={desativada}
      style={{ opacity: apagada ? 0.35 : 1 }}
      accessibilityRole="button"
      accessibilityLabel={aberta ? `Carta de ${tema.nome}` : 'Carta virada para baixo'}
    >
      <View style={{ width: largura, height: altura }}>
        <Animated.View
          style={[
            styles.face,
            styles.verso,
            { transform: [{ perspective: 1000 }, { rotateY: rotacaoVerso }] },
          ]}
        >
          <Text style={styles.versoEstrela}>✦</Text>
          <Text style={styles.versoInterrogacao}>?</Text>
          <Text style={styles.versoEstrela}>✦</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.face,
            { backgroundColor: tema.cor },
            { transform: [{ perspective: 1000 }, { rotateY: rotacaoFrente }] },
          ]}
        >
          <Text style={styles.frenteEmoji}>{tema.emoji}</Text>
          <Text style={styles.frenteTema}>{tema.nome}</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

export default function CartasDoDia({ user, onBack, onGoFeed }) {
  const { width } = useWindowDimensions();
  const userId = String((user && (user.id || user._id)) || 'visitante');
  const userName = (user && user.name) || 'Alguém';

  const dia = useMemo(() => numeroDoDia(), []);
  const cartas = useMemo(() => sortearCartas(userId, dia), [userId, dia]);
  const chaveSalva = `mindup:carta:${userId}`;

  const [carregando, setCarregando] = useState(true);
  const [escolhida, setEscolhida] = useState(null);
  const [compartilhada, setCompartilhada] = useState(false);
  const [compartilhando, setCompartilhando] = useState(false);
  const [aviso, setAviso] = useState('');

  const flips = useRef(
    Array.from({ length: CARTAS_POR_DIA }, () => new Animated.Value(0))
  ).current;
  const aparecer = useRef(new Animated.Value(0)).current;

  // Se a pessoa já escolheu hoje, mostra a carta aberta e as outras fechadas
  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const salvo = await AsyncStorage.getItem(chaveSalva);
        if (salvo && ativo) {
          const dados = JSON.parse(salvo);
          if (dados.dia === dia && dados.escolhida >= 0 && dados.escolhida < CARTAS_POR_DIA) {
            flips[dados.escolhida].setValue(1);
            aparecer.setValue(1);
            setEscolhida(dados.escolhida);
            setCompartilhada(!!dados.compartilhada);
          }
        }
      } catch (e) {
        // sem armazenamento: o jogo funciona normalmente nesta sessão
      }
      if (ativo) setCarregando(false);
    })();
    return () => { ativo = false; };
  }, [chaveSalva, dia]);

  const salvar = async (indice, jaCompartilhou) => {
    try {
      await AsyncStorage.setItem(
        chaveSalva,
        JSON.stringify({ dia, escolhida: indice, compartilhada: jaCompartilhou })
      );
    } catch (e) {
      // ignora falha ao salvar
    }
  };

  const escolher = (indice) => {
    if (escolhida !== null || carregando) return;
    setEscolhida(indice);
    salvar(indice, false);

    Animated.sequence([
      Animated.timing(flips[indice], {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: usarDriverNativo,
      }),
      Animated.timing(aparecer, {
        toValue: 1,
        duration: 500,
        useNativeDriver: usarDriverNativo,
      }),
    ]).start();
  };

  const compartilhar = async () => {
    if (escolhida === null || compartilhada || compartilhando) return;
    const carta = cartas[escolhida];
    const tema = TEMAS[carta.tema];
    setCompartilhando(true);
    setAviso('');

    const texto = `🃏 Minha carta de hoje (${tema.nome} ${tema.emoji}):\n\n“${carta.texto}”`;
    const resultado = await postsAPI.create(userId, userName, texto);
    setCompartilhando(false);

    if (resultado && resultado.error) {
      setAviso(`❌ ${resultado.error}`);
    } else {
      setCompartilhada(true);
      setAviso('✅ Carta compartilhada no feed!');
      salvar(escolhida, true);
    }
  };

  // Tamanho das cartas conforme a largura da tela
  const larguraUtil = Math.min(width, 480) - 40;
  const espaco = 10;
  const larguraCarta = Math.floor((larguraUtil - espaco * (CARTAS_POR_DIA - 1)) / CARTAS_POR_DIA);
  const alturaCarta = Math.floor(larguraCarta * 1.5);

  const cartaEscolhida = escolhida !== null ? cartas[escolhida] : null;
  const temaEscolhido = cartaEscolhida ? TEMAS[cartaEscolhida.tema] : null;

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <Text style={styles.titulo}>Carta do Dia 🃏</Text>
      <Text style={styles.subtitulo}>
        {escolhida === null
          ? 'Três cartas, uma mensagem. Respire fundo e escolha a que mais chamar a sua atenção.'
          : 'Essa foi a carta que o destino escolheu para você hoje.'}
      </Text>

      <View style={[styles.mesa, { width: larguraUtil }]}>
        {cartas.map((carta, i) => (
          <Carta
            key={i}
            flip={flips[i]}
            largura={larguraCarta}
            altura={alturaCarta}
            tema={TEMAS[carta.tema]}
            aberta={escolhida === i}
            apagada={escolhida !== null && escolhida !== i}
            desativada={escolhida !== null || carregando}
            onPress={() => escolher(i)}
          />
        ))}
      </View>

      {cartaEscolhida ? (
        <Animated.View style={[styles.resultado, { opacity: aparecer }]}>
          <Text style={[styles.resultadoTema, { color: temaEscolhido.cor }]}>
            {temaEscolhido.emoji} {temaEscolhido.nome}
          </Text>
          <Text style={styles.resultadoFrase}>“{cartaEscolhida.texto}”</Text>
        </Animated.View>
      ) : (
        <Text style={styles.dica}>
          Cada pessoa recebe três cartas diferentes por dia. Qual será a sua sorte hoje?
        </Text>
      )}

      {cartaEscolhida ? (
        <View style={styles.acoes}>
          <Text style={styles.dica}>
            {compartilhada
              ? 'Você já contou para a comunidade qual carta tirou hoje. 💜'
              : 'Que tal contar para a comunidade qual carta o destino escolheu para você?'}
          </Text>

          {!compartilhada ? (
            <TouchableOpacity
              style={[styles.botao, compartilhando && { opacity: 0.6 }]}
              onPress={compartilhar}
              disabled={compartilhando}
            >
              <Text style={styles.botaoTexto}>
                {compartilhando ? 'Compartilhando...' : '💬 Compartilhar no feed'}
              </Text>
            </TouchableOpacity>
          ) : null}

          {aviso ? <Text style={styles.aviso}>{aviso}</Text> : null}

          {compartilhada && onGoFeed ? (
            <TouchableOpacity onPress={onGoFeed}>
              <Text style={styles.link}>Ver no feed →</Text>
            </TouchableOpacity>
          ) : null}

          <Text style={styles.dica}>Volte amanhã para três novas cartas. 🌙</Text>
        </View>
      ) : null}

      <TouchableOpacity onPress={onBack} style={{ marginTop: 25 }}>
        <Text style={styles.link}>← Voltar ao Menu</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#E7EDED',
  },
  conteudo: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 100,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C63A6',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 15,
    color: '#8E8DBE',
    textAlign: 'center',
    marginBottom: 25,
    maxWidth: 380,
  },
  mesa: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  face: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    padding: 6,
  },
  verso: {
    backgroundColor: '#6C63A6',
    borderWidth: 3,
    borderColor: '#B39DDB',
  },
  versoEstrela: {
    color: '#D1C4E9',
    fontSize: 16,
  },
  versoInterrogacao: {
    color: '#fff',
    fontSize: 38,
    fontWeight: 'bold',
    marginVertical: 6,
  },
  frenteEmoji: {
    fontSize: 36,
    marginBottom: 6,
  },
  frenteTema: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultado: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    marginBottom: 15,
  },
  resultadoTema: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultadoFrase: {
    fontSize: 20,
    lineHeight: 28,
    color: '#444',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  acoes: {
    alignItems: 'center',
    maxWidth: 400,
  },
  dica: {
    fontSize: 14,
    color: '#8E8DBE',
    textAlign: 'center',
    marginVertical: 8,
    maxWidth: 380,
  },
  botao: {
    backgroundColor: '#8E8DBE',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 25,
    marginVertical: 8,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  aviso: {
    fontSize: 14,
    color: '#6C63A6',
    marginVertical: 6,
    textAlign: 'center',
  },
  link: {
    color: '#6C63A6',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 6,
  },
});
