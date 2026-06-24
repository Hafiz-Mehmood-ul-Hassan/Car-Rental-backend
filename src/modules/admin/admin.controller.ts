import * as adminService from "./admin.service";
import { sendResponse } from "../../shared/responses/apiResponse";

// 📊 Dashboard
export const getDashboardStats = async (req, res) => {
  const data = await adminService.getDashboardStats();
  return sendResponse(res, 200, true, "Dashboard stats", data);
};

// 👤 Users
export const getAllUsers = async (req, res) => {
  const data = await adminService.getAllUsers();
  return sendResponse(res, 200, true, "Users fetched", data);
};

// 🧾 KYC
export const getAllKyc = async (req, res) => {
  const data = await adminService.getAllKyc();
  return sendResponse(res, 200, true, "KYCs fetched", data);
};

export const updateKycStatus = async (req, res) => {
  const data = await adminService.updateKycStatus(
    Number(req.params.id),
    req.body.status
  );

  return sendResponse(res, 200, true, "KYC status updated", data);
};

// 💳 Payments
export const getPendingPayments = async (req, res) => {
  const data = await adminService.getPendingPayments();
  return sendResponse(res, 200, true, "Pending payments", data);
};

export const approvePayment = async (req, res) => {
  const paymentId = Number(req.params.id);
  await adminService.approvePayment(paymentId);
  return sendResponse(res, 200, true, "Payment approved");
};

export const rejectPayment = async (req, res) => {
  const paymentId = Number(req.params.id);
  await adminService.rejectPayment(paymentId);
  return sendResponse(res, 200, true, "Payment rejected");
};