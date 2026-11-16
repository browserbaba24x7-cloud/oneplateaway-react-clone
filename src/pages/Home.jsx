import Hero from '../components/Hero';
import ProblemSection from '../components/ProblemSection';
import DeliverySection from '../components/DeliverySection';
import VolunteerSection from '../components/VolunteerSection';

export default function Home({ onGive, onMonthly, onVolunteer }) {
  return (
    <main className="flex-grow">
      <Hero onGive={onGive} onMonthly={onMonthly} />
      <ProblemSection onGive={onGive} onMonthly={onMonthly} />
      <DeliverySection onGive={onGive} />
      <VolunteerSection onVolunteer={onVolunteer} />
    </main>
  );
}
