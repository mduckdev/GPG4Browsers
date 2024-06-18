import { LayoutProps } from "@/types/LayoutProps";
import { Metadata } from 'next'
import "@/styles/globals.css"
export const metadata: Metadata = {
    title: 'PGP4Browsers',
    description: 'Extension for encrypting data with OpenPGP',
}
export default function RootLayout({ children, params }: LayoutProps) {
    return (
        <html>
            <body>
                <main>
                    {children}
                </main>
            </body>
        </html>

    );
}