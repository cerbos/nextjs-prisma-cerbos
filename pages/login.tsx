import { useState } from "react";
import Router from "next/router";
import Form from "../components/form";
import Layout from "../components/layout";
import LoginTable from "../components/login-table";
import { getLoginSession } from "../lib/auth";

const Login = () => {
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function handleSubmit(e: any) {
    e.preventDefault();

    if (errorMsg) setErrorMsg("");

    const body = {
      username: e.currentTarget.username.value,
      password: e.currentTarget.password.value,
    };

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 200) {
        Router.push("/");
      } else {
        throw new Error(await res.text());
      }
    } catch (error: any) {
      console.error("An unexpected error happened occurred:", error);
      setErrorMsg(error.message);
    }
  }

  return (
    <Layout user={null}>
      <div className="login">
        <Form errorMessage={errorMsg} onSubmit={handleSubmit} />
      </div>
      <LoginTable />
      <style jsx>{`
        .login {
          margin: 0 auto;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
      `}</style>
    </Layout>
  );
};

export default Login;

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  // Redirect to home if user is already logged in
  const session = await getLoginSession(req);
  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // Pass data to the page via props
  return { props: {} };
}
