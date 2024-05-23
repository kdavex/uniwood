import { PrismaClient } from "@prisma/client";
import { getPrismaClient } from "@prisma/client/runtime/library";

export async function getProvinces() {
  const prisma = new PrismaClient();

  const provinceDoc = await prisma.pH_Address.findMany({
    select: {
      province_name: true,
    },
    orderBy: {
      province_name: "asc",
    },
  });

  const provinces = provinceDoc.map((province) => province.province_name);
  prisma.$disconnect();
  return provinces;
}

export async function getMunicipalities(province: string) {
  const prisma = new PrismaClient();

  const municipalityDoc = await prisma.pH_Address.findMany({
    where: {
      province_name: {
        equals: province,
        mode: "insensitive",
      },
    },
    select: {
      municipality_list: true,
    },
    orderBy: {
      province_name: "asc",
    },
  });

  const municipalities = Object.keys(
    municipalityDoc[0].municipality_list as object,
  );
  console.log(municipalities);

  prisma.$disconnect();
  return municipalities;
}

export async function getBarangays(province: string, municipality: string) {
  // parse data
  municipality = municipality.toUpperCase();
  const prisma = new PrismaClient();

  const municipalities = await prisma.pH_Address.findFirst({
    where: {
      province_name: {
        equals: province,
        mode: "insensitive",
      },
    },
    select: {
      municipality_list: true,
    },
    orderBy: {
      province_name: "asc",
    },
  });

  if (!municipalities) return [];

  const barangayList = (municipalities.municipality_list as Municipality)[
    municipality
  ];

  if (!barangayList) return [];

  return barangayList.barangay_list;
}

getMunicipalities("BATAAN");

type Municipality = {
  [key: string]: Barangay;
};

type Barangay = {
  barangay_list: Record<string, string[]>;
};
