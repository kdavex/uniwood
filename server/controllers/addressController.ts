import {
  getBarangays,
  getMunicipalities,
  getProvinces,
} from "../models/phAddressQuery";
import { FastifyRequest, FastifyReply } from "../types/fastify";

const getProvincesList = async (req: FastifyRequest, res: FastifyReply) => {
  const provinces = await getProvinces();

  res.code(200).send({ status: "success", data: provinces });
};

const getMunicipalitiesList = async (
  req: FastifyRequest<{ Querystring: { province: string } }>,
  res: FastifyReply,
) => {
  const municipalities = await getMunicipalities(req.query.province);

  res.code(200).send({ status: "success", data: municipalities });
};

const getBarangaysList = async (
  req: FastifyRequest<{
    Querystring: { province: string; municipality: string };
  }>,
  res: FastifyReply,
) => {
  const barangays = await getBarangays(
    req.query.province,
    req.query.municipality,
  );

  res.code(200).send({ status: "success", data: barangays });
};

const addressController = {
  getProvincesList,
  getMunicipalitiesList,
  getBarangaysList,
};

export default addressController;
