export const segments = [
  "Restaurante",
  "Clinica",
  "Servicos locais",
  "Beleza",
  "Imobiliaria",
  "Educacao",
  "Consultoria",
  "Outro",
];

export const palettes = {
  verde: {
    label: "Verde confianca",
    primary: "#0f7b63",
    secondary: "#f4c95d",
    ink: "#12201c",
    surface: "#edf8f4",
  },
  azul: {
    label: "Azul claro",
    primary: "#136f9f",
    secondary: "#ffb84d",
    ink: "#102331",
    surface: "#eef8fc",
  },
  vermelho: {
    label: "Vermelho direto",
    primary: "#b83232",
    secondary: "#f3c969",
    ink: "#2b1717",
    surface: "#fff3f0",
  },
  preto: {
    label: "Preto premium",
    primary: "#161616",
    secondary: "#41c9a9",
    ink: "#111111",
    surface: "#f3f4f2",
  },
} as const;

export const visualStyles = ["Moderno", "Minimalista", "Premium", "Popular"];

export const fallbackImage =
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80";
