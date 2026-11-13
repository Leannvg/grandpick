// Variación de confeti por puesto (misma paleta, distinto ritmo y forma)
export const CONFETTI_BY_RANK = {
    1: {},
    2: { count: 12, seed: 2, speed: 0.7, roundRatio: 0.85 },
    3: { count: 16, seed: 3, speed: 1.3, roundRatio: 0 },
};

// Delay por puesto del brillo en loop (`.podium__shine` en podium.css, CSS
// nativo — mismo motivo que Confetti.jsx). Misma duración de ciclo para los
// tres, así quedan sincronizados y barren en orden 1º → 2º → 3º siempre.
export const SHINE_DELAY_BY_RANK = {
    1: "1.6s",
    2: "2.2s",
    3: "2.8s",
};
