// components/HtmlLink.tsx
import Link, { LinkProps } from 'next/link';
import { ReactNode } from 'react';

interface HtmlLinkProps extends LinkProps {
  children: ReactNode;
}

const HtmlLink = ({ href, children, ...props }: HtmlLinkProps) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const htmlHref = isProduction
    ? href.toString().endsWith('/')
      ? `${href}index.html`
      : `${href}.html`
    : href;

  return (
    <Link href={htmlHref} {...props}>
      {children}
    </Link>
  );
};

export default HtmlLink;
