import Link from "next/link";

const Header = ({ user }: { user: any }) => {
  return (
    <header>
      <nav>
        <ul>
          <li>
            <Link href="/" legacyBehavior>
              Home
            </Link>
          </li>
          {user ? (
            <>
              <li>
                <Link href="/contacts" legacyBehavior>
                  Contacts
                </Link>
              </li>
              <li>
                <Link href="/api/logout">Logout</Link>
              </li>
            </>
          ) : (
            <li>
              <Link href="/login" legacyBehavior>
                Login
              </Link>
            </li>
          )}
        </ul>
      </nav>
      <style jsx>{`
        nav {
          max-width: 42rem;
          margin: 0 auto;
          padding: 0.2rem 1.25rem;
        }
        ul {
          display: flex;
          list-style: none;
          margin-left: 0;
          padding-left: 0;
        }
        li {
          margin-right: 1rem;
        }
        li:first-child {
          margin-left: auto;
        }
        a {
          color: #fff;
          text-decoration: none;
        }
        header {
          color: #fff;
          background-color: #333;
        }
      `}</style>
    </header>
  );
};

export default Header;
