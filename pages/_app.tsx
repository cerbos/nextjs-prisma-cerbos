import '../styles/globals.css'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}


//App.getInitialProps = async (appContext) => {
  //try {
      //// getInitialProps logic
  //} catch (e) {
      //// handle error
  //} finally {
      //await prisma.disconnect()
  //}
//}
