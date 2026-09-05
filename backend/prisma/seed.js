const prisma = require("../src/lib/prisma");

const vinos = [
  {
    nombre: "Confín Andino",
    bodega: "Bodega Confín Andino",
    varietal: "Malbec",
    anada: 2021,
    region: "Gualtallary, Tupungato",
    precio: 24500,
    stock: 36,
    descripcion: "Malbec de altura con crianza en roble francés, exponente de la frescura de Gualtallary.",
    notasCata: "Frutos negros maduros, violetas, especias dulces y un final mineral persistente.",
    maridaje: "Carnes rojas a la parrilla, cordero patagónico y quesos duros.",
    imagenUrl: "/productos/botella-tinta.jpg",
  },
  {
    nombre: "Trece Hileras",
    bodega: "Finca Trece Hileras",
    varietal: "Cabernet Franc",
    anada: 2020,
    region: "Tupungato, Valle de Uco",
    precio: 27800,
    stock: 24,
    descripcion: "Cabernet Franc de parcela única, elegante y con marcada identidad de altura.",
    notasCata: "Pimiento asado, grafito, frutos rojos frescos y taninos sedosos.",
    maridaje: "Pastas rellenas, vegetales asados y quesos de cabra.",
    imagenUrl: "/productos/botella-tinta.jpg",
  },
  {
    nombre: "Última Piedra",
    bodega: "Bodega Última Piedra",
    varietal: "Malbec",
    anada: 2019,
    region: "San Carlos, Valle de Uco",
    precio: 32900,
    stock: 18,
    descripcion: "Malbec de guarda con dos años de crianza, complejo y estructurado.",
    notasCata: "Ciruela negra, cacao, tabaco y notas balsámicas de larga persistencia.",
    maridaje: "Asado de tira, guisos de carne y chocolate amargo.",
    imagenUrl: "/productos/botella-tinta.jpg",
  },
  {
    nombre: "Alma de Uco",
    bodega: "Viña Alma de Uco",
    varietal: "Chardonnay",
    anada: 2022,
    region: "Vista Flores, Valle de Uco",
    precio: 19800,
    stock: 40,
    descripcion: "Chardonnay fermentado en barrica, fresco y con gran mineralidad de altura.",
    notasCata: "Cítricos, manzana verde, notas tostadas sutiles y final salino.",
    maridaje: "Pescados de mar, mariscos y quesos frescos.",
    imagenUrl: "/productos/botella-blanca-1.jpg",
  },
  {
    nombre: "Sendero del Cóndor",
    bodega: "Bodega Sendero del Cóndor",
    varietal: "Pinot Noir",
    anada: 2021,
    region: "Gualtallary, Tupungato",
    precio: 29500,
    stock: 20,
    descripcion: "Pinot Noir delicado, de cuerpo liviano y gran expresión frutal.",
    notasCata: "Cereza, frutilla, notas florales y un paso de boca sedoso.",
    maridaje: "Aves de caza, salmón grillado y quesos blandos.",
    imagenUrl: "/productos/botella-tinta.jpg",
  },
  {
    nombre: "Corazón de Piedra",
    bodega: "Finca Corazón de Piedra",
    varietal: "Cabernet Sauvignon",
    anada: 2020,
    region: "La Consulta, Valle de Uco",
    precio: 26300,
    stock: 30,
    descripcion: "Cabernet Sauvignon robusto, con taninos firmes y gran potencial de guarda.",
    notasCata: "Cassis, pimienta negra, cedro y un final largo y especiado.",
    maridaje: "Carnes rojas maduradas, estofados y quesos añejos.",
    imagenUrl: "/productos/botella-tinta.jpg",
  },
  {
    nombre: "Puerta del Viento",
    bodega: "Bodega Puerta del Viento",
    varietal: "Malbec",
    anada: 2018,
    region: "Los Chacayes, Valle de Uco",
    precio: 38900,
    stock: 12,
    descripcion: "Malbec ícono de la bodega, de viñedos viejos y rendimientos muy bajos.",
    notasCata: "Mora, flores secas, especias orientales y taninos aterciopelados.",
    maridaje: "Cordero al asador, ciervo y platos de autor con carnes rojas.",
    imagenUrl: "/productos/botella-tinta.jpg",
  },
  {
    nombre: "Silencio de Altura",
    bodega: "Viña Silencio de Altura",
    varietal: "Torrontés",
    anada: 2023,
    region: "Tupungato, Valle de Uco",
    precio: 16500,
    stock: 45,
    descripcion: "Torrontés aromático de altura, fresco y con acidez vibrante.",
    notasCata: "Flores blancas, durazno, cítricos y un final seco y frutal.",
    maridaje: "Comida picante, ceviches y entradas de verano.",
    imagenUrl: "/productos/botella-blanca-2.jpg",
  },
];

async function main() {
  await prisma.pedidoItem.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.producto.createMany({ data: vinos });
  console.log(`Seed completo: ${vinos.length} productos cargados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
