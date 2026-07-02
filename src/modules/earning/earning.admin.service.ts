import { getAllEarnings } from "./earning.repository";

export const getAllEarningsService = async () => {
  return await getAllEarnings();
};