export function generateOrderId(): string {
  const timestamp = Date.now(); // full timestamp
  const random = Math.floor(100000 + Math.random() * 900000); // 6 digit

  return `LAVE-${timestamp}-${random}`;
}