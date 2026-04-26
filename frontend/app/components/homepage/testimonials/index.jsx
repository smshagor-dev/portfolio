"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { buildPublicApiUrl, getSocketServerUrl } from "@/lib/public-backend-url";
import SectionHeading from "../section-heading";

const socketServerUrl = getSocketServerUrl();

const fallbackTestimonials = [
  {
    id: "fallback-1",
    name: "Client Feedback",
    company: "Trusted Partner",
    position: "Your published reviews",
    image: "/image/review.png",
    content:
      "<p>Testimonials will appear here as soon as you publish them from the admin panel or receive a live public review.</p>",
    createdAt: null,
    stars: 5,
  },
];

function formatDate(value) {
  if (!value) {
    return "Recent feedback";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function createStatus(type = "", message = "") {
  return { type, message };
}

function buildEmptyForm() {
  return {
    name: "",
    company: "",
    position: "",
    content: "",
    stars: 5,
    image: "",
  };
}

function getInitials(name = "") {
  return String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function getVisibleCount(width = 0) {
  if (width >= 1024) {
    return 3;
  }

  return 1;
}

function StarRow({ stars = 5 }) {
  return (
    <div className="shrink-0 text-sm tracking-[0.2em] text-[#ffd27d]">
      {"★".repeat(Math.max(1, Math.min(5, Number(stars) || 5)))}
    </div>
  );
}

export default function TestimonialsSection({
  testimonials = [],
  showAllReviews = false,
  showViewAllButton = false,
  ctaPosition = "bottom",
}) {
  const [items, setItems] = useState((testimonials || []).filter((item) => item?.content));
  const [form, setForm] = useState(buildEmptyForm());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState(createStatus());
  const [currentSlide, setCurrentSlide] = useState(0);
  const [failedImages, setFailedImages] = useState({});
  const [activeTestimonial, setActiveTestimonial] = useState(null);
  const [visibleCount, setVisibleCount] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isTrackTransitionEnabled, setIsTrackTransitionEnabled] = useState(true);
  const touchStartXRef = useRef(0);
  const touchDeltaRef = useRef(0);

  useEffect(() => {
    setItems((testimonials || []).filter((item) => item?.content));
  }, [testimonials]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const updateVisibleCount = () => {
      setVisibleCount(getVisibleCount(window.innerWidth));
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);

    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  useEffect(() => {
    const socket = io(socketServerUrl, {
      transports: ["websocket", "polling"],
    });

    socket.emit("testimonials:join");

    socket.on("testimonial:created", (payload) => {
      if (!payload?.testimonial) {
        return;
      }

      setItems((current) => {
        if (current.some((item) => item.id === payload.testimonial.id)) {
          return current;
        }

        return [payload.testimonial, ...current];
      });
    });

    return () => {
      socket.emit("testimonials:leave");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const sourceItems = items.length ? items : fallbackTestimonials;
    const maxSlide = Math.max(sourceItems.length, 0);

    if (maxSlide === 0 || isPaused) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setIsTrackTransitionEnabled(true);
      setCurrentSlide((current) => current + 1);
    }, 4800);

    return () => window.clearInterval(interval);
  }, [isPaused, items]);

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(buildPublicApiUrl("/api/site/testimonials/upload-image"), {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Image upload failed.");
      }

      setForm((current) => ({
        ...current,
        image: data.path,
      }));
      toast.success("Review photo uploaded.");
    } catch (error) {
      toast.error(error.message || "Image upload failed.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim() || !form.company.trim() || !form.position.trim() || !form.content.trim()) {
      setStatus(createStatus("error", "Name, company, position, and review are required."));
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus(createStatus());

      const response = await fetch(buildPublicApiUrl("/api/site/testimonials"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          company: form.company.trim(),
          position: form.position.trim(),
          content: form.content.trim(),
          stars: Number(form.stars) || 5,
          image: form.image,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to publish review.");
      }

      setItems((current) => {
        if (current.some((item) => item.id === data.testimonial.id)) {
          return current;
        }

        return [data.testimonial, ...current];
      });
      setForm(buildEmptyForm());
      setIsModalOpen(false);
      setStatus(createStatus());
      toast.success("Your review is now live.");
    } catch (error) {
      setStatus(createStatus("error", error.message || "Failed to publish review."));
    } finally {
      setIsSubmitting(false);
    }
  }

  const sliderItems = items.length ? items : fallbackTestimonials;
  const loopedSliderItems = sliderItems.length > 1 ? [...sliderItems, ...sliderItems] : sliderItems;
  const maxSlide = Math.max(sliderItems.length - 1, 0);
  const slideGap = "1.5rem";
  const slideBasis = `calc((100% - (${slideGap} * ${Math.max(visibleCount - 1, 0)})) / ${visibleCount})`;
  const trackTransform = `translateX(calc(-${currentSlide} * (${slideBasis} + ${slideGap})))`;

  function goToSlide(index) {
    if (sliderItems.length <= 1) {
      setCurrentSlide(0);
      return;
    }

    setIsTrackTransitionEnabled(true);
    setCurrentSlide(((index % sliderItems.length) + sliderItems.length) % sliderItems.length);
  }

  function handleTrackTransitionEnd() {
    if (sliderItems.length <= 1 || currentSlide < sliderItems.length) {
      return;
    }

    setIsTrackTransitionEnabled(false);
    setCurrentSlide(currentSlide % sliderItems.length);
  }

  function renderShareCard() {
    return (
      <div className="flex justify-center">
        <div className="w-full max-w-2xl rounded-[1.7rem] border border-[#263a52] bg-[linear-gradient(180deg,rgba(12,20,35,0.88),rgba(9,15,26,0.96))] px-6 py-5 text-center shadow-[0_20px_55px_rgba(0,0,0,0.22)]">
          <p className="text-xs uppercase tracking-[0.32em] text-[#79d4ff]">Share Your Experience</p>
          <p className="mt-3 text-sm leading-7 text-[#aebed0] md:text-base">
            Worked with me on a product, redesign, or launch? Add a short review and let future clients see the experience from your side.
          </p>
          <div className="mt-5 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
            {showViewAllButton ? (
              <Link
                href="/reviews"
                className="inline-flex items-center justify-center rounded-full border border-[#3a5678] px-6 py-3 text-sm font-medium text-white transition hover:border-[#70d5ff] hover:text-[#70d5ff]"
              >
                View All Review
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center rounded-full border border-[#5ca88a] bg-[linear-gradient(135deg,#11271f,#163328)] px-6 py-3 text-sm font-semibold text-[#dff9ee] shadow-[0_16px_34px_rgba(8,20,17,0.32)] transition duration-300 hover:-translate-y-0.5 hover:border-[#7cf0b7] hover:bg-[linear-gradient(135deg,#143328,#1b4334)] hover:shadow-[0_20px_45px_rgba(9,28,22,0.42)]"
            >
              Add Your Review
            </button>
          </div>
        </div>
      </div>
    );
  }

  function handleTouchStart(event) {
    touchStartXRef.current = event.touches[0]?.clientX || 0;
    touchDeltaRef.current = 0;
  }

  function handleTouchMove(event) {
    touchDeltaRef.current = (event.touches[0]?.clientX || 0) - touchStartXRef.current;
  }

  function handleTouchEnd() {
    const threshold = 50;

    if (touchDeltaRef.current <= -threshold) {
      goToSlide(currentSlide + 1);
    } else if (touchDeltaRef.current >= threshold) {
      goToSlide(currentSlide - 1);
    }

    touchDeltaRef.current = 0;
  }

  return (
    <section id="testimonials" className="my-12 lg:my-20">
      <div className="overflow-hidden rounded-[2rem] border border-[#24344d] bg-[radial-gradient(circle_at_top,rgba(124,240,183,0.12),transparent_30%),linear-gradient(180deg,#10192b,#09111d)] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.24)] sm:p-5 md:p-8">
        <div className="flex flex-col items-center gap-5 text-center">
          <SectionHeading
            label="Testimonials"
            title={
              showAllReviews
                ? "Every published review, reaction, and trust signal in one place"
                : "Client reactions, team feedback, and practical trust earned through delivery"
            }
            description={
              showAllReviews
                ? "Browse the full collection of published reviews, then add your own experience if we have worked together."
                : "Short notes from collaborators and clients that reflect communication, execution quality, and the overall working experience."
            }
          />
        </div>

        {ctaPosition === "top" ? <div className="mt-8">{renderShareCard()}</div> : null}

        {showAllReviews ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sliderItems.map((item, index) => {
              const imageFailed = Boolean(failedImages[item.id]);
              const avatarLabel = getInitials(item.name || "Client");

              return (
                <button
                  key={`${item.id}-${index}`}
                  type="button"
                  onClick={() => setActiveTestimonial(item)}
                  className="group relative flex min-h-[22rem] w-full flex-col overflow-hidden rounded-[1.9rem] border border-[#2a3c54] bg-[linear-gradient(180deg,rgba(18,29,47,0.98),rgba(10,16,28,0.98))] p-6 text-left shadow-[0_24px_55px_rgba(0,0,0,0.24)] transition duration-500 hover:-translate-y-1 hover:border-[#7cf0b7]/60 hover:shadow-[0_34px_90px_rgba(4,10,20,0.42)]"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,240,183,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(112,213,255,0.14),transparent_28%)] opacity-80 transition duration-700 group-hover:opacity-100" />
                  <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(124,240,183,0.92),rgba(112,213,255,0.82),transparent)]" />
                  <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(112,213,255,0.82),rgba(124,240,183,0.92),transparent)]" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div className="min-w-0 flex items-center gap-4">
                      <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center overflow-hidden rounded-[1.3rem] border border-[#36506b] bg-[#102038] text-sm font-semibold uppercase tracking-[0.18em] text-[#8fe6c1] shadow-[0_10px_26px_rgba(0,0,0,0.22)]">
                        {!imageFailed && item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="h-[64px] w-[64px] object-cover"
                            unoptimized
                            onError={() =>
                              setFailedImages((current) => ({ ...current, [item.id]: true }))
                            }
                          />
                        ) : (
                          <span>{avatarLabel}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-white">{item.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.28em] text-[#7cf0b7]">
                          {item.company || "Client"}
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-[#8ba0b7]">
                          {item.position || "Reviewer"}
                        </p>
                      </div>
                    </div>

                    <StarRow stars={item.stars} />
                  </div>

                  <div
                    className="relative mt-6 text-sm leading-7 text-[#c5d3e2]"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />

                  <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-[#22334a] pt-4">
                    <span className="text-[11px] uppercase tracking-[0.24em] text-[#88a0ba]">
                      {formatDate(item.createdAt)}
                    </span>
                    <span className="rounded-full border border-[#305246] bg-[#0f211b] px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-[#a9edd0] transition duration-500 group-hover:border-[#56b88b] group-hover:bg-[#12281f]">
                      View full review
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <>
            <div
              className="mt-10"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div
                className="overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="flex snap-x snap-mandatory gap-6"
                  style={{
                    transform: trackTransform,
                    transition: isTrackTransitionEnabled
                      ? "transform 800ms cubic-bezier(.22,.61,.36,1)"
                      : "none",
                    willChange: "transform",
                    touchAction: "pan-y",
                  }}
                  onTransitionEnd={handleTrackTransitionEnd}
                >
                  {loopedSliderItems.map((item, index) => {
                    const imageFailed = Boolean(failedImages[item.id]);
                    const avatarLabel = getInitials(item.name || "Client");

                    return (
                      <div
                        key={`${item.id}-${index}`}
                        className="min-w-0 shrink-0 snap-start perspective-[1600px]"
                        style={{ flexBasis: slideBasis }}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveTestimonial(item)}
                          className="group relative flex h-full min-h-[22rem] w-full flex-col overflow-hidden rounded-[1.9rem] border border-[#2a3c54] bg-[linear-gradient(180deg,rgba(18,29,47,0.98),rgba(10,16,28,0.98))] p-6 text-left shadow-[0_24px_55px_rgba(0,0,0,0.24)] transition duration-700 [transform-style:preserve-3d] hover:border-[#7cf0b7]/60 hover:shadow-[0_34px_90px_rgba(4,10,20,0.42)] hover:[transform:rotateX(4deg)_rotateY(-4deg)_translateY(-8px)]"
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,240,183,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(112,213,255,0.14),transparent_28%)] opacity-80 transition duration-700 group-hover:opacity-100" />
                          <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(124,240,183,0.92),rgba(112,213,255,0.82),transparent)]" />
                          <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(112,213,255,0.82),rgba(124,240,183,0.92),transparent)]" />
                          <div className="absolute -left-8 top-4 h-20 w-20 rounded-full bg-[#7cf0b7]/10 blur-3xl transition duration-700 group-hover:bg-[#7cf0b7]/20" />
                          <div className="absolute -right-8 bottom-4 h-20 w-20 rounded-full bg-[#70d5ff]/10 blur-3xl transition duration-700 group-hover:bg-[#70d5ff]/20" />
                          <div className="pointer-events-none absolute right-5 top-5 text-[5rem] font-semibold leading-none text-white/5 transition duration-700 group-hover:text-white/10">
                            &quot;
                          </div>

                          <div className="relative flex items-start justify-between gap-4 [transform:translateZ(34px)]">
                            <div className="min-w-0 flex items-center gap-4">
                              <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center overflow-hidden rounded-[1.3rem] border border-[#36506b] bg-[#102038] text-sm font-semibold uppercase tracking-[0.18em] text-[#8fe6c1] shadow-[0_10px_26px_rgba(0,0,0,0.22)]">
                                {!imageFailed && item.image ? (
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    width={64}
                                    height={64}
                                    className="h-[64px] w-[64px] object-cover"
                                    unoptimized
                                    onError={() =>
                                      setFailedImages((current) => ({ ...current, [item.id]: true }))
                                    }
                                  />
                                ) : (
                                  <span>{avatarLabel}</span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-base font-semibold text-white">{item.name}</p>
                                <p className="mt-1 text-xs uppercase tracking-[0.28em] text-[#7cf0b7]">
                                  {item.company || "Client"}
                                </p>
                                <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-[#8ba0b7]">
                                  {item.position || "Reviewer"}
                                </p>
                              </div>
                            </div>

                            <StarRow stars={item.stars} />
                          </div>

                          <div
                            className="relative mt-6 text-sm leading-7 text-[#c5d3e2] [transform:translateZ(28px)]"
                            dangerouslySetInnerHTML={{ __html: item.content }}
                          />

                          <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-[#22334a] pt-4 [transform:translateZ(26px)]">
                            <span className="text-[11px] uppercase tracking-[0.24em] text-[#88a0ba]">
                              {formatDate(item.createdAt)}
                            </span>
                            <span className="rounded-full border border-[#305246] bg-[#0f211b] px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-[#a9edd0] transition duration-500 group-hover:border-[#56b88b] group-hover:bg-[#12281f]">
                              View full review
                            </span>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {maxSlide > 0 ? (
              <div className="mt-6 flex items-center justify-center gap-2">
                {Array.from({ length: maxSlide + 1 }, (_, index) => (
                  <button
                    key={`testimonial-group-${index}`}
                    type="button"
                    aria-label={`Show testimonial set ${index + 1}`}
                    onClick={() => goToSlide(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      currentSlide % Math.max(sliderItems.length, 1) === index
                        ? "w-8 bg-[#7cf0b7]"
                        : "w-2.5 bg-[#33506c] hover:bg-[#4b6f90]"
                    }`}
                  />
                ))}
              </div>
            ) : null}
          </>
        )}

        {ctaPosition !== "top" ? <div className="mt-8">{renderShareCard()}</div> : null}
      </div>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[120] flex items-start justify-center bg-[#020817]/80 px-4 py-6 backdrop-blur-sm md:py-8">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[1.9rem] border border-[#28405f] bg-[linear-gradient(180deg,#101b2f,#09111e)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:p-6">
            <div className="flex flex-col gap-4 border-b border-[#203049] pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[#79d4ff]">Live Review</p>
                <h4 className="mt-2 text-2xl font-semibold text-white">Share your client review</h4>
                <p className="mt-2 text-sm text-[#97a9be]">
                  Add your name, company, position, photo, rating, and review. It will appear live on the homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-[#334862] px-4 py-2 text-sm text-[#c1cfde] transition hover:border-[#4a678b]"
              >
                Close
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Name</label>
                  <input
                    className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="John Smith"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Company</label>
                  <input
                    className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                    value={form.company}
                    onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
                    placeholder="Northwind Studio"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Position</label>
                  <input
                    className="w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                    value={form.position}
                    onChange={(event) => setForm((current) => ({ ...current, position: event.target.value }))}
                    placeholder="CEO / Product Manager"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Rating</label>
                  <div className="flex items-center gap-2 rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        aria-label={`Set rating to ${star} star${star > 1 ? "s" : ""}`}
                        onClick={() => setForm((current) => ({ ...current, stars: star }))}
                        className={`text-2xl transition ${
                          star <= Number(form.stars) ? "text-[#ffd27d]" : "text-[#41536a] hover:text-[#9aaec3]"
                        }`}
                      >
                        {"★"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="block w-full cursor-pointer text-sm text-[#d3d8e8] file:mr-4 file:rounded-lg file:border-0 file:bg-[#2a8fd8] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#3aa1ea]"
                />
                <p className="mt-2 text-xs text-[#8ba0b7]">
                  {isUploading ? "Uploading image..." : form.image ? "Photo uploaded successfully." : "Optional profile image"}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#d7dfec]">Review</label>
                <textarea
                  className="min-h-[180px] w-full rounded-xl border border-[#2c3852] bg-[#101b2d] px-4 py-3 text-white outline-none transition focus:border-[#49c1ff]"
                  value={form.content}
                  onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                  placeholder="Write your experience working together..."
                />
              </div>

              {status.message ? (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    status.type === "success"
                      ? "border-[#2f624d] bg-[#10241c] text-[#9ff1c8]"
                      : "border-[#6a3440] bg-[#251118] text-[#ffc3cf]"
                  }`}
                >
                  {status.message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full rounded-xl bg-[linear-gradient(135deg,#2a8fd8,#57d0a0)] px-5 py-3 text-sm font-semibold text-[#08111d] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Publishing..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {activeTestimonial ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020817]/80 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[1.9rem] border border-[#28405f] bg-[linear-gradient(180deg,#101b2f,#09111e)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:p-6">
            <div className="flex flex-col gap-4 border-b border-[#203049] pb-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-[1.2rem] border border-[#36506b] bg-[#102038] text-base font-semibold uppercase tracking-[0.18em] text-[#8fe6c1]">
                  {failedImages[`${activeTestimonial.id}-modal`] || !activeTestimonial.image ? (
                    <span>{getInitials(activeTestimonial.name || "Client")}</span>
                  ) : (
                    <Image
                      src={activeTestimonial.image}
                      alt={activeTestimonial.name}
                      width={68}
                      height={68}
                      className="h-[68px] w-[68px] object-cover"
                      unoptimized
                      onError={() =>
                        setFailedImages((current) => ({ ...current, [`${activeTestimonial.id}-modal`]: true }))
                      }
                    />
                  )}
                </div>
                <div>
                  <p className="text-xl font-semibold text-white">{activeTestimonial.name}</p>
                  <p className="mt-1 text-sm text-[#97a9be]">
                    {activeTestimonial.company || "Client"}
                    {activeTestimonial.position ? ` - ${activeTestimonial.position}` : ""}
                  </p>
                  <div className="mt-2">
                    <StarRow stars={activeTestimonial.stars} />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTestimonial(null)}
                className="rounded-xl border border-[#334862] px-4 py-2 text-sm text-[#c1cfde] transition hover:border-[#4a678b]"
              >
                Close
              </button>
            </div>

            <div
              className="mt-5 text-sm leading-8 text-[#d2dceb]"
              dangerouslySetInnerHTML={{ __html: activeTestimonial.content }}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
