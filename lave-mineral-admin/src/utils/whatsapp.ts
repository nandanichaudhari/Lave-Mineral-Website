// 🔧 Format phone number (India default +91)
const formatPhone = (phone?: string) => {
  if (!phone) return "";
  let cleaned = phone.replace(/\D/g, "");
  if (!cleaned.startsWith("91")) {
    cleaned = "91" + cleaned;
  }
  return cleaned;
};

// 🟢 CUSTOMER → ADMIN (Order Request)
export function createWhatsAppLink({
  product,
  boxes,
}: {
  product: string;
  boxes?: number;
}) {
  const number = formatPhone(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  );

  const message = encodeURIComponent(
    `Hello, I want to order Lave Mineral Water.

Product: ${product}
Boxes: ${boxes || "Not specified"}

Please provide details.`
  );

  return `https://wa.me/${number}?text=${message}`;
}

// 🔵 ADMIN → CUSTOMER (Direct Contact)
export function generateWhatsAppLink(
  phone: string,
  order: any
) {
  const formattedPhone = formatPhone(phone);

  const message = encodeURIComponent(
    `Hello ${order.name},

Regarding your order:

Order ID: ${order.orderId}
Product: ${order.product}
Boxes: ${order.boxes}

We would like to discuss pricing, confirmation, and delivery.

Thank you,
Lave Mineral Water Team`
  );

  return `https://wa.me/${formattedPhone}?text=${message}`;
}