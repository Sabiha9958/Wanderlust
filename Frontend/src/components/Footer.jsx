import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, MessageCircle } from "lucide-react";

/* ---------------- CONFIG ---------------- */
const SECTIONS = [
  {
    title: "Support",
    links: [
      { label: "Help Center", to: "/help" },
      { label: "Safety", to: "/safety" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Careers", to: "/careers" },
    ],
  },
  {
    title: "Hosting",
    links: [
      { label: "List Property", to: "/create-listing" },
      { label: "Community", to: "/community" },
    ],
  },
];

const SOCIALS = [{ icon: MessageCircle, label: "Community" }];

/* ---------------- HELPERS ---------------- */
const Container = ({ children }) => (
  <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">{children}</div>
);

const FooterLink = ({ to, children }) => (
  <Link
    to={to}
    className="text-sm text-gray-500 hover:text-indigo-600 transition-colors duration-200"
  >
    {children}
  </Link>
);

const Section = ({ title, links }) => (
  <div>
    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
      {title}
    </h3>
    <ul className="space-y-2">
      {links.map((l) => (
        <li key={l.to}>
          <FooterLink to={l.to}>{l.label}</FooterLink>
        </li>
      ))}
    </ul>
  </div>
);

const SocialIcon = ({ Icon, label }) => (
  <button
    type="button"
    aria-label={label}
    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:text-indigo-600 hover:border-indigo-300 hover:shadow transition"
  >
    <Icon size={18} />
  </button>
);

/* ---------------- COMPONENT ---------------- */
const Footer = () => {
  return (
    <footer className="mt-20 bg-gradient-to-b from-gray-50 to-gray-100 border-t">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-5">
          {/* BRAND */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow">
                <MapPin size={18} />
              </div>
              <div>
                <h2 className="text-xl font-bold">WanderLust</h2>
                <p className="text-xs text-indigo-600 uppercase tracking-widest">
                  Travel & Stay
                </p>
              </div>
            </Link>

            <p className="mt-4 text-sm text-gray-600 max-w-md">
              Discover unique stays and premium travel experiences across the
              world. Your journey begins here.
            </p>

            <div className="mt-5 space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <Mail size={16} /> support@wanderlust.com
              </p>
              <p className="flex items-center gap-2">
                <Phone size={16} /> +1 (234) 567-890
              </p>
            </div>
          </div>

          {/* LINKS */}
          {SECTIONS.map((section) => (
            <Section key={section.title} {...section} />
          ))}
        </div>

        {/* SOCIALS */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-8 pb-6">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} WanderLust. All rights reserved.
          </p>
          <div className="flex gap-3">
            {SOCIALS.map((s) => (
              <SocialIcon key={s.label} Icon={s.icon} label={s.label} />
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
