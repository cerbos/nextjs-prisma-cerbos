import { NextApiRequest } from "next";
import Link from "next/link";
import Layout from "../../components/layout";
import { getLoginSession } from "../../lib/auth";
import { getCerbosClient } from "../../lib/cerbos";
import { getPrismaClient } from "../../lib/prisma";

const Contact = ({
  contact,
  isAllowed,
  user,
}: {
  contact: any;
  isAllowed: boolean;
  user: any;
}) => {
  if (!contact)
    return (
      <Layout user={user}>
        <p>Contact not found!</p>
      </Layout>
    );

  return (
    <Layout user={user}>
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

export async function getServerSideProps({
  req,
  query,
}: {
  req: NextApiRequest;
  query: any;
}) {
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
      roles: [session.role],
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
      user: user,
    },
  };
}

export default Contact;
