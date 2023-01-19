import { GRPC } from "@cerbos/grpc";
import { PrismaClient } from '@prisma/client';
//import { useRouter } from 'next/router';
import Layout from '../../components/layout'
import { getLoginSession } from '../../lib/auth'

const Contact = ({ contact, isAllowed }) => {
  if (!contact) return <Layout><p>Contact not found!</p></Layout>

  return (
    <Layout>
      {(isAllowed) ? <p>Contact: {contact.firstName} {contact.lastName}: {contact.id}</p> : <p>Unauthorized!</p>}
    </Layout>
  )
}

export async function getServerSideProps(context) {
  const cerbos = new GRPC("localhost:3593", { tls: false });
  const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });

  const session = await getLoginSession(context.req);
  const user = await prisma.user.findUnique({
    where: { username: session.username },
  });
  if (!user) {
    throw Error("Not found");
  }

  const { cid } = context.query

  const contact = await prisma.contact.findUnique({
    where: {
      id: cid,
    },
    include: {
      company: true,
    },
  });

  if (contact === null) return { props: { contact: null, decision: null } }

  // check user is authorized
  const decision = await cerbos.checkResource({
    principal: {
      id: user.id,
      roles: [user.role],
      attributes: {
        department: user.department,
      },
    },
    resource: {
      kind: "contact",
      id: contact.id + '',
      attributes: JSON.parse(JSON.stringify(contact)),
    },
    actions: ["read"],
  });

  // Pass data to the page via props
  return { props: { contact: JSON.parse(JSON.stringify(contact)), isAllowed: decision.isAllowed("read") } }
}

export default Contact
