import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import FloatingWidgets from './components/FloatingWidgets';
import Home from './pages/Home';
import About from './pages/About';
import Campaign from './pages/Campaign';
import Stories from './pages/Stories';
import Volunteer from './pages/Volunteer';
import PersonalisedGiving from './pages/PersonalisedGiving';
import Monthly from './pages/Monthly';
import DonationModal from './components/DonationModal';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  const go = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useState('English');
  const [donationOpen, setDonationOpen] = useState(false);
  const [donationFrequency, setDonationFrequency] = useState('One-time');

  useEffect(() => {
    const titles = {
      '/': 'Home | OnePlateAway',
      '/about': 'About Us | OnePlateAway',
      '/campaign': 'Current Campaign | OnePlateAway',
      '/stories': 'Stories | OnePlateAway',
      '/volunteer': 'Volunteer | OnePlateAway',
      '/personalised-giving': 'Personalised Giving | OnePlateAway',
      '/monthly': 'Monthly Giving | OnePlateAway',
    };

    document.title = titles[location.pathname] || 'OnePlateAway';
  }, [location.pathname]);

  // TODO: wire the volunteer flow.
  const onGive = () => {
    setDonationFrequency('One-time');
    setDonationOpen(true);
  };
  const onMonthly = () => {
    setDonationFrequency('Monthly');
    setDonationOpen(true);
  };
  const onVolunteer = () => go('/volunteer');

  return (
    <div className="font-sans text-gray-900 bg-white min-h-screen flex flex-col">
      <ScrollToTop />
      <SiteHeader onGive={onGive} onMonthly={onMonthly} />
      <Routes>
        <Route path="/" element={<Home onGive={onGive} onMonthly={onMonthly} onVolunteer={onVolunteer} />} />
        <Route path="/about" element={<About onGive={onGive} onMonthly={onMonthly} />} />
        <Route path="/campaign" element={<Campaign onGive={onGive} onMonthly={onMonthly} />} />
        <Route path="/blog" element={<Stories />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/gift" element={<PersonalisedGiving />} />
        <Route path="/monthly" element={<Monthly onMonthly={onMonthly} />} />
        <Route path="*" element={<Home onGive={onGive} onMonthly={onMonthly} onVolunteer={onVolunteer} />} />
      </Routes>
      <SiteFooter onGive={onGive} onMonthly={onMonthly} />
      <FloatingWidgets onDonate={onGive} language={language} onLanguage={setLanguage} />
      <DonationModal
        show={donationOpen}
        onClose={() => setDonationOpen(false)}
        projectTitle="General Fund"
        frequency={donationFrequency}
      />
    </div>
  );
}
