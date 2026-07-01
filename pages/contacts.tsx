import { NextApiRequest } from "next";
import Link from "next/link";
import { queryPlanToPrisma, PlanKind } from "@cerbos/orm-prisma";
import { getLoginSession } from "../lib/auth";
import { getCerbosClient } from "../lib/cerbos";
import { getPrismaClient } from "../lib/prisma";
import Layout from "../components/layout";

const Contacts = ({ contacts, user }: { contacts: any; user: any }) => {
  return (
    <Layout user={user}>
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
  const session = await getLoginSession(req);
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const cerbos = getCerbosClient();
  const prisma = getPrismaClient();

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
    mapper: {
      "request.resource.attr.ownerId": { field: "ownerId" },
      "request.resource.attr.department": { field: "department" },
      "request.resource.attr.active": { field: "active" },
      "request.resource.attr.marketingOptIn": { field: "marketingOptIn" },
    },
  });

  let contacts: any[] = [];

  if (queryPlanResult.kind !== PlanKind.ALWAYS_DENIED) {
    // Pass the filters in as where conditions.
    // ALWAYS_ALLOWED yields no filters (fetch everything); CONDITIONAL yields
    // a where clause. If you have pre-existing where conditions, you can
    // combine them in an AND clause.
    const where =
      queryPlanResult.kind === PlanKind.CONDITIONAL
        ? queryPlanResult.filters
        : {};

    contacts = await prisma.contact.findMany({
      where,
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
  return { props: { contacts, user } };
}

export default Contacts;
