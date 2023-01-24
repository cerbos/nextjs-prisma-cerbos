import Link from "next/link";
import { GRPC } from "@cerbos/grpc";
import { PrismaClient } from "@prisma/client";
import Layout from "../../components/layout";
import { getLoginSession } from "../../lib/auth";

const Contact = ({ contact, isAllowed }) => {
  if (!contact)
    return (
      <Layout>
        <p>Contact not found!</p>
      </Layout>
    );

  return (
    <Layout>
      {isAllowed ? (
        <>
          <h1 className="text-xl font-bold mb-3">
            Contact: {contact.firstName} {contact.lastName}
          </h1>
          <pre className="whitespace-pre-wrap break-words">
            {JSON.stringify(contact, null, 2)}
          </pre>
        </>
      ) : (
        <p>Unauthorized!</p>
      )}
      <Link href="/contacts">
        <button
          className="bg-gray-300 border-solid border-2 border-black px-2.5 py-1 mt-3.5"
          type="button"
        >
          Back
        </button>
      </Link>
    </Layout>
  );
};

export async function getServerSideProps({ req, query }) {
  const cerbos = new GRPC("localhost:3593", { tls: false });
  const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });

  const session = await getLoginSession(req);
  const user = await prisma.user.findUnique({
    where: { username: session.username },
  });
  if (!user) {
    throw Error("Not found");
  }

  const { cid } = query;

  const contact = await prisma.contact.findUnique({
    where: {
      id: cid,
    },
    include: {
      company: true,
    },
  });

  if (contact === null) return { props: { contact: null, decision: null } };

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
      id: contact.id + "",
      attributes: JSON.parse(JSON.stringify(contact)),
    },
    actions: ["read"],
  });

  // Pass data to the page via props
  return {
    props: {
      contact: JSON.parse(JSON.stringify(contact)),
      isAllowed: decision.isAllowed("read"),
    },
  };
}

export default Contact;
