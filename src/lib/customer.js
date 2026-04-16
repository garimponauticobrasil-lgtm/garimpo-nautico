const customerKey = "garimpo-customer";

function getFirstName(name) {
  return String(name || "").trim().split(/\s+/)[0] || "";
}

export function readCustomer() {
  try {
    return JSON.parse(localStorage.getItem(customerKey) || "null");
  } catch {
    return null;
  }
}

export function saveCustomer({ name, contact, source }) {
  const firstName = getFirstName(name);

  if (!firstName || !contact) {
    return null;
  }

  const customer = {
    name: String(name).trim(),
    firstName,
    contact: String(contact).trim(),
    source,
    savedAt: new Date().toISOString(),
  };

  localStorage.setItem(customerKey, JSON.stringify(customer));
  window.dispatchEvent(new CustomEvent("garimpo:customer-change", { detail: { customer } }));

  return customer;
}

export function clearCustomer() {
  localStorage.removeItem(customerKey);
  window.dispatchEvent(new CustomEvent("garimpo:customer-change", { detail: { customer: null } }));
}
