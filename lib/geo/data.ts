// Catálogo oficial normalizado de Barrios y Circuitos de San Miguel de Tucumán

export interface BarrioOption {
  id: number | null;
  nombre: string;
  circuitoElectoral: string;
  distrito: string;
}

export interface CircuitoOption {
  id: number | null;
  numero: string;
}

export const BARRIOS_LIST: BarrioOption[] = [
  {
    "id": 380,
    "nombre": "1° de Julio",
    "circuitoElectoral": "15A",
    "distrito": "Distrito 4"
  },
  {
    "id": 381,
    "nombre": "1° de Mayo (Vicente Haro)",
    "circuitoElectoral": "19",
    "distrito": "Distrito 14"
  },
  {
    "id": 375,
    "nombre": "11 de Enero",
    "circuitoElectoral": "15B",
    "distrito": "Distrito 1"
  },
  {
    "id": 376,
    "nombre": "11 de Febrero",
    "circuitoElectoral": "14 D",
    "distrito": "Distrito 7"
  },
  {
    "id": 377,
    "nombre": "11 de Marzo",
    "circuitoElectoral": "19A",
    "distrito": "Distrito 14"
  },
  {
    "id": 378,
    "nombre": "16 de Junio",
    "circuitoElectoral": "15A",
    "distrito": "Distrito 4"
  },
  {
    "id": 379,
    "nombre": "17 de Agosto",
    "circuitoElectoral": "18E",
    "distrito": "Distrito 13"
  },
  {
    "id": 382,
    "nombre": "2 de Abril",
    "circuitoElectoral": "11A",
    "distrito": "Distrito 11"
  },
  {
    "id": 383,
    "nombre": "2 de Setiembre",
    "circuitoElectoral": "18A",
    "distrito": "Distrito 12"
  },
  {
    "id": 384,
    "nombre": "20 de Junio",
    "circuitoElectoral": "10A",
    "distrito": "Distrito 16"
  },
  {
    "id": 385,
    "nombre": "23 de Febrero",
    "circuitoElectoral": "20",
    "distrito": "Distrito 14"
  },
  {
    "id": 386,
    "nombre": "24 de Setiembre",
    "circuitoElectoral": "18D",
    "distrito": "Distrito 13"
  },
  {
    "id": 387,
    "nombre": "260 Viviendas",
    "circuitoElectoral": "14B",
    "distrito": "Distrito 7"
  },
  {
    "id": 388,
    "nombre": "40 Viviendas",
    "circuitoElectoral": "16A",
    "distrito": "Distrito 1"
  },
  {
    "id": 389,
    "nombre": "72 Viviendas IPVDU",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 17"
  },
  {
    "id": 390,
    "nombre": "76 Viviendas (Ex Refinor)",
    "circuitoElectoral": "9A",
    "distrito": "Distrito 15"
  },
  {
    "id": 391,
    "nombre": "8 de Marzo-Juan Pablo VI",
    "circuitoElectoral": "14",
    "distrito": "Distrito 8"
  },
  {
    "id": 392,
    "nombre": "80 Viviendas",
    "circuitoElectoral": "14B",
    "distrito": "Distrito 7"
  },
  {
    "id": 4,
    "nombre": "A.G.E.T.",
    "circuitoElectoral": "15B",
    "distrito": "Distrito 1"
  },
  {
    "id": 44,
    "nombre": "A.T.E",
    "circuitoElectoral": "18B",
    "distrito": "Distrito 12"
  },
  {
    "id": 45,
    "nombre": "A.T.E.P.",
    "circuitoElectoral": "13A",
    "distrito": "Distrito 5"
  },
  {
    "id": 1,
    "nombre": "Aconquija",
    "circuitoElectoral": "17A",
    "distrito": "Distrito 9"
  },
  {
    "id": 2,
    "nombre": "Aeropuerto",
    "circuitoElectoral": "10",
    "distrito": "Distrito 10"
  },
  {
    "id": 3,
    "nombre": "Agef I y II",
    "circuitoElectoral": "14",
    "distrito": "Distrito 8"
  },
  {
    "id": 5,
    "nombre": "Agrimensores",
    "circuitoElectoral": "17A",
    "distrito": "Distrito 9"
  },
  {
    "id": 6,
    "nombre": "Agua y Energia",
    "circuitoElectoral": "17A",
    "distrito": "Distrito 9"
  },
  {
    "id": 7,
    "nombre": "Aguas Corrientes",
    "circuitoElectoral": "15B",
    "distrito": "Distrito 3"
  },
  {
    "id": 8,
    "nombre": "Alberdi",
    "circuitoElectoral": "10A",
    "distrito": "Distrito 16"
  },
  {
    "id": 9,
    "nombre": "Alberdi norte",
    "circuitoElectoral": "15A",
    "distrito": "Distrito 4"
  },
  {
    "id": 10,
    "nombre": "Alejandro Heredia",
    "circuitoElectoral": "21",
    "distrito": "Distrito 16"
  },
  {
    "id": 11,
    "nombre": "Alperovich I",
    "circuitoElectoral": "18",
    "distrito": "Distrito 9"
  },
  {
    "id": 12,
    "nombre": "Alperovich II",
    "circuitoElectoral": "17A",
    "distrito": "Distrito 9"
  },
  {
    "id": 13,
    "nombre": "Alto la Polvora",
    "circuitoElectoral": "14C",
    "distrito": "Distrito 7"
  },
  {
    "id": 14,
    "nombre": "Altos de America (Sociedad Mejail SACIFIA y M)",
    "circuitoElectoral": "15B",
    "distrito": "Distrito 1"
  },
  {
    "id": 15,
    "nombre": "Alvarez Condarco (Chañaritos)",
    "circuitoElectoral": "20",
    "distrito": "Distrito 14"
  },
  {
    "id": 16,
    "nombre": "America",
    "circuitoElectoral": "13A",
    "distrito": "Distrito 5"
  },
  {
    "id": 17,
    "nombre": "Ampliacion 17 de Agosto",
    "circuitoElectoral": "18E",
    "distrito": "Distrito 13"
  },
  {
    "id": 18,
    "nombre": "Ampliacion 20 de Junio",
    "circuitoElectoral": "10A",
    "distrito": "Distrito 16"
  },
  {
    "id": 354,
    "nombre": "Ampliacion 20 de Junio II",
    "circuitoElectoral": "10A",
    "distrito": "Distrito 16"
  },
  {
    "id": 31,
    "nombre": "Ampliacion Alejandro Heredia",
    "circuitoElectoral": "21",
    "distrito": "Distrito 20"
  },
  {
    "id": 367,
    "nombre": "Ampliacion ATE",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 17"
  },
  {
    "id": 19,
    "nombre": "Ampliacion Ciudadela",
    "circuitoElectoral": "18",
    "distrito": "Distrito 9"
  },
  {
    "id": 353,
    "nombre": "Ampliacion Congreso",
    "circuitoElectoral": "15B",
    "distrito": "Distrito 1"
  },
  {
    "id": 365,
    "nombre": "Ampliacion Don Bosco",
    "circuitoElectoral": "22",
    "distrito": "Distrito 20"
  },
  {
    "id": 20,
    "nombre": "Ampliacion el Grafico",
    "circuitoElectoral": "20",
    "distrito": "Distrito 15"
  },
  {
    "id": 21,
    "nombre": "Ampliacion el Molino",
    "circuitoElectoral": "14C",
    "distrito": "Distrito 7"
  },
  {
    "id": 22,
    "nombre": "Ampliacion el Parque",
    "circuitoElectoral": "11A",
    "distrito": "Distrito 11"
  },
  {
    "id": 23,
    "nombre": "Ampliacion Ex Aeropuerto",
    "circuitoElectoral": "10",
    "distrito": "Distrito 11"
  },
  {
    "id": 288,
    "nombre": "Ampliacion Federal",
    "circuitoElectoral": "22",
    "distrito": "Distrito 20"
  },
  {
    "id": 24,
    "nombre": "Ampliacion Independencia",
    "circuitoElectoral": "22",
    "distrito": "Distrito 20"
  },
  {
    "id": 25,
    "nombre": "Ampliacion Jardin",
    "circuitoElectoral": "16",
    "distrito": "Distrito 9"
  },
  {
    "id": 26,
    "nombre": "Ampliacion Juan XXIII",
    "circuitoElectoral": "15",
    "distrito": "Distrito 4"
  },
  {
    "id": 27,
    "nombre": "Ampliacion Kennedy",
    "circuitoElectoral": "15B",
    "distrito": "Distrito 2"
  },
  {
    "id": 28,
    "nombre": "Ampliación Obispo Colombres",
    "circuitoElectoral": "11A",
    "distrito": "Distrito 11"
  },
  {
    "id": 283,
    "nombre": "Ampliacion Obispo Piedrabuena",
    "circuitoElectoral": "14",
    "distrito": "Distrito 8"
  },
  {
    "id": 29,
    "nombre": "Ampliacion Padilla",
    "circuitoElectoral": "16A",
    "distrito": "Distrito 1"
  },
  {
    "id": 341,
    "nombre": "Ampliacion Policial IV",
    "circuitoElectoral": "21",
    "distrito": "Distrito 18"
  },
  {
    "id": 200,
    "nombre": "Ampliacion San Francisco",
    "circuitoElectoral": "21",
    "distrito": "Distrito 18"
  },
  {
    "id": 30,
    "nombre": "Ampliacion San Jose Obrero",
    "circuitoElectoral": "10A",
    "distrito": "Distrito 16"
  },
  {
    "id": 294,
    "nombre": "Ampliacion San Nicolas",
    "circuitoElectoral": "20",
    "distrito": "Distrito 15"
  },
  {
    "id": 32,
    "nombre": "Ampliacion Sarmiento",
    "circuitoElectoral": "10",
    "distrito": "Distrito 11"
  },
  {
    "id": 33,
    "nombre": "Ampliacion SITRAVI II",
    "circuitoElectoral": "14 D",
    "distrito": "Distrito 7"
  },
  {
    "id": 34,
    "nombre": "Ampliacion SMATA (Iñigo)",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 17"
  },
  {
    "id": 35,
    "nombre": "Ampliacion Tiro Federal",
    "circuitoElectoral": "10",
    "distrito": "Distrito 11"
  },
  {
    "id": 36,
    "nombre": "Ampliacion Victoria",
    "circuitoElectoral": "19",
    "distrito": "Distrito 14"
  },
  {
    "id": 37,
    "nombre": "Ampliacion Villa Alem",
    "circuitoElectoral": "9",
    "distrito": "Distrito 15"
  },
  {
    "id": 325,
    "nombre": "Ampliacion Villa Amalia",
    "circuitoElectoral": "20",
    "distrito": "Distrito 15"
  },
  {
    "id": 342,
    "nombre": "Ampliacion Villa Angelina",
    "circuitoElectoral": "21",
    "distrito": "Distrito 19"
  },
  {
    "id": 38,
    "nombre": "Ampliacion Villa Muñecas",
    "circuitoElectoral": "15B",
    "distrito": "Distrito 2"
  },
  {
    "id": 301,
    "nombre": "Ampliacion Villa San Jorge",
    "circuitoElectoral": "14B",
    "distrito": "Distrito 7"
  },
  {
    "id": 40,
    "nombre": "Arturo Illia I",
    "circuitoElectoral": "14",
    "distrito": "Distrito 8"
  },
  {
    "id": 41,
    "nombre": "Arturo Illia II",
    "circuitoElectoral": "14",
    "distrito": "Distrito 8"
  },
  {
    "id": 393,
    "nombre": "Asentamiento el Angel",
    "circuitoElectoral": "14B",
    "distrito": "Distrito 7"
  },
  {
    "id": 394,
    "nombre": "Asentamiento Francisco I",
    "circuitoElectoral": "18F",
    "distrito": "Distrito 17"
  },
  {
    "id": 395,
    "nombre": "Asentamiento Francisco I (Ampliación)",
    "circuitoElectoral": "18F",
    "distrito": "Distrito 17"
  },
  {
    "id": 396,
    "nombre": "Asentamiento Margarita",
    "circuitoElectoral": "14C",
    "distrito": "Distrito 7"
  },
  {
    "id": 397,
    "nombre": "Asentamiento Martin Berho",
    "circuitoElectoral": "14 D",
    "distrito": "Distrito 8"
  },
  {
    "id": 398,
    "nombre": "Asentamiento Rosa Mistica",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 17"
  },
  {
    "id": 399,
    "nombre": "Asentamiento San Miguel",
    "circuitoElectoral": "14C",
    "distrito": "Distrito 7"
  },
  {
    "id": 46,
    "nombre": "ATEP II",
    "circuitoElectoral": "18A",
    "distrito": "Distrito 12"
  },
  {
    "id": 400,
    "nombre": "ATSA (Sanidad)",
    "circuitoElectoral": "15",
    "distrito": "Distrito 4"
  },
  {
    "id": 47,
    "nombre": "Autopista sur",
    "circuitoElectoral": "20",
    "distrito": "Distrito 16"
  },
  {
    "id": 48,
    "nombre": "Avenida",
    "circuitoElectoral": "9A",
    "distrito": "Distrito 14"
  },
  {
    "id": 49,
    "nombre": "Bajo Hondo",
    "circuitoElectoral": "17A",
    "distrito": "Distrito 9"
  },
  {
    "id": 50,
    "nombre": "Bajo la Polvora",
    "circuitoElectoral": "14 D",
    "distrito": "Distrito 7"
  },
  {
    "id": 351,
    "nombre": "Barrio IPV",
    "circuitoElectoral": "",
    "distrito": ""
  },
  {
    "id": 51,
    "nombre": "Batalla de Tucuman",
    "circuitoElectoral": "17A",
    "distrito": "Distrito 9"
  },
  {
    "id": 52,
    "nombre": "Belgrano",
    "circuitoElectoral": "18",
    "distrito": "Distrito 9"
  },
  {
    "id": 53,
    "nombre": "Bernabe Araoz",
    "circuitoElectoral": "9A",
    "distrito": "Distrito 14"
  },
  {
    "id": 401,
    "nombre": "Bienestar",
    "circuitoElectoral": "9",
    "distrito": "Distrito 16"
  },
  {
    "id": 160,
    "nombre": "Blas Victorio Conrero",
    "circuitoElectoral": "20",
    "distrito": "Distrito 15"
  },
  {
    "id": 55,
    "nombre": "Blasco II",
    "circuitoElectoral": "22",
    "distrito": "Distrito 20"
  },
  {
    "id": 42,
    "nombre": "Buen Vivir",
    "circuitoElectoral": "21",
    "distrito": "Distrito 18"
  },
  {
    "id": 402,
    "nombre": "Caja Popular",
    "circuitoElectoral": "18B",
    "distrito": "Distrito 12"
  },
  {
    "id": 358,
    "nombre": "Camino del Peru y Belgrano",
    "circuitoElectoral": "17A",
    "distrito": "Distrito 9"
  },
  {
    "id": 348,
    "nombre": "Campo norte",
    "circuitoElectoral": "16",
    "distrito": "Distrito 3"
  },
  {
    "id": 57,
    "nombre": "Canal norte I",
    "circuitoElectoral": "12A",
    "distrito": "Distrito 6"
  },
  {
    "id": 58,
    "nombre": "Canal norte II",
    "circuitoElectoral": "13A",
    "distrito": "Distrito 5"
  },
  {
    "id": 59,
    "nombre": "Canal norte III",
    "circuitoElectoral": "14A",
    "distrito": "Distrito 7"
  },
  {
    "id": 60,
    "nombre": "Capitan Giachino",
    "circuitoElectoral": "20",
    "distrito": "Distrito 15"
  },
  {
    "id": 61,
    "nombre": "Capitan Viola",
    "circuitoElectoral": "20",
    "distrito": "Distrito 15"
  },
  {
    "id": 62,
    "nombre": "Cardenal Samore",
    "circuitoElectoral": "18C",
    "distrito": "Distrito 13"
  },
  {
    "id": 63,
    "nombre": "Caritas Provivienda del Arzobispado de Tucuman",
    "circuitoElectoral": "14",
    "distrito": "Distrito 8"
  },
  {
    "id": 64,
    "nombre": "Cartoneros",
    "circuitoElectoral": "11A",
    "distrito": "Distrito 11"
  },
  {
    "id": 65,
    "nombre": "Castillo",
    "circuitoElectoral": "14A",
    "distrito": "Distrito 7"
  },
  {
    "id": 349,
    "nombre": "Cementerio norte",
    "circuitoElectoral": "14C",
    "distrito": "Distrito 7"
  },
  {
    "id": 366,
    "nombre": "Central Térmica Independencia",
    "circuitoElectoral": "21",
    "distrito": "Distrito 19"
  },
  {
    "id": 350,
    "nombre": "cerveceria y malteria Quilmes",
    "circuitoElectoral": "",
    "distrito": ""
  },
  {
    "id": 266,
    "nombre": "CGT",
    "circuitoElectoral": "22",
    "distrito": "Distrito 20"
  },
  {
    "id": 360,
    "nombre": "Chango Mas",
    "circuitoElectoral": "16A",
    "distrito": "Distrito 1"
  },
  {
    "id": 66,
    "nombre": "Christie",
    "circuitoElectoral": "12A",
    "distrito": "Distrito 6"
  },
  {
    "id": 272,
    "nombre": "Ciudad de Dios (128 Viviendas)",
    "circuitoElectoral": "15",
    "distrito": "Distrito 4"
  },
  {
    "id": 67,
    "nombre": "Ciudad Jardin",
    "circuitoElectoral": "18E",
    "distrito": "Distrito 13"
  },
  {
    "id": 68,
    "nombre": "Ciudad Parque",
    "circuitoElectoral": "17A",
    "distrito": "Distrito 9"
  },
  {
    "id": 69,
    "nombre": "Ciudadela",
    "circuitoElectoral": "8A",
    "distrito": "Distrito 10"
  },
  {
    "id": 70,
    "nombre": "Ciudadela sur",
    "circuitoElectoral": "19",
    "distrito": "Distrito 14"
  },
  {
    "id": 71,
    "nombre": "Congreso",
    "circuitoElectoral": "15B",
    "distrito": "Distrito 1"
  },
  {
    "id": 72,
    "nombre": "Coofaral (Farmaceutico)",
    "circuitoElectoral": "15B",
    "distrito": "Distrito 1"
  },
  {
    "id": 74,
    "nombre": "Coop. Gümes (La Merced)",
    "circuitoElectoral": "16A",
    "distrito": "Distrito 1"
  },
  {
    "id": 73,
    "nombre": "Cooperativa 19 de Marzo",
    "circuitoElectoral": "10A",
    "distrito": "Distrito 16"
  },
  {
    "id": 75,
    "nombre": "COPERGET",
    "circuitoElectoral": "15B",
    "distrito": "Distrito 1"
  },
  {
    "id": 296,
    "nombre": "COPERGET II",
    "circuitoElectoral": "15B",
    "distrito": "Distrito 1"
  },
  {
    "id": 76,
    "nombre": "COPIAAT I",
    "circuitoElectoral": "14",
    "distrito": "Distrito 8"
  },
  {
    "id": 77,
    "nombre": "COPIAT II",
    "circuitoElectoral": "19",
    "distrito": "Distrito 14"
  },
  {
    "id": 78,
    "nombre": "Costanera norte",
    "circuitoElectoral": "11A",
    "distrito": "Distrito 11"
  },
  {
    "id": 39,
    "nombre": "Crucero Ara General Belgrano",
    "circuitoElectoral": "21",
    "distrito": "Distrito 19"
  },
  {
    "id": 79,
    "nombre": "Crucero General Belgrano",
    "circuitoElectoral": "10A",
    "distrito": "Distrito 16"
  },
  {
    "id": 372,
    "nombre": "Deposito Chañaritos",
    "circuitoElectoral": "21",
    "distrito": "Distrito 14"
  },
  {
    "id": 80,
    "nombre": "Diego de Villarroel",
    "circuitoElectoral": "10A",
    "distrito": "Distrito 16"
  },
  {
    "id": 81,
    "nombre": "Don Bosco",
    "circuitoElectoral": "7A",
    "distrito": "Distrito 10"
  },
  {
    "id": 82,
    "nombre": "Echeverria",
    "circuitoElectoral": "15B",
    "distrito": "Distrito 3"
  },
  {
    "id": 83,
    "nombre": "Egeo",
    "circuitoElectoral": "20",
    "distrito": "Distrito 15"
  },
  {
    "id": 84,
    "nombre": "Ejercito Argentino",
    "circuitoElectoral": "18E",
    "distrito": "Distrito 13"
  },
  {
    "id": 85,
    "nombre": "El Bajo",
    "circuitoElectoral": "10",
    "distrito": "Distrito 10"
  },
  {
    "id": 86,
    "nombre": "El Bosque",
    "circuitoElectoral": "15",
    "distrito": "Distrito 4"
  },
  {
    "id": 253,
    "nombre": "El Chivero",
    "circuitoElectoral": "13",
    "distrito": "Distrito 5"
  },
  {
    "id": 87,
    "nombre": "El Cruce",
    "circuitoElectoral": "9A",
    "distrito": "Distrito 14"
  },
  {
    "id": 88,
    "nombre": "El Empalme",
    "circuitoElectoral": "15",
    "distrito": "Distrito 4"
  },
  {
    "id": 89,
    "nombre": "El Grafico I",
    "circuitoElectoral": "19A",
    "distrito": "Distrito 14"
  },
  {
    "id": 290,
    "nombre": "El Grafico II",
    "circuitoElectoral": "18E",
    "distrito": "Distrito 13"
  },
  {
    "id": 91,
    "nombre": "El Manantial (Cooperativa 2 de Abril)",
    "circuitoElectoral": "18B",
    "distrito": "Distrito 12"
  },
  {
    "id": 92,
    "nombre": "El Manantial I",
    "circuitoElectoral": "18F",
    "distrito": "Distrito 17"
  },
  {
    "id": 403,
    "nombre": "El Manantial I (Ampliacion)",
    "circuitoElectoral": "18F",
    "distrito": "Distrito 17"
  },
  {
    "id": 93,
    "nombre": "El Manantial II",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 17"
  },
  {
    "id": 90,
    "nombre": "El Manantial II (76 Viviendas)",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 17"
  },
  {
    "id": 94,
    "nombre": "El Molino",
    "circuitoElectoral": "14C",
    "distrito": "Distrito 7"
  },
  {
    "id": 95,
    "nombre": "El Parque",
    "circuitoElectoral": "11A",
    "distrito": "Distrito 11"
  },
  {
    "id": 96,
    "nombre": "El Trebol",
    "circuitoElectoral": "11A",
    "distrito": "Distrito 11"
  },
  {
    "id": 97,
    "nombre": "Elena White",
    "circuitoElectoral": "18F",
    "distrito": "Distrito 17"
  },
  {
    "id": 98,
    "nombre": "Estacion 24 de Setiembre",
    "circuitoElectoral": "18D",
    "distrito": "Distrito 13"
  },
  {
    "id": 99,
    "nombre": "Eucaliptus",
    "circuitoElectoral": "10",
    "distrito": "Distrito 11"
  },
  {
    "id": 100,
    "nombre": "Eudoro Araoz",
    "circuitoElectoral": "17",
    "distrito": "Distrito 9"
  },
  {
    "id": 101,
    "nombre": "Evangelina Salazar",
    "circuitoElectoral": "18E",
    "distrito": "Distrito 13"
  },
  {
    "id": 102,
    "nombre": "Ex Aeropuerto",
    "circuitoElectoral": "10A",
    "distrito": "Distrito 16"
  },
  {
    "id": 104,
    "nombre": "Federal",
    "circuitoElectoral": "22",
    "distrito": "Distrito 20"
  },
  {
    "id": 404,
    "nombre": "Fedevilla I",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 17"
  },
  {
    "id": 405,
    "nombre": "Fedevilla II",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 17"
  },
  {
    "id": 406,
    "nombre": "Fedevilla III",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 17"
  },
  {
    "id": 407,
    "nombre": "Fedevilla IV",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 17"
  },
  {
    "id": 408,
    "nombre": "Fedevilla V",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 17"
  },
  {
    "id": 105,
    "nombre": "FEPUT",
    "circuitoElectoral": "15B",
    "distrito": "Distrito 2"
  },
  {
    "id": 106,
    "nombre": "Ferroviario",
    "circuitoElectoral": "17A",
    "distrito": "Distrito 9"
  },
  {
    "id": 107,
    "nombre": "Floresta",
    "circuitoElectoral": "18",
    "distrito": "Distrito 9"
  },
  {
    "id": 108,
    "nombre": "FOECYT",
    "circuitoElectoral": "17A",
    "distrito": "Distrito 9"
  },
  {
    "id": 109,
    "nombre": "Francisco de Aguirre",
    "circuitoElectoral": "15A",
    "distrito": "Distrito 4"
  },
  {
    "id": 369,
    "nombre": "GARS.A.",
    "circuitoElectoral": "14",
    "distrito": "Distrito 8"
  },
  {
    "id": 110,
    "nombre": "Gente de Prensa",
    "circuitoElectoral": "18",
    "distrito": "Distrito 9"
  },
  {
    "id": 111,
    "nombre": "Guemes",
    "circuitoElectoral": "17",
    "distrito": "Distrito 9"
  },
  {
    "id": 112,
    "nombre": "Hipodromo",
    "circuitoElectoral": "10",
    "distrito": "Distrito 11"
  },
  {
    "id": 371,
    "nombre": "Hormeco",
    "circuitoElectoral": "22",
    "distrito": "Distrito 20"
  },
  {
    "id": 113,
    "nombre": "Independencia I",
    "circuitoElectoral": "18C",
    "distrito": "Distrito 13"
  },
  {
    "id": 114,
    "nombre": "Independencia II",
    "circuitoElectoral": "22",
    "distrito": "Distrito 20"
  },
  {
    "id": 115,
    "nombre": "Ingema",
    "circuitoElectoral": "16",
    "distrito": "Distrito 9"
  },
  {
    "id": 116,
    "nombre": "Irigoyen (Diza)",
    "circuitoElectoral": "20",
    "distrito": "Distrito 15"
  },
  {
    "id": 117,
    "nombre": "Jardin",
    "circuitoElectoral": "16",
    "distrito": "Distrito 3"
  },
  {
    "id": 118,
    "nombre": "Jorge Luis Borges",
    "circuitoElectoral": "19",
    "distrito": "Distrito 14"
  },
  {
    "id": 119,
    "nombre": "Jose Hernandez",
    "circuitoElectoral": "21",
    "distrito": "Distrito 19"
  },
  {
    "id": 346,
    "nombre": "Juan B Justo",
    "circuitoElectoral": "14A",
    "distrito": "Distrito 7"
  },
  {
    "id": 120,
    "nombre": "Juan B. Teran",
    "circuitoElectoral": "19",
    "distrito": "Distrito 14"
  },
  {
    "id": 151,
    "nombre": "Juan F. Nougués",
    "circuitoElectoral": "18C",
    "distrito": "Distrito 13"
  },
  {
    "id": 121,
    "nombre": "Juan Pablo I",
    "circuitoElectoral": "10A",
    "distrito": "Distrito 16"
  },
  {
    "id": 122,
    "nombre": "Juan Pablo II",
    "circuitoElectoral": "15",
    "distrito": "Distrito 4"
  },
  {
    "id": 123,
    "nombre": "Juan XXIII",
    "circuitoElectoral": "15",
    "distrito": "Distrito 4"
  },
  {
    "id": 124,
    "nombre": "Judicial",
    "circuitoElectoral": "20",
    "distrito": "Distrito 15"
  },
  {
    "id": 125,
    "nombre": "Kennedy",
    "circuitoElectoral": "16",
    "distrito": "Distrito 2"
  },
  {
    "id": 126,
    "nombre": "La Cancha",
    "circuitoElectoral": "14",
    "distrito": "Distrito 8"
  },
  {
    "id": 127,
    "nombre": "La Canchita",
    "circuitoElectoral": "21",
    "distrito": "Distrito 19"
  },
  {
    "id": 128,
    "nombre": "La Mago",
    "circuitoElectoral": "18",
    "distrito": "Distrito 9"
  },
  {
    "id": 129,
    "nombre": "La Merced",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 17"
  },
  {
    "id": 130,
    "nombre": "La Porteña",
    "circuitoElectoral": "15B",
    "distrito": "Distrito 3"
  },
  {
    "id": 131,
    "nombre": "Lapacho sur",
    "circuitoElectoral": "22",
    "distrito": "Distrito 20"
  },
  {
    "id": 132,
    "nombre": "Las Américas",
    "circuitoElectoral": "16A",
    "distrito": "Distrito 1"
  },
  {
    "id": 133,
    "nombre": "Las Palmeras III",
    "circuitoElectoral": "22",
    "distrito": "Distrito 20"
  },
  {
    "id": 134,
    "nombre": "Las Piedritas",
    "circuitoElectoral": "10A",
    "distrito": "Distrito 16"
  },
  {
    "id": 135,
    "nombre": "Las Rosas",
    "circuitoElectoral": "15A",
    "distrito": "Distrito 4"
  },
  {
    "id": 54,
    "nombre": "Las Rosas del sur (360 Viv)",
    "circuitoElectoral": "22",
    "distrito": "Distrito 20"
  },
  {
    "id": 370,
    "nombre": "Lawn Tennis Club",
    "circuitoElectoral": "14 D",
    "distrito": "Distrito 7"
  },
  {
    "id": 308,
    "nombre": "Libertad",
    "circuitoElectoral": "15B",
    "distrito": "Distrito 1"
  },
  {
    "id": 136,
    "nombre": "Lincoln",
    "circuitoElectoral": "18C",
    "distrito": "Distrito 13"
  },
  {
    "id": 137,
    "nombre": "Lola Mora I",
    "circuitoElectoral": "10",
    "distrito": "Distrito 11"
  },
  {
    "id": 138,
    "nombre": "Lola Mora II",
    "circuitoElectoral": "17A",
    "distrito": "Distrito 9"
  },
  {
    "id": 139,
    "nombre": "Lopez y Planes",
    "circuitoElectoral": "14",
    "distrito": "Distrito 8"
  },
  {
    "id": 140,
    "nombre": "Los Alamos",
    "circuitoElectoral": "18",
    "distrito": "Distrito 9"
  },
  {
    "id": 141,
    "nombre": "Los Andes",
    "circuitoElectoral": "15A",
    "distrito": "Distrito 4"
  },
  {
    "id": 292,
    "nombre": "Los Chañaritos",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 18"
  },
  {
    "id": 142,
    "nombre": "Los Lapachos I",
    "circuitoElectoral": "17A",
    "distrito": "Distrito 9"
  },
  {
    "id": 143,
    "nombre": "Los Lapachos II",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 18"
  },
  {
    "id": 144,
    "nombre": "Los Pinos",
    "circuitoElectoral": "12A",
    "distrito": "Distrito 5"
  },
  {
    "id": 145,
    "nombre": "Los Platanos",
    "circuitoElectoral": "18B",
    "distrito": "Distrito 12"
  },
  {
    "id": 146,
    "nombre": "Los Tarcos II",
    "circuitoElectoral": "15B",
    "distrito": "Distrito 1"
  },
  {
    "id": 147,
    "nombre": "Los Vazquez I",
    "circuitoElectoral": "20",
    "distrito": "Distrito 14"
  },
  {
    "id": 148,
    "nombre": "Los Vazquez II",
    "circuitoElectoral": "21",
    "distrito": "Distrito 16"
  },
  {
    "id": 149,
    "nombre": "Loteo las Americas",
    "circuitoElectoral": "16A",
    "distrito": "Distrito 1"
  },
  {
    "id": 300,
    "nombre": "Loteo Pita",
    "circuitoElectoral": "14",
    "distrito": "Distrito 8"
  },
  {
    "id": 150,
    "nombre": "Lucas Cordoba",
    "circuitoElectoral": "15",
    "distrito": "Distrito 4"
  },
  {
    "id": 363,
    "nombre": "Makro",
    "circuitoElectoral": "18A",
    "distrito": "Distrito 12"
  },
  {
    "id": 338,
    "nombre": "Manantial IV",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 17"
  },
  {
    "id": 293,
    "nombre": "Manantial sur",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 18"
  },
  {
    "id": 152,
    "nombre": "Mataderos",
    "circuitoElectoral": "14",
    "distrito": "Distrito 8"
  },
  {
    "id": 153,
    "nombre": "Mercantil",
    "circuitoElectoral": "17",
    "distrito": "Distrito 9"
  },
  {
    "id": 355,
    "nombre": "Mercofrut",
    "circuitoElectoral": "20",
    "distrito": "Distrito 16"
  },
  {
    "id": 154,
    "nombre": "Microcentro",
    "circuitoElectoral": "1A",
    "distrito": "Distrito 10"
  },
  {
    "id": 155,
    "nombre": "Miguel Lillo",
    "circuitoElectoral": "21",
    "distrito": "Distrito 20"
  },
  {
    "id": 156,
    "nombre": "Miguel Lillo II (Ampliacion Miguel Lillo)",
    "circuitoElectoral": "21",
    "distrito": "Distrito 18"
  },
  {
    "id": 157,
    "nombre": "Miguel Lillo III",
    "circuitoElectoral": "21",
    "distrito": "Distrito 18"
  },
  {
    "id": 158,
    "nombre": "Minetti",
    "circuitoElectoral": "14",
    "distrito": "Distrito 8"
  },
  {
    "id": 159,
    "nombre": "Modelo",
    "circuitoElectoral": "16",
    "distrito": "Distrito 2"
  },
  {
    "id": 161,
    "nombre": "Municipal",
    "circuitoElectoral": "18C",
    "distrito": "Distrito 13"
  },
  {
    "id": 162,
    "nombre": "Murga",
    "circuitoElectoral": "14C",
    "distrito": "Distrito 7"
  },
  {
    "id": 163,
    "nombre": "Mutual Provincial",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 17"
  },
  {
    "id": 295,
    "nombre": "Nestor Kirchner I",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 18"
  },
  {
    "id": 164,
    "nombre": "Nestor Kirchner II",
    "circuitoElectoral": "21",
    "distrito": "Distrito 20"
  },
  {
    "id": 165,
    "nombre": "NORGAS",
    "circuitoElectoral": "9A",
    "distrito": "Distrito 14"
  },
  {
    "id": 166,
    "nombre": "Norte",
    "circuitoElectoral": "6",
    "distrito": "Distrito 10"
  },
  {
    "id": 289,
    "nombre": "Nueva Esperanza",
    "circuitoElectoral": "22",
    "distrito": "Distrito 20"
  },
  {
    "id": 343,
    "nombre": "Nueva Esperanza II (2 de Abril)",
    "circuitoElectoral": "22",
    "distrito": "Distrito 20"
  },
  {
    "id": 167,
    "nombre": "Nueva Vida",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 17"
  },
  {
    "id": 168,
    "nombre": "Nuevo Horizonte",
    "circuitoElectoral": "11A",
    "distrito": "Distrito 11"
  },
  {
    "id": 170,
    "nombre": "O' Connor",
    "circuitoElectoral": "16A",
    "distrito": "Distrito 1"
  },
  {
    "id": 347,
    "nombre": "Obarrio",
    "circuitoElectoral": "15",
    "distrito": "Distrito 4"
  },
  {
    "id": 169,
    "nombre": "Obispo Colombres",
    "circuitoElectoral": "11A",
    "distrito": "Distrito 11"
  },
  {
    "id": 171,
    "nombre": "Obispo Piedrabuena",
    "circuitoElectoral": "14",
    "distrito": "Distrito 8"
  },
  {
    "id": 172,
    "nombre": "Obrero Municipal",
    "circuitoElectoral": "14 D",
    "distrito": "Distrito 8"
  },
  {
    "id": 173,
    "nombre": "Oeste I",
    "circuitoElectoral": "16A",
    "distrito": "Distrito 1"
  },
  {
    "id": 174,
    "nombre": "Oeste II",
    "circuitoElectoral": "16A",
    "distrito": "Distrito 1"
  },
  {
    "id": 175,
    "nombre": "Ojo de Agua",
    "circuitoElectoral": "17A",
    "distrito": "Distrito 9"
  },
  {
    "id": 344,
    "nombre": "Ojo de Agua D12",
    "circuitoElectoral": "18A",
    "distrito": "Distrito 12"
  },
  {
    "id": 176,
    "nombre": "Olleros",
    "circuitoElectoral": "20",
    "distrito": "Distrito 15"
  },
  {
    "id": 177,
    "nombre": "Padilla",
    "circuitoElectoral": "16A",
    "distrito": "Distrito 9"
  },
  {
    "id": 178,
    "nombre": "Padre Monti",
    "circuitoElectoral": "10",
    "distrito": "Distrito 11"
  },
  {
    "id": 179,
    "nombre": "Parodi",
    "circuitoElectoral": "21",
    "distrito": "Distrito 19"
  },
  {
    "id": 350,
    "nombre": "Parque 9 de Julio",
    "circuitoElectoral": "11A",
    "distrito": "Distrito 11"
  },
  {
    "id": 352,
    "nombre": "Parque 9 de Julio Hipodromo",
    "circuitoElectoral": "10",
    "distrito": "Distrito 11"
  },
  {
    "id": 351,
    "nombre": "Parque 9 de Julio sur",
    "circuitoElectoral": "10",
    "distrito": "Distrito 11"
  },
  {
    "id": 180,
    "nombre": "Parque Centenario",
    "circuitoElectoral": "14",
    "distrito": "Distrito 8"
  },
  {
    "id": 409,
    "nombre": "Parque Guillermina",
    "circuitoElectoral": "17A",
    "distrito": "Distrito 9"
  },
  {
    "id": 182,
    "nombre": "Parque Guillermina (Oeste)",
    "circuitoElectoral": "17A",
    "distrito": "Distrito 9"
  },
  {
    "id": 103,
    "nombre": "Parque sur (Falivene)",
    "circuitoElectoral": "22",
    "distrito": "Distrito 20"
  },
  {
    "id": 410,
    "nombre": "Patria",
    "circuitoElectoral": "10",
    "distrito": "Distrito 11"
  },
  {
    "id": 411,
    "nombre": "Plazoleta Mitre",
    "circuitoElectoral": "13",
    "distrito": "Distrito 4"
  },
  {
    "id": 412,
    "nombre": "Policial",
    "circuitoElectoral": "18B",
    "distrito": "Distrito 12"
  },
  {
    "id": 413,
    "nombre": "Policial I",
    "circuitoElectoral": "12A",
    "distrito": "Distrito 6"
  },
  {
    "id": 414,
    "nombre": "Policial IV",
    "circuitoElectoral": "21",
    "distrito": "Distrito 18"
  },
  {
    "id": 415,
    "nombre": "Presidente Peron",
    "circuitoElectoral": "18B",
    "distrito": "Distrito 12"
  },
  {
    "id": 416,
    "nombre": "Presidente Peron (Vera)",
    "circuitoElectoral": "20",
    "distrito": "Distrito 14"
  },
  {
    "id": 417,
    "nombre": "Puerto Darwin",
    "circuitoElectoral": "20",
    "distrito": "Distrito 16"
  },
  {
    "id": 356,
    "nombre": "Quinta Agronomica",
    "circuitoElectoral": "19",
    "distrito": "Distrito 14"
  },
  {
    "id": 364,
    "nombre": "Roca-Canal sur",
    "circuitoElectoral": "18B",
    "distrito": "Distrito 12"
  },
  {
    "id": 418,
    "nombre": "Rosa Mistica",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 17"
  },
  {
    "id": 419,
    "nombre": "Rosello",
    "circuitoElectoral": "11A",
    "distrito": "Distrito 11"
  },
  {
    "id": 420,
    "nombre": "S.E.O.C.",
    "circuitoElectoral": "18E",
    "distrito": "Distrito 13"
  },
  {
    "id": 421,
    "nombre": "S.M.A.T.A. II",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 17"
  },
  {
    "id": 422,
    "nombre": "S.M.A.T.A. III",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 17"
  },
  {
    "id": 423,
    "nombre": "San Agustin",
    "circuitoElectoral": "15A",
    "distrito": "Distrito 4"
  },
  {
    "id": 424,
    "nombre": "San Alberto",
    "circuitoElectoral": "21",
    "distrito": "Distrito 19"
  },
  {
    "id": 425,
    "nombre": "San Anibal",
    "circuitoElectoral": "19A",
    "distrito": "Distrito 14"
  },
  {
    "id": 426,
    "nombre": "San Bernardo",
    "circuitoElectoral": "18",
    "distrito": "Distrito 9"
  },
  {
    "id": 427,
    "nombre": "San Carlos",
    "circuitoElectoral": "18",
    "distrito": "Distrito 9"
  },
  {
    "id": 428,
    "nombre": "San Cayetano norte",
    "circuitoElectoral": "10A",
    "distrito": "Distrito 16"
  },
  {
    "id": 429,
    "nombre": "San Cayetano sur",
    "circuitoElectoral": "10A",
    "distrito": "Distrito 16"
  },
  {
    "id": 430,
    "nombre": "San Cristobal",
    "circuitoElectoral": "18E",
    "distrito": "Distrito 13"
  },
  {
    "id": 431,
    "nombre": "San Fernando",
    "circuitoElectoral": "19A",
    "distrito": "Distrito 14"
  },
  {
    "id": 432,
    "nombre": "San Francisco",
    "circuitoElectoral": "18B",
    "distrito": "Distrito 12"
  },
  {
    "id": 433,
    "nombre": "San Gabriel",
    "circuitoElectoral": "18F",
    "distrito": "Distrito 17"
  },
  {
    "id": 435,
    "nombre": "San Jose (Norte)",
    "circuitoElectoral": "16A",
    "distrito": "Distrito 1"
  },
  {
    "id": 434,
    "nombre": "San Jose (Sur)",
    "circuitoElectoral": "18",
    "distrito": "Distrito 9"
  },
  {
    "id": 436,
    "nombre": "San Jose Obrero",
    "circuitoElectoral": "20",
    "distrito": "Distrito 16"
  },
  {
    "id": 437,
    "nombre": "San Juan Bautista",
    "circuitoElectoral": "18E",
    "distrito": "Distrito 13"
  },
  {
    "id": 438,
    "nombre": "San Justo",
    "circuitoElectoral": "20",
    "distrito": "Distrito 15"
  },
  {
    "id": 439,
    "nombre": "San Luis",
    "circuitoElectoral": "14B",
    "distrito": "Distrito 7"
  },
  {
    "id": 440,
    "nombre": "San Marco",
    "circuitoElectoral": "10",
    "distrito": "Distrito 11"
  },
  {
    "id": 441,
    "nombre": "San Martin (Este)",
    "circuitoElectoral": "10",
    "distrito": "Distrito 11"
  },
  {
    "id": 442,
    "nombre": "San Martin (Oeste)",
    "circuitoElectoral": "18A",
    "distrito": "Distrito 12"
  },
  {
    "id": 443,
    "nombre": "San Martin de Porres",
    "circuitoElectoral": "17",
    "distrito": "Distrito 9"
  },
  {
    "id": 444,
    "nombre": "San Mateo",
    "circuitoElectoral": "18C",
    "distrito": "Distrito 13"
  },
  {
    "id": 446,
    "nombre": "San Miguel (Este)",
    "circuitoElectoral": "10",
    "distrito": "Distrito 11"
  },
  {
    "id": 445,
    "nombre": "San Miguel (Oeste)",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 17"
  },
  {
    "id": 447,
    "nombre": "San Miguel I",
    "circuitoElectoral": "10",
    "distrito": "Distrito 11"
  },
  {
    "id": 448,
    "nombre": "San Nicolas",
    "circuitoElectoral": "20",
    "distrito": "Distrito 15"
  },
  {
    "id": 449,
    "nombre": "San Rafael",
    "circuitoElectoral": "15B",
    "distrito": "Distrito 3"
  },
  {
    "id": 450,
    "nombre": "San Ramon",
    "circuitoElectoral": "14B",
    "distrito": "Distrito 7"
  },
  {
    "id": 451,
    "nombre": "San Ramon Nonato",
    "circuitoElectoral": "21",
    "distrito": "Distrito 20"
  },
  {
    "id": 452,
    "nombre": "San Roque I",
    "circuitoElectoral": "14C",
    "distrito": "Distrito 7"
  },
  {
    "id": 453,
    "nombre": "San Roque II",
    "circuitoElectoral": "14B",
    "distrito": "Distrito 7"
  },
  {
    "id": 345,
    "nombre": "San Roque oeste",
    "circuitoElectoral": "15A",
    "distrito": "Distrito 4"
  },
  {
    "id": 454,
    "nombre": "Santa Ana",
    "circuitoElectoral": "18C",
    "distrito": "Distrito 13"
  },
  {
    "id": 455,
    "nombre": "Santa Elena",
    "circuitoElectoral": "19A",
    "distrito": "Distrito 14"
  },
  {
    "id": 456,
    "nombre": "Santa Marta",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 17"
  },
  {
    "id": 457,
    "nombre": "Santa Rita",
    "circuitoElectoral": "19",
    "distrito": "Distrito 14"
  },
  {
    "id": 458,
    "nombre": "Santa Rosa de Lima",
    "circuitoElectoral": "14",
    "distrito": "Distrito 8"
  },
  {
    "id": 459,
    "nombre": "Santo Tomas Apostol",
    "circuitoElectoral": "18",
    "distrito": "Distrito 9"
  },
  {
    "id": 460,
    "nombre": "Sargento Lai",
    "circuitoElectoral": "20",
    "distrito": "Distrito 15"
  },
  {
    "id": 461,
    "nombre": "Sarmiento",
    "circuitoElectoral": "10",
    "distrito": "Distrito 11"
  },
  {
    "id": 462,
    "nombre": "SEOC-Sindicato de Empleados y Obreros del Comercio (Palmeras II)",
    "circuitoElectoral": "21",
    "distrito": "Distrito 19"
  },
  {
    "id": 463,
    "nombre": "SEOC-Sindicato Empleados y Obreros del Comercio",
    "circuitoElectoral": "14C",
    "distrito": "Distrito 7"
  },
  {
    "id": 464,
    "nombre": "SITRAVI I",
    "circuitoElectoral": "14 D",
    "distrito": "Distrito 7"
  },
  {
    "id": 465,
    "nombre": "SITRAVI II",
    "circuitoElectoral": "17",
    "distrito": "Distrito 9"
  },
  {
    "id": 466,
    "nombre": "SMATA",
    "circuitoElectoral": "18A",
    "distrito": "Distrito 12"
  },
  {
    "id": 467,
    "nombre": "Soldado Guanca",
    "circuitoElectoral": "20",
    "distrito": "Distrito 15"
  },
  {
    "id": 468,
    "nombre": "Sur",
    "circuitoElectoral": "4",
    "distrito": "Distrito 10"
  },
  {
    "id": 469,
    "nombre": "SUTIAGA",
    "circuitoElectoral": "19A",
    "distrito": "Distrito 14"
  },
  {
    "id": 470,
    "nombre": "Telefonico",
    "circuitoElectoral": "14B",
    "distrito": "Distrito 7"
  },
  {
    "id": 471,
    "nombre": "Telefonicos III",
    "circuitoElectoral": "16A",
    "distrito": "Distrito 1"
  },
  {
    "id": 472,
    "nombre": "Tiro Federal",
    "circuitoElectoral": "10",
    "distrito": "Distrito 11"
  },
  {
    "id": 473,
    "nombre": "Toledo",
    "circuitoElectoral": "20",
    "distrito": "Distrito 16"
  },
  {
    "id": 474,
    "nombre": "Torres 25 de Mayo",
    "circuitoElectoral": "12",
    "distrito": "Distrito 6"
  },
  {
    "id": 475,
    "nombre": "Torres Casino",
    "circuitoElectoral": "17",
    "distrito": "Distrito 9"
  },
  {
    "id": 361,
    "nombre": "Universitario Rugby Club",
    "circuitoElectoral": "18A",
    "distrito": "Distrito 12"
  },
  {
    "id": 476,
    "nombre": "Vial (Este)",
    "circuitoElectoral": "15A",
    "distrito": "Distrito 4"
  },
  {
    "id": 477,
    "nombre": "Vial (Oeste)",
    "circuitoElectoral": "15B",
    "distrito": "Distrito 1"
  },
  {
    "id": 43,
    "nombre": "Vial III-Asociacion Mutual de Vialidad",
    "circuitoElectoral": "18G",
    "distrito": "Distrito 17"
  },
  {
    "id": 478,
    "nombre": "Vialidad",
    "circuitoElectoral": "10A",
    "distrito": "Distrito 16"
  },
  {
    "id": 479,
    "nombre": "Viamonte",
    "circuitoElectoral": "15B",
    "distrito": "Distrito 2"
  },
  {
    "id": 480,
    "nombre": "Vicente Almaraz Diaz",
    "circuitoElectoral": "14 D",
    "distrito": "Distrito 8"
  },
  {
    "id": 481,
    "nombre": "Victoria",
    "circuitoElectoral": "19",
    "distrito": "Distrito 14"
  },
  {
    "id": 482,
    "nombre": "Villa 9 de Julio",
    "circuitoElectoral": "12",
    "distrito": "Distrito 6"
  },
  {
    "id": 483,
    "nombre": "Villa Alem",
    "circuitoElectoral": "9",
    "distrito": "Distrito 15"
  },
  {
    "id": 484,
    "nombre": "Villa Amalia",
    "circuitoElectoral": "20",
    "distrito": "Distrito 15"
  },
  {
    "id": 485,
    "nombre": "Villa Angelina",
    "circuitoElectoral": "21",
    "distrito": "Distrito 19"
  },
  {
    "id": 56,
    "nombre": "Villa Cabildo",
    "circuitoElectoral": "18A",
    "distrito": "Distrito 12"
  },
  {
    "id": 486,
    "nombre": "Villa Lujan",
    "circuitoElectoral": "17",
    "distrito": "Distrito 9"
  },
  {
    "id": 487,
    "nombre": "Villa Marisa",
    "circuitoElectoral": "21",
    "distrito": "Distrito 19"
  },
  {
    "id": 488,
    "nombre": "Villa Martin Berho",
    "circuitoElectoral": "14 D",
    "distrito": "Distrito 8"
  },
  {
    "id": 489,
    "nombre": "Villa Muñecas (Estacion Muñecas - Las Palmeras)",
    "circuitoElectoral": "15B",
    "distrito": "Distrito 2"
  },
  {
    "id": 490,
    "nombre": "Villa San Jorge",
    "circuitoElectoral": "14A",
    "distrito": "Distrito 7"
  },
  {
    "id": 491,
    "nombre": "Villa San Salvador",
    "circuitoElectoral": "20",
    "distrito": "Distrito 16"
  },
  {
    "id": 492,
    "nombre": "Villa Tuquito",
    "circuitoElectoral": "18C",
    "distrito": "Distrito 13"
  },
  {
    "id": 493,
    "nombre": "Villa Urquiza",
    "circuitoElectoral": "13",
    "distrito": "Distrito 5"
  },
  {
    "id": 494,
    "nombre": "Viluco (Las Brisas)",
    "circuitoElectoral": "14",
    "distrito": "Distrito 8"
  },
  {
    "id": 495,
    "nombre": "Y.P.F.",
    "circuitoElectoral": "18C",
    "distrito": "Distrito 13"
  },
  {
    "id": 496,
    "nombre": "Zenon Santillan",
    "circuitoElectoral": "16",
    "distrito": "Distrito 2"
  },
  {
    "id": 352,
    "nombre": "zona lawn tennis",
    "circuitoElectoral": "",
    "distrito": ""
  },
  {
    "id": 354,
    "nombre": "zona parque industrial sur",
    "circuitoElectoral": "",
    "distrito": ""
  },
  {
    "id": 353,
    "nombre": "zona planta san felipe",
    "circuitoElectoral": "",
    "distrito": ""
  }
];

export const CIRCUITOS_LIST: CircuitoOption[] = [
  {
    "id": 19,
    "numero": "1"
  },
  {
    "id": 17,
    "numero": "1A"
  },
  {
    "id": 20,
    "numero": "2"
  },
  {
    "id": 18,
    "numero": "2A"
  },
  {
    "id": 15,
    "numero": "3"
  },
  {
    "id": 16,
    "numero": "4"
  },
  {
    "id": 21,
    "numero": "5"
  },
  {
    "id": 22,
    "numero": "6"
  },
  {
    "id": 30,
    "numero": "7"
  },
  {
    "id": 29,
    "numero": "7A"
  },
  {
    "id": 31,
    "numero": "8"
  },
  {
    "id": 32,
    "numero": "8A"
  },
  {
    "id": 10,
    "numero": "9"
  },
  {
    "id": 11,
    "numero": "9A"
  },
  {
    "id": 8,
    "numero": "10"
  },
  {
    "id": 9,
    "numero": "10A"
  },
  {
    "id": 7,
    "numero": "11"
  },
  {
    "id": 6,
    "numero": "11A"
  },
  {
    "id": 23,
    "numero": "12"
  },
  {
    "id": 25,
    "numero": "12A"
  },
  {
    "id": 24,
    "numero": "13"
  },
  {
    "id": 26,
    "numero": "13A"
  },
  {
    "id": 1,
    "numero": "14"
  },
  {
    "id": 2,
    "numero": "14 D"
  },
  {
    "id": 5,
    "numero": "14A"
  },
  {
    "id": 4,
    "numero": "14B"
  },
  {
    "id": 3,
    "numero": "14C"
  },
  {
    "id": 28,
    "numero": "15"
  },
  {
    "id": 27,
    "numero": "15A"
  },
  {
    "id": 35,
    "numero": "15B"
  },
  {
    "id": 36,
    "numero": "16"
  },
  {
    "id": 37,
    "numero": "16A"
  },
  {
    "id": 39,
    "numero": "17"
  },
  {
    "id": 38,
    "numero": "17A"
  },
  {
    "id": 40,
    "numero": "18"
  },
  {
    "id": 41,
    "numero": "18A"
  },
  {
    "id": 42,
    "numero": "18B"
  },
  {
    "id": 44,
    "numero": "18C"
  },
  {
    "id": 45,
    "numero": "18D"
  },
  {
    "id": 46,
    "numero": "18E"
  },
  {
    "id": 43,
    "numero": "18F"
  },
  {
    "id": 47,
    "numero": "18G"
  },
  {
    "id": 33,
    "numero": "19"
  },
  {
    "id": 34,
    "numero": "19A"
  },
  {
    "id": 12,
    "numero": "20"
  },
  {
    "id": 13,
    "numero": "21"
  },
  {
    "id": 14,
    "numero": "22"
  }
];

export const SMT_CENTER: [number, number] = [-26.832, -65.204]; // [lat, lng]
export const DEFAULT_ZOOM = 13;
