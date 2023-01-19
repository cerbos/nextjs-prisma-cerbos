import { queryPlanToPrisma, PlanKind } from "@cerbos/orm-prisma";
import { GRPC } from "@cerbos/grpc";
import { PrismaClient } from '@prisma/client';
import { useUser } from '../lib/hooks'
import { getLoginSession } from '../lib/auth'
import Layout from '../components/layout'


const Contacts = ({ contacts }) => {
  useUser({ redirectTo: "/login" })

  return (
    <Layout>
      <h1>List of contacts</h1>
      <ul>
        {contacts.map((contact: any) => (
          <li key={contact.id}>
            <a href={`/contacts/${contact.id}`}>{contact.firstName} {contact.lastName}: {contact.id}</a>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

export async function getServerSideProps({ req }) {
  const cerbos = new GRPC("localhost:3593", { tls: false });
  const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });

  let contacts: any[] = [];

  const session = await getLoginSession(req);
  if (!session) {
    return { props: { contacts } }
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
      roles: [user.role],
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
        AND: queryPlanResult.filters
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        active: true,
        marketingOptIn: true,
      },
    });
  }

  // Pass data to the page via props
  return { props: { contacts } }
}

export default Contacts
