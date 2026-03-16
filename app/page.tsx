import Navbar from "@/components/Navbar";
import FeaturedSlider from "@/components/FeaturedSlider";
import BlogGrid from "@/components/BlogGrid";
import ClubSection from "@/components/ClubSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen text-foreground selection:bg-accent selection:text-accent-foreground relative overflow-hidden">
      <Navbar />
      <FeaturedSlider />
      <BlogGrid />
      <ClubSection />
      <Footer />
    </main>
  );
}
