import { useId, useState } from 'react';

/**
 * Campo de senha com botão de mostrar/ocultar.
 *
 * Digitar senha às cegas no celular é a maior causa de erro de login: a pessoa
 * erra uma letra, não vê, e conclui que a senha está errada. Poder conferir o
 * que digitou resolve — e é por isso que o botão fica DENTRO do campo, onde o
 * polegar já está.
 *
 * Detalhes que fazem diferença:
 *  · o botão é type="button" — dentro de um form, sem isso ele enviaria tudo
 *    ao ser tocado;
 *  · aria-pressed conta o estado a quem usa leitor de tela;
 *  · ao alternar, o foco volta para o campo com o cursor no fim, para a pessoa
 *    continuar digitando de onde parou.
 */
export default function CampoSenha({
  id,
  className = 'pp-input',
  rotulo = 'Senha',
  classeRotulo = 'pp-label',
  // O cockpit usa o prefixo ck-; o app do cliente, pp-. Sem isto o campo
  // herdaria o espaçamento do outro app.
  classeCampo = 'pp-field',
  autoComplete = 'current-password',
  valor,
  aoMudar,
  minLength = 6,
  obrigatorio = true,
  ...resto
}) {
  const gerado = useId();
  const idCampo = id ?? `senha-${gerado}`;
  const [visivel, setVisivel] = useState(false);

  function alternar() {
    setVisivel((v) => !v);
    const campo = document.getElementById(idCampo);
    if (!campo) return;
    campo.focus();
    // Sem isto o cursor pula para o começo ao trocar o type do campo.
    const fim = campo.value.length;
    requestAnimationFrame(() => campo.setSelectionRange(fim, fim));
  }

  return (
    <div className={classeCampo}>
      <label className={classeRotulo} htmlFor={idCampo}>{rotulo}</label>
      <div style={{ position: 'relative' }}>
        <input
          id={idCampo}
          name="password"
          type={visivel ? 'text' : 'password'}
          className={className}
          autoComplete={autoComplete}
          value={valor}
          onChange={aoMudar}
          required={obrigatorio}
          minLength={minLength}
          style={{ paddingRight: 46, width: '100%' }}
          {...resto}
        />
        <button
          type="button"
          onClick={alternar}
          aria-pressed={visivel}
          aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          title={visivel ? 'Ocultar senha' : 'Mostrar senha'}
          style={{
            position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
            width: 40, height: 40, display: 'grid', placeItems: 'center',
            background: 'transparent', border: 0, cursor: 'pointer',
            color: 'var(--pp-fg-3)', borderRadius: 'var(--pp-r-control)',
          }}
        >
          <Olho vaiOcultar={visivel} />
        </button>
      </div>
    </div>
  );
}

/**
 * O ícone representa a AÇÃO, não o estado — igual ao rótulo ao lado dele.
 * Senha oculta → olho inteiro ("toque para ver"). Senha à mostra → olho
 * cortado ("toque para esconder"). O contrário faz a pessoa achar que o
 * botão está desligado.
 */
function Olho({ vaiOcultar }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      {vaiOcultar && <path d="m3 3 18 18" />}
    </svg>
  );
}
