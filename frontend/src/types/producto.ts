export type Producto = {
  id: number;
  nombre: string;
  bodega: string;
  varietal: string;
  anada: number;
  region: string;
  precio: string;
  stock: number;
  descripcion: string | null;
  imagenUrl: string | null;
  notasCata: string | null;
  maridaje: string | null;
  createdAt: string;
};
