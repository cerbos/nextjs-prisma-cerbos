import { queryPlanToPrisma, PlanKind } from "@cerbos/orm-prisma";
import { GRPC } from "@cerbos/grpc";
import { PrismaClient } from '@prisma/client';
//import {Chela_One} from "@next/font/google";


const Contacts = ({ contacts }) => {
//export default function Contacts({ contacts }) {
  return (
    <div>
      <h1>List of contacts</h1>
      <ul>
        {contacts.map((contact: any) => (
          <li key={contact.id}>
            <a href={`/contacts/${contact.id}`}>{contact.firstName} {contact.lastName}: {contact.id}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export async function getServerSideProps() {
  const cerbos = new GRPC("localhost:3593", { tls: false });
  const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });

  const contactQueryPlan = await cerbos.planResources({
    principal: {
      // TODO retrieve user data from session?
      //id: req.user.id,
      //roles: [req.user.role],
      //attributes: {
        //department: req.user.department,
      //},
      id: "1",
      roles: ["admin"],
      attributes: {
        department: "IT",
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

  let contacts: any[];

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

  console.log(contacts);

  // Pass data to the page via props
  return { props: { contacts } }
}

export default Contacts
