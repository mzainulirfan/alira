const QR_PREFIX = "ALIRA";
const QR_VERSION = "v1";
const CUSTOMER_NUMBER_PATTERN = /^PAM-\d{6}$/;

export function createCustomerQrPayload(customerNumber: string): string {
  if (!CUSTOMER_NUMBER_PATTERN.test(customerNumber)) {
    throw new Error("Nomor pelanggan tidak valid untuk QR.");
  }
  return `${QR_PREFIX}|${QR_VERSION}|${customerNumber}`;
}

export function parseCustomerQrPayload(value: string): string | null {
  const normalized = value.trim().toUpperCase();

  if (CUSTOMER_NUMBER_PATTERN.test(normalized)) return normalized;

  const [prefix, version, customerNumber, ...rest] = normalized.split("|");
  if (
    rest.length > 0 ||
    prefix !== QR_PREFIX ||
    version !== QR_VERSION ||
    !CUSTOMER_NUMBER_PATTERN.test(customerNumber ?? "")
  ) {
    return null;
  }
  return customerNumber;
}
