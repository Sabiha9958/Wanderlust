import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Compass, Hotel, Star, ShieldCheck, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Compass,
    title: "Explore Anywhere",
    desc: "Discover stays across cities, beaches, mountains, and hidden gems around the world.",
  },
  {
    icon: Hotel,
    title: "Premium Listings",
    desc: "Browse curated homes and hotels with comfort, style, and verified quality.",
  },
  {
    icon: Star,
    title: "Top Rated Experiences",
    desc: "Choose from highly rated stays loved by real travelers and trusted reviews.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Booking",
    desc: "Book confidently with a safe, smooth, and protected reservation experience.",
  },
];

const Container = ({ children, className = "" }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

const Button = ({
  children,
  variant = "primary",
  className = "",
  icon = false,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]";

  const variants = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 focus:ring-indigo-500",
    dark: "bg-gray-900 text-white hover:bg-black hover:shadow-lg focus:ring-gray-800",
    outline:
      "border border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white hover:text-gray-900 focus:ring-white",
    light:
      "bg-white text-gray-900 hover:bg-gray-100 hover:shadow-lg focus:ring-gray-300",
    ghost:
      "border border-gray-200 bg-white text-gray-800 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus:ring-indigo-400",
  };

  return (
    <button {...props} className={`${base} ${variants[variant]} ${className}`}>
      {children}
      {icon && <ArrowRight size={18} />}
    </button>
  );
};

const SectionBadge = ({ children }) => (
  <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700">
    {children}
  </div>
);

const FeatureCard = ({ Icon, title, desc }) => (
  <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gray-200/80">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

    <div className="relative z-10">
      <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md transition-transform duration-300 group-hover:scale-110">
        <Icon size={26} />
      </div>

      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-gray-600">{desc}</p>
    </div>
  </div>
);

const StatCard = ({ number, label }) => (
  <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 text-left backdrop-blur-md">
    <h3 className="text-2xl font-bold text-white md:text-3xl">{number}</h3>
    <p className="mt-1 text-sm text-white/80">{label}</p>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 w-2/3 rounded-xl bg-gray-200" />
            <div className="h-6 w-1/2 rounded-xl bg-gray-200" />
            <div className="h-12 w-40 rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_30%),linear-gradient(135deg,#111827_0%,#312e81_45%,#4f46e5_100%)] text-white">
        <div className="absolute inset-0 bg-black/10" />

        <Container className="relative z-10 py-20 md:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <SectionBadge>Discover the world with Wanderlust</SectionBadge>

              <h1 className="mt-6 max-w-2xl text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
                Find the perfect stay for every journey
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
                Explore premium homes, cozy escapes, and unforgettable stays
                designed for travelers who want comfort, style, and trust in
                every booking.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  variant="light"
                  icon
                  onClick={() => navigate("/listings")}
                >
                  Explore Listings
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate(user ? "/profile" : "/register")}
                >
                  {user ? "View Profile" : "Get Started"}
                </Button>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard number="10K+" label="Unique stays listed" />
                <StatCard number="4.9/5" label="Average guest rating" />
                <StatCard number="100+" label="Cities to explore" />
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
                <div className="overflow-hidden rounded-[1.5rem] bg-white text-gray-900 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
                    alt="Luxury stay interior"
                    className="h-[260px] w-full object-cover md:h-[320px]"
                  />

                  <div className="space-y-4 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold">
                          Luxury Ocean Villa
                        </h3>
                        <p className="text-sm text-gray-500">Goa, India</p>
                      </div>
                      <div className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700">
                        4.9 ★
                      </div>
                    </div>

                    <p className="text-sm leading-6 text-gray-600">
                      Wake up to sea views, premium comfort, and a stay designed
                      for unforgettable moments.
                    </p>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                      <div>
                        <p className="text-sm text-gray-500">Starting from</p>
                        <p className="text-xl font-bold text-indigo-600">
                          ₹4,999/night
                        </p>
                      </div>

                      <button
                        onClick={() => navigate("/listings")}
                        className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur-md md:block">
                Trusted by thousands of travelers
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FEATURES */}
      <section className="py-20 md:py-24 bg-gray-50">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <SectionBadge>Why travelers choose us</SectionBadge>
            <h2 className="mt-4 text-3xl font-black text-gray-900 md:text-4xl">
              Everything you need for a better booking experience
            </h2>
            <p className="mt-4 text-base leading-7 text-gray-600">
              Wanderlust combines discovery, comfort, trust, and seamless
              booking into one beautiful travel experience.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                Icon={feature.icon}
                title={feature.title}
                desc={feature.desc}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* DISCOVERY STRIP */}
      <section className="py-20">
        <Container>
          <div className="grid gap-8 rounded-[2rem] bg-gradient-to-r from-indigo-50 via-white to-purple-50 p-8 md:grid-cols-2 md:p-12">
            <div>
              <h2 className="text-3xl font-black text-gray-900 md:text-4xl">
                Travel smarter, stay better
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-gray-600">
                From weekend escapes to long vacations, discover spaces that
                match your lifestyle, budget, and mood with ease.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
                  Verified stays
                </span>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
                  Instant booking
                </span>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
                  Trusted reviews
                </span>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
                  Premium comfort
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Fast search</p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">Easy</h3>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Guest trust</p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">High</h3>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">Best stays</p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                  Curated
                </h3>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <p className="text-sm font-medium text-gray-500">
                  Booking flow
                </p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">
                  Secure
                </h3>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gray-950 py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_35%)]" />

        <Container className="relative z-10 text-center">
          <SectionBadge>Start your next adventure</SectionBadge>

          <h2 className="mt-5 text-3xl font-black md:text-5xl">
            Ready to book your next stay?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/75 md:text-lg">
            Explore top-rated stays, discover new destinations, and enjoy a
            booking experience built for modern travelers.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {user ? (
              <Button
                variant="primary"
                icon
                onClick={() => navigate("/listings")}
              >
                Browse Listings
              </Button>
            ) : (
              <>
                <Button variant="primary" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button variant="outline" onClick={() => navigate("/register")}>
                  Create Account
                </Button>
              </>
            )}
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Home;
