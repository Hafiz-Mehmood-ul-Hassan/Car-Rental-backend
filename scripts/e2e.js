const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE = 'http://127.0.0.1:5000/api';

async function httpJson(pathname, body) {
  const res = await fetch(`${BASE}${pathname}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  console.log('POST', pathname, res.status, data.message || data);
  return { res, data };
}

async function httpGet(pathname, token) {
  const res = await fetch(`${BASE}${pathname}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  const data = await res.json();
  return { res, data };
}

const axios = require('axios');

async function uploadForm(pathname, token, fields, files) {
  const FormData = require('form-data');
  const form = new FormData();
  for (const k of Object.keys(fields)) form.append(k, fields[k]);
  for (const f of files) {
    const stream = fs.createReadStream(f.path);
    form.append(f.field, stream, { filename: f.name });
  }

  const headers = form.getHeaders();
  if (token) headers.Authorization = `Bearer ${token}`;

  const url = `${BASE}${pathname}`;
  const res = await axios.post(url, form, { headers, maxBodyLength: Infinity });
  console.log('UPLOAD', pathname, res.status, res.data.message || res.data);
  return { res, data: res.data };
}

async function run() {
  // 1. create sample files
  const tmp = path.join(__dirname, '..', 'tmp');
  if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);
  fs.writeFileSync(path.join(tmp, 'cnicFront.jpg'), 'cnicFront');
  fs.writeFileSync(path.join(tmp, 'cnicBack.jpg'), 'cnicBack');
  fs.writeFileSync(path.join(tmp, 'selfie.jpg'), 'selfie');
  fs.writeFileSync(path.join(tmp, 'car1.jpg'), 'car1');
  fs.writeFileSync(path.join(tmp, 'doc_reg.pdf'), 'docreg');
  fs.writeFileSync(path.join(tmp, 'doc_ins.pdf'), 'docins');

  // 2. register renter
  await httpJson('/auth/register', { name: 'E2E Renter', email: 'e2e.renter@example.com', password: 'pass123', role: 'RENTER' });
  // 3. register owner
  await httpJson('/auth/register', { name: 'E2E Owner', email: 'e2e.owner@example.com', password: 'pass123', role: 'CAR_OWNER' });

  // 4. login renter
  let r = await fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'e2e.renter@example.com', password: 'pass123' }) });
  let renterData = await r.json();
  const renterToken = renterData.data?.token || renterData.token;
  console.log('renter token', !!renterToken);

  // 5. login owner
  r = await fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'e2e.owner@example.com', password: 'pass123' }) });
  let ownerData = await r.json();
  const ownerToken = ownerData.data?.token || ownerData.token;
  console.log('owner token', !!ownerToken);

  // 6. renter submit KYC
  await uploadForm('/kyc', renterToken, { fullName: 'Renter', cnic: '1234567890123', address: 'Addr', phone: '03001234567' }, [
    { field: 'cnicFront', path: path.join(tmp, 'cnicFront.jpg'), name: 'cnicFront.jpg' },
    { field: 'cnicBack', path: path.join(tmp, 'cnicBack.jpg'), name: 'cnicBack.jpg' },
    { field: 'selfie', path: path.join(tmp, 'selfie.jpg'), name: 'selfie.jpg' },
  ]);

  // 7. owner submit KYC too
  await uploadForm('/kyc', ownerToken, { fullName: 'Owner', cnic: '9876543210123', address: 'OwnerAddr', phone: '03007654321' }, [
    { field: 'cnicFront', path: path.join(tmp, 'cnicFront.jpg'), name: 'cnicFront.jpg' },
    { field: 'cnicBack', path: path.join(tmp, 'cnicBack.jpg'), name: 'cnicBack.jpg' },
    { field: 'selfie', path: path.join(tmp, 'selfie.jpg'), name: 'selfie.jpg' },
  ]);

  // 8. Approve both users in DB
  await prisma.user.updateMany({ where: { email: { in: ['e2e.renter@example.com', 'e2e.owner@example.com'] } }, data: { kycStatus: 'APPROVED' } });
  console.log('approved users in DB');

  // 9. owner creates a car (DRAFT)
  r = await fetch(`${BASE}/cars`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ownerToken}` }, body: JSON.stringify({ title: 'E2E Car', brand: 'EBrand', model: 'EMod', year: 2020, pricePerDay: 100, location: 'City', description: 'Test car' }) });
  const carCreate = await r.json();
  const carId = carCreate.data?.id || (carCreate.data && carCreate.data.id);
  console.log('car created', carId);

  // 10. upload images
  await uploadForm(`/cars/${carId}/images`, ownerToken, {}, [ { field: 'images', path: path.join(tmp, 'car1.jpg'), name: 'car1.jpg' } ]);

  // 11. upload documents (REGISTRATION & INSURANCE)
  await uploadForm(`/cars/${carId}/documents`, ownerToken, { type: 'REGISTRATION' }, [ { field: 'documents', path: path.join(tmp, 'doc_reg.pdf'), name: 'reg.pdf' } ]);
  await uploadForm(`/cars/${carId}/documents`, ownerToken, { type: 'INSURANCE' }, [ { field: 'documents', path: path.join(tmp, 'doc_ins.pdf'), name: 'ins.pdf' } ]);

  // 12. submit car for review
  r = await fetch(`${BASE}/cars/${carId}/submit`, { method: 'PATCH', headers: { Authorization: `Bearer ${ownerToken}` } });
  console.log('submitted car', r.status);

  // 13. Approve car in DB so it's bookable
  await prisma.car.update({ where: { id: Number(carId) }, data: { status: 'APPROVED' } });
  console.log('car approved in DB');

  // 14. renter books the car
  const start = new Date();
  const end = new Date(); end.setDate(end.getDate() + 3);
  r = await fetch(`${BASE}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${renterToken}` }, body: JSON.stringify({ carId: Number(carId), pickupDate: start.toISOString(), returnDate: end.toISOString() }) });
  const bookingResp = await r.json();
  const bookingId = bookingResp.data?.id || bookingResp.data?.bookingId || bookingResp.data?.id;
  console.log('booking created', bookingId);

  // 15. create payment record
  r = await fetch(`${BASE}/payments/create`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${renterToken}` }, body: JSON.stringify({ bookingId: Number(bookingId) }) });
  console.log('payment created', await r.json());

  // 16. upload receipt
  await uploadForm('/payments/upload-receipt', renterToken, { bookingId: bookingId }, [ { field: 'receipt', path: path.join(tmp, 'doc_ins.pdf'), name: 'receipt.pdf' } ]);

  // 17. Approve payment and booking via DB
  const payment = await prisma.payment.findUnique({ where: { bookingId: Number(bookingId) } });
  await prisma.payment.update({ where: { id: payment.id }, data: { status: 'SUCCESS', paidAt: new Date() } });
  await prisma.booking.update({ where: { id: Number(bookingId) }, data: { status: 'CONFIRMED' } });
  await prisma.car.update({ where: { id: Number(carId) }, data: { isBooked: true } });
  console.log('payment approved and booking confirmed in DB');

  process.exit(0);
}

run().catch(e => { console.error('e2e error', e); process.exit(1); });
