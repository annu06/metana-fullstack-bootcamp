import Navigation from "./Navigation";
import Footer from "./Footer";
import Header from "./Header";

export default function Layout({ children }) {
  return (
    <>
      <Navigation />
      <Header />
      <main className="min-h-screen p-4">{children}</main>
      <Footer />
    </>
  );
}