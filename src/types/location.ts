/** What the header's location block shows. */
export interface DeliveryLocation {
  /** Bold first line — the most specific part (street / area / village). */
  title: string;
  /** Smaller second line — the rest of the address. */
  subtitle: string;
}

/** A saved address, shaped for the location modal. `raw` is sent back to the backend untouched. */
export interface SavedAddress {
  id: string;
  title: string;
  subtitle: string;
  pincode: string;
  isDefault: boolean;
  raw: Record<string, unknown>;
}
