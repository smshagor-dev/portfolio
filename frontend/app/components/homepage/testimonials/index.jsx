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

  if (width >= 768) {
    return 2;
  }

  return 1;
}

function getSortedTestimonials(testimonials = []) {
  return [...(testimonials || [])]
    .filter((item) => item?.content)
    .sort((left, right) => {
      const leftTime = left?.createdAt ? new Date(left.createdAt).getTime() : 0;
      const rightTime = right?.createdAt ? new Date(right.createdAt).getTime() : 0;

      return rightTime - leftTime;
    });
}

function StarRow({ stars = 5 }) {
  return (
    <div className="shrink-0 text-sm tracking-[0.2em] text-[#ffd27d]">
      {"\u2605".repeat(Math.max(1, Math.min(5, Number(stars) || 5)))}
    </div>
  );
}

function TestimonialCard({ item, failedImages, setFailedImages, onOpen }) {
  const imageFailed = Boolean(failedImages[item.id]);
  const avatarLabel = getInitials(item.name || "Client");

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="group relative flex min-h-[22rem] w-full flex-col overflow-hidden rounded-[1.9rem] border border-[#2a3c54] bg-[linear-gradient(180deg,rgba(18,29,47,0.98),rgba(10,16,28,0.98))] p-6 text-left shadow-[0_24px_55px_rgba(0,0,0,0.24)] transition duration-700 hover:-translate-y-1 hover:border-[#7cf0b7]/60 hover:shadow-[0_34px_90px_rgba(4,10,20,0.42)]"
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
                onError={() => setFailedImages((current) => ({ ...current, [item.id]: true }))}
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
}

export default function TestimonialsSection({
  testimonials = [],
  showAllReviews = false,
  showViewAllButton = false,
  ctaPosition = "bottom",
}) {
  const [items, setItems] = useState(getSortedTestimonials(testimonials));
  const [viewportWidth, setViewportWidth] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const [form, setForm] = useState(buildEmptyForm());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState(createStatus());
  const [failedImages, setFailedImages] = useState({});
  const [activeTestimonial, setActiveTestimonial] = useState(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    setItems(getSortedTestimonials(testimonials));
  }, [testimonials]);

  useEffect(() => {
    const syncViewport = () => {
      setViewportWidth(window.innerWidth);
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);

    return () => window.removeEventListener("resize", syncViewport);
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

        return getSortedTestimonials([payload.testimonial, ...current]);
      });
    });

    return () => {
      socket.emit("testimonials:leave");
      socket.disconnect();
    };
  }, []);

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

        return getSortedTestimonials([data.testimonial, ...current]);
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
  const visibleCount = getVisibleCount(viewportWidth);
  const shouldAutoScroll = !showAllReviews && sliderItems.length > visibleCount;

  function getSlideStep() {
    const slider = sliderRef.current;

    if (!slider) {
      return 0;
    }

    const firstSlide = slider.querySelector("[data-testimonial-slide]");

    if (!firstSlide) {
      return 0;
    }

    const styles = window.getComputedStyle(slider);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;

    return firstSlide.getBoundingClientRect().width + gap;
  }

  function scrollTestimonials(direction = 1) {
    const slider = sliderRef.current;

    if (!slider) {
      return;
    }

    const step = getSlideStep();

    if (!step) {
      return;
    }

    const maxScrollLeft = Math.max(slider.scrollWidth - slider.clientWidth, 0);
    const nextLeft = slider.scrollLeft + step * direction;

    if (direction > 0 && nextLeft >= maxScrollLeft - step / 3) {
      slider.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    if (direction < 0 && slider.scrollLeft <= step / 3) {
      slider.scrollTo({ left: maxScrollLeft, behavior: "smooth" });
      return;
    }

    slider.scrollBy({
      left: step * direction,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    if (!shouldAutoScroll || isSliderPaused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const slider = sliderRef.current;

      if (!slider) {
        return;
      }

      const firstSlide = slider.querySelector("[data-testimonial-slide]");

      if (!firstSlide) {
        return;
      }

      const styles = window.getComputedStyle(slider);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
      const step = firstSlide.getBoundingClientRect().width + gap;
      const maxScrollLeft = Math.max(slider.scrollWidth - slider.clientWidth, 0);
      const nextLeft = slider.scrollLeft + step;

      if (nextLeft >= maxScrollLeft - step / 3) {
        slider.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }

      slider.scrollBy({
        left: step,
        behavior: "smooth",
      });
    }, 4200);

    return () => window.clearInterval(intervalId);
  }, [isSliderPaused, shouldAutoScroll, visibleCount]);

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
            {sliderItems.map((item, index) => (
              <TestimonialCard
                key={`${item.id}-${index}`}
                item={item}
                failedImages={failedImages}
                setFailedImages={setFailedImages}
                onOpen={setActiveTestimonial}
              />
            ))}
          </div>
        ) : (
          <div className="relative mt-10">
            {shouldAutoScroll ? (
              <>
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#10192b] to-transparent sm:w-14" />
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#09111d] to-transparent sm:w-14" />
                <div className="mb-6 flex justify-center">
                  <div className="relative z-20 inline-flex items-center gap-3 rounded-full border border-[#2e4562] bg-[linear-gradient(180deg,rgba(11,20,35,0.96),rgba(8,15,27,0.96))] px-3 py-3 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                    <button
                      type="button"
                      onClick={() => scrollTestimonials(-1)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#35516d] bg-[#101b2b] text-lg text-[#d8e6f3] transition hover:-translate-y-0.5 hover:border-[#7cf0b7] hover:text-[#7cf0b7]"
                      aria-label="Show previous testimonials"
                    >
                      &#8592;
                    </button>
                    <div className="min-w-[7rem] px-2 text-center">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-[#79d4ff]">
                        Slide Reviews
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => scrollTestimonials(1)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#35516d] bg-[#101b2b] text-lg text-[#d8e6f3] transition hover:-translate-y-0.5 hover:border-[#7cf0b7] hover:text-[#7cf0b7]"
                      aria-label="Show next testimonials"
                    >
                      &#8594;
                    </button>
                  </div>
                </div>
                <div
                  ref={sliderRef}
                  className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 py-2 sm:gap-5"
                  onMouseEnter={() => setIsSliderPaused(true)}
                  onMouseLeave={() => setIsSliderPaused(false)}
                  onTouchStart={() => setIsSliderPaused(true)}
                  onTouchEnd={() => setIsSliderPaused(false)}
                >
                  {sliderItems.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      data-testimonial-slide
                      className="w-[88vw] shrink-0 snap-start max-w-[28rem] sm:w-[30rem] lg:w-[24rem]"
                    >
                      <TestimonialCard
                        item={item}
                        failedImages={failedImages}
                        setFailedImages={setFailedImages}
                        onOpen={setActiveTestimonial}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sliderItems.map((item, index) => (
                  <TestimonialCard
                    key={`${item.id}-${index}`}
                    item={item}
                    failedImages={failedImages}
                    setFailedImages={setFailedImages}
                    onOpen={setActiveTestimonial}
                  />
                ))}
              </div>
            )}
          </div>
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
                        {"\u2605"}
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
