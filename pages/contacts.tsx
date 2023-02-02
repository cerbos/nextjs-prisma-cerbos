import { NextApiRequest } from "next";
import Link from "next/link";
import { queryPlanToPrisma, PlanKind } from "@cerbos/orm-prisma";
import { PrismaClient } from "@prisma/client";
import { useUser } from "../lib/hooks";
import { getLoginSession } from "../lib/auth";
import { getCerbosClient } from "../lib/cerbos";
import Layout from "../components/layout";

const Contacts = ({ contacts }: { contacts: any }) => {
  useUser({ redirectTo: "/login" });

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-3">Contacts</h1>
      <p className="text-xl pb-3">
        The following contacts are accessible to the active user:
      </p>
      <ul>
        {contacts.map((contact: any) => (
          <li key={contact.id} className="pb-2">
            <Link
              className="underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
              href={`/contacts/${contact.id}`}
            >
              {contact.id}: {contact.firstName} {contact.lastName}
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/">
        <button
          className="bg-gray-300 border-solid border-2 border-black px-2.5 py-1 mt-3.5"
          type="button"
        >
          Home
        </button>
      </Link>
    </Layout>
  );
};

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  const cerbos = getCerbosClient();
  const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });

  let contacts: any[] = [];

  const session = await getLoginSession(req);
  if (!session) {
    return { props: { contacts } };
  }

  const user = await prisma.user.findUnique({
    where: { username: session.username },
  });
  if (!user) {
    throw Error("Not found");
  }

  const contactQueryPlan = await cerbos.planResources({
    principal: {
      id: user.id,
      roles: [session.role],
      attributes: {
        department: user.department,
      },
    },
    resource: {
      kind: "contact",
    },
    action: "read",
  });

  const queryPlanResult = queryPlanToPrisma({
    queryPlan: contactQueryPlan,
    // map or function to change field names to match the prisma model
    fieldNameMapper: {
      "request.resource.attr.ownerId": "ownerId",
      "request.resource.attr.department": "department",
      "request.resource.attr.active": "active",
      "request.resource.attr.marketingOptIn": "marketingOptIn",
    },
  });

  if (queryPlanResult.kind !== PlanKind.ALWAYS_DENIED) {
    // Pass the filters in as where conditions
    // If you have prexisting where conditions, you can pass them in an AND clause
    contacts = await prisma.contact.findMany({
      where: {
        AND: queryPlanResult.filters,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        active: true,
        marketingOptIn: true,
      },
      orderBy: {
        id: "asc",
      },
    });
  }

  // Pass data to the page via props
  return { props: { contacts } };
}

export default Contacts;
