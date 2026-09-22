import { useRef, useEffect } from "react";

export default function NewfarmSlideshow({ articles, loading, error, state }) {
  const carouselRef = useRef(null);

  // Automatic scrolling
  useEffect(() => {
    if (!carouselRef.current || articles.length === 0) return;

    const scrollAmount = carouselRef.current.offsetWidth / 3; // scroll by one card width
    let scrollLeft = 0;

    const interval = setInterval(() => {
      if (!carouselRef.current) return;

      scrollLeft += scrollAmount;

      if (scrollLeft >= carouselRef.current.scrollWidth) {
        scrollLeft = 0; // loop back
      }

      carouselRef.current.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }, 3000); // every 3 seconds

    return () => clearInterval(interval);
  }, [articles]);

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xl shadow-md">
          📰
        </div>
        <div className="ml-3">
          <h2 className="text-xl font-bold text-gray-800">
            Agriculture News {state ? `- ${state}` : ""}
          </h2>
          <p className="text-sm text-gray-500">Latest updates from the farming world</p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 border border-red-200 rounded-xl">
          {error}
        </div>
      )}

      {/* Carousel */}
      {!loading && articles.length > 0 && (
        <div
          ref={carouselRef}
          className="flex overflow-hidden gap-4 snap-x snap-mandatory pb-4"
        >
          {articles.map((article, idx) => (
            <a
              key={idx}
              href={article.link || "#"}
              target="_blank"
              rel="noreferrer"
              className="flex-shrink-0 w-1/3 snap-start bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-40 w-full">
                <img
                  src={article.image_url || "/default_news.jpg"}
                  alt={article.title}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                  {article.source_name || "Unknown"}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                  {article.title}
                </h3>
                {article.description && (
                  <p className="text-gray-600 text-xs line-clamp-3 mb-2">
                    {article.description}
                  </p>
                )}
                {article.pubDate && (
                  <p className="text-gray-400 text-xs">
                    {new Date(article.pubDate).toLocaleDateString()} |{" "}
                    {new Date(article.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && articles.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-2xl shadow-sm mt-4">
          <div className="text-4xl mb-2">📰</div>
          <div className="text-lg font-semibold text-gray-800 mb-1">No news found</div>
          <div className="text-gray-500 text-center">
            Select a field or check back later for agriculture news in your area.
          </div>
        </div>
      )}
    </div>
  );
}
