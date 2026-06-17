import { logger } from "./logger";

const HUBSPOT_API_KEY = process.env["HUBSPOT_API_KEY"];
const BASE_URL = "https://api.hubapi.com";

interface HubSpotContactProps {
  email: string;
  firstname: string;
  lastname?: string;
  phone?: string;
}

interface HubSpotDealProps {
  dealname: string;
  amount: number;
  dealstage: string;
  pipeline: string;
}

async function hubspotFetch(path: string, method: string, body?: unknown) {
  if (!HUBSPOT_API_KEY) return null;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${HUBSPOT_API_KEY}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HubSpot API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<{ id: string; [key: string]: unknown }>;
}

async function upsertContact(props: HubSpotContactProps): Promise<string | null> {
  try {
    const nameParts = props.firstname.trim().split(" ");
    const firstname = nameParts[0];
    const lastname = nameParts.slice(1).join(" ") || undefined;

    const data = await hubspotFetch("/crm/v3/objects/contacts", "POST", {
      properties: {
        email: props.email,
        firstname,
        lastname: props.lastname || lastname || "",
        phone: props.phone || "",
      },
    });

    if (data?.id) return data.id as string;
    return null;
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("409")) {
      try {
        const existing = await hubspotFetch(
          `/crm/v3/objects/contacts/${encodeURIComponent(props.email)}?idProperty=email`,
          "GET"
        );
        return existing?.id as string | null;
      } catch {
        return null;
      }
    }
    throw err;
  }
}

async function createDeal(props: HubSpotDealProps): Promise<string | null> {
  const data = await hubspotFetch("/crm/v3/objects/deals", "POST", {
    properties: {
      dealname: props.dealname,
      amount: props.amount.toFixed(2),
      dealstage: props.dealstage,
      pipeline: props.pipeline,
    },
  });
  return data?.id as string | null;
}

async function associateDealToContact(dealId: string, contactId: string) {
  await hubspotFetch(
    `/crm/v4/objects/deals/${dealId}/associations/contacts/${contactId}`,
    "PUT",
    [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 }]
  );
}

export async function syncOrderToHubspot(order: {
  fullName: string;
  email: string;
  phone: string;
  orderRef: string;
  totalAmount: number;
}): Promise<void> {
  if (!HUBSPOT_API_KEY) return;

  try {
    const contactId = await upsertContact({
      email: order.email,
      firstname: order.fullName,
      phone: order.phone,
    });

    const dealId = await createDeal({
      dealname: `Gas Order ${order.orderRef}`,
      amount: order.totalAmount,
      dealstage: "appointmentscheduled",
      pipeline: "default",
    });

    if (contactId && dealId) {
      await associateDealToContact(dealId, contactId);
    }

    logger.info({ orderRef: order.orderRef }, "Order synced to HubSpot");
  } catch (err) {
    logger.error({ err }, "HubSpot order sync failed");
  }
}

export async function syncContactToHubspot(contact: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}): Promise<void> {
  if (!HUBSPOT_API_KEY) return;

  try {
    const contactId = await upsertContact({
      email: contact.email,
      firstname: contact.name,
      phone: contact.phone,
    });

    if (contactId) {
      await hubspotFetch("/crm/v3/objects/notes", "POST", {
        properties: {
          hs_note_body: `Contact form message:\n\n${contact.message}`,
          hs_timestamp: Date.now(),
        },
        associations: [
          {
            to: { id: contactId },
            types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }],
          },
        ],
      });
    }

    logger.info({ email: contact.email }, "Contact synced to HubSpot");
  } catch (err) {
    logger.error({ err }, "HubSpot contact sync failed");
  }
}
