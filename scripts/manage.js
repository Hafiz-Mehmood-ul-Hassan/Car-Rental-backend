const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function approveUser(email) {
  const user = await prisma.user.update({ where: { email }, data: { kycStatus: 'APPROVED' } });
  console.log('updated user', user.email, user.kycStatus);
}

async function setCarStatus(carId, status) {
  const car = await prisma.car.update({ where: { id: Number(carId) }, data: { status } });
  console.log('updated car', car.id, car.status);
}

async function approvePayment(bookingId) {
  const payment = await prisma.payment.findUnique({ where: { bookingId: Number(bookingId) } });
  if (!payment) { console.log('no payment'); return; }
  await prisma.payment.update({ where: { id: payment.id }, data: { status: 'SUCCESS', paidAt: new Date() } });
  await prisma.booking.update({ where: { id: Number(bookingId) }, data: { status: 'CONFIRMED' } });
  const booking = await prisma.booking.findUnique({ where: { id: Number(bookingId) } });
  await prisma.car.update({ where: { id: booking.carId }, data: { isBooked: true } });
  console.log('payment and booking approved for bookingId', bookingId);
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const opts = {};
  for (let i = 1; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const val = args[i+1];
    opts[key] = val;
  }

  if (cmd === 'approve-user') {
    await approveUser(opts.email);
  } else if (cmd === 'set-car-status') {
    await setCarStatus(opts.carId, opts.status);
  } else if (cmd === 'approve-payment') {
    await approvePayment(opts.bookingId);
  } else {
    console.log('unknown cmd');
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
