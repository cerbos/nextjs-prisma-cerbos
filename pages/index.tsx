import { useUser } from '../lib/hooks'
import Layout from '../components/layout'
import Link from 'next/link'
import LoginTable from '../components/login-table'

export default function Home() {
  const user = useUser()

  return (
    <Layout>
      <h1 className="text-2xl font-bold">Cerbos + Next.js + Prisma demo</h1>
      {!user && (
        <>
          <p className="mt-4 mb-2 font-bold">Steps to test the example:</p>
          <ol>
            <li>Click Login (top right) and enter a username and password from the following set:</li>
            <li>
              <LoginTable />
            </li>
            <li>
              You&apos;ll be redirected to `Home`, which will show your active user
              and present the option of navigating to the `contacts` page.
            </li>
            <li>
              On the `contacts` page, a list of contacts will be displayed which are available to the active user,
              based on the privileges they have from the Cerbos policies.
            </li>
          </ol>
        </>
      )}
      {user && (
        <>
          <p className="mt-4 mb-2 font-bold">Currently logged in as:</p>
          <pre className="whitespace-pre-wrap break-words">{JSON.stringify(user, null, 2)}</pre>
          <Link href="/contacts">
            <button className="bg-gray-300 border-solid border-2 border-black px-2.5 py-1 mt-3.5" type="button">Contacts</button>
          </Link>
        </>
      )}
    </Layout>
  )
}
