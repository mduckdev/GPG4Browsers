import { AppProps } from "next/app";
import Layout from "@/app/layout"
import "@/styles/globals.css"

export default function Index({ Component, pageProps }: AppProps & { params: { locale: string } }) {
    const params = { locale: 'en-US' };
    return (
        <Layout params={params}>
            <Component {...pageProps} ></Component>
        </Layout>
    );
}