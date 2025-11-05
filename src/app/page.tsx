export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <div className="text-center py-16 px-4">
        <h1 className="text-5xl font-bold mb-4">
          MAPPING FOR
          <span className="text-red-500"> SOCIAL JUSTICE</span>
        </h1>

        <p className="hero-descriptor text-gray-600 max-w-xl mx-auto mb-8">
          Explore how mapping and spatial visualization can enhance
          understanding and advocacy for social justice.
        </p>

        <div className="mt-16 max-w-6xl mx-auto px-4">
          <div className="bg-gray-100 rounded-xl overflow-hidden shadow-lg">
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-700 font-semibold text-lg">
                  Platform Overview
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
