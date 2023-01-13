import { GRPC } from "@cerbos/grpc";
import { PrismaClient } from '@prisma/client';
//import { useRouter } from 'next/router';

const Contact = ({ contact, isAllowed }) => {
  //const router = useRouter()
  //const { cid } = router.query
  if (!contact) return <p>Contact not found!</p>

  return (isAllowed) ? <p>Contact: {contact.firstName} {contact.lastName}: {contact.id}</p> : <p>Unauthorized!</p>
}

export async function getServerSideProps(context) {
  const cerbos = new GRPC("localhost:3593", { tls: false });
  const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });

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
      // TODO retrieve user data from session?
      //id: `${user.id}`,
      //roles: [user.role],
      //attributes: {
        //department: user.department,
      //},
      id: "1",
      roles: ["admin"],
      attributes: {
        department: "IT",
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
