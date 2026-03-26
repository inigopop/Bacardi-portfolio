export interface Cocktail {
  nombre: string;
  nivel: string;
  sabor: string;
  tiempo_minutos: number | null;
  ingredientes: string[];
  imagen: string;
  url?: string;
}
