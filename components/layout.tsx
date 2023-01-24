import Head from "next/head";
import Header from "./header";

const Layout = ({ children }) => {
  return (
    <>
      <Head>
        <title>With Cookies</title>
      </Head>

      <Header />

      <main>
        <div className="container">{children}</div>
      </main>

      <style jsx global>{`
        .container {
          max-width: 42rem;
          margin: 0 auto;
          padding: 2rem 1.25rem;
        }
      `}</style>
    </>
  );
};

export default Layout;
