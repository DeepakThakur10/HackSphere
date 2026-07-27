import Hero from '../../components/sections/Hero';
import FeaturedHackathons from '../../components/sections/FeaturedHackathons';

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedHackathons />
      {/* Remaining landing sections will be added next: Why Choose, Statistics, How It Works, Upcoming, Testimonials, FAQ */}
    </>
  );
}
