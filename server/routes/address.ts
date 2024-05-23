import { FastifyInstance } from "fastify";
import addressController from "../controllers/addressController";

export function AddressRoute(
  instance: FastifyInstance,
  options: any,
  done: () => void,
) {
  instance.get("/provinces", addressController.getProvincesList);
  instance.get("/municipalities", addressController.getMunicipalitiesList);
  instance.get("/barangays", addressController.getBarangaysList);
  done();
}
