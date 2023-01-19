import Head from 'next/head'
//import Image from 'next/image'
//import { Inter } from '@next/font/google'
//import styles from '../styles/Home.module.css'
import { getSession } from "./lib/get-session.js";
import { useUser } from '../lib/hooks'
import Layout from '../components/layout'

export default function Home() {
  const user = useUser()

  return (
    <Layout>
      <h1>Passport.js Example</h1>

      <p>Steps to test the example:</p>

      <ol>
        <li>Click Login and enter a username and password.</li>
        <li>
          You&apos;ll be redirected to Home. Click on Profile, notice how your
          session is being used through a token stored in a cookie.
        </li>
        <li>
          Click Logout and try to go to Profile again. You&apos;ll get redirected to
          Login.
        </li>
      </ol>

      {user && (
        <>
          <p>Currently logged in as:</p>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </>
      )}

      <style jsx>{`
        li {
          margin-bottom: 0.5rem;
        }
        pre {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      `}</style>
    </Layout>
  )
}
