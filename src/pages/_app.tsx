
import type { AppProps } from "next/app";
import { ThirdwebProvider } from "thirdweb/react";
import "@/styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider>
      <Component {...pageProps} />
    </ThirdwebProvider>
  );
}