import TugonSenseNavbar from "../components/TugonSenseNavbar";
import CourseCard from "../components/CourseCard";
import ProgressMap from "../components/ProgressMap";
// Blank TugonSense foundation page
// Layout mirrors the target: left CourseCard, right ProgressMap (header + vertical nodes),
// plus a sticky bottom CTA/details card. Replace placeholders with your real components later.
// Suggested drop-ins:
// - <TugonSenseNavbar /> in the header
// - <CourseCard /> in the left card
// - <ProgressMap /> in the right column
// - Your CTA/details component in the sticky bottom card

export default function TugonSense() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header: TugonSenseNavbar */}
      <div className="sticky top-0 z-10">
        <TugonSenseNavbar />
      </div>

      {/* Main content */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: CourseCard */}
            <section className="lg:col-span-5">
              <CourseCard />
            </section>

            {/* Right: ProgressMap */}
            <aside className="lg:col-span-7">
              <ProgressMap />
            </aside>
          </div>
        </div>
      </main>

  {/* Page-level CTA removed; CTA now lives adjacent to the active node */}
    </div>
  );
}
