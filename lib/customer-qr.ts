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
  const trimmed = value.trim();
  const uppercased = trimmed.toUpperCase();

  if (CUSTOMER_NUMBER_PATTERN.test(uppercased)) return uppercased;

  const [prefix, version, customerNumber, ...rest] = trimmed.split("|");
  const normalizedCustomerNumber = customerNumber?.trim().toUpperCase() ?? "";
  if (
    rest.length > 0 ||
    prefix?.trim().toUpperCase() !== QR_PREFIX ||
    version?.trim().toLowerCase() !== QR_VERSION ||
    !CUSTOMER_NUMBER_PATTERN.test(normalizedCustomerNumber)
  ) {
    return null;
  }
  return normalizedCustomerNumber;
}
