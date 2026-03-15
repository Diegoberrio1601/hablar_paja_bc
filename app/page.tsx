import Navbar from "@/components/Navbar";
import FeaturedSlider from "@/components/FeaturedSlider";
import BlogGrid from "@/components/BlogGrid";
import ClubSection from "@/components/ClubSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
      <Navbar />
      <FeaturedSlider />
      <BlogGrid />
      <ClubSection />
      <Footer />
    </main>
  );
}
