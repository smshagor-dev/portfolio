import { GoogleTagManager } from "@next/third-parties/google";
import { Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "ckeditor5/ckeditor5.css";
import { getHomePageData } from "@/lib/api";
import Footer from "./components/footer";
import LayoutShell from "./components/layout-shell";
import ScrollToTop from "./components/helper/scroll-to-top";
import Navbar from "./components/navbar";
import "./css/card.scss";
import "./css/globals.scss";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Portfolio of Shahanur Islam Shagor - Software Developer",
  description:
    "This is the portfolio of Shahanur Islam Shagor. I am a full stack developer and a self taught developer. I love to learn new things and I am always open to collaborating with others. I am a quick learner and I am always looking for new challenges.",
};

export default async function RootLayout({ children }) {
  const profile = await getHomePageData()
    .then((data) => data?.profile || null)
    .catch(() => null);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ToastContainer />
        <LayoutShell
          footer={<Footer />}
          navbar={<Navbar profile={profile} />}
          scrollToTop={<ScrollToTop />}
        >
          {children}
        </LayoutShell>
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM} />
      </body>
    </html>
  );
}
