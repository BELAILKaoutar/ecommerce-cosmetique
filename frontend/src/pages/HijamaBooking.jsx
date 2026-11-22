import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Store,
  User,
} from "lucide-react";
import { BYWIJO_SERVICES, HIJAMA_QUOTE, WHATSAPP_URL } from "../config/site";
import PageContainer from "../components/ui/PageContainer";
import {
  getAvailableDates,
  getAvailableSlots,
  createAppointment,
} from "../api/booking";
import { getServices } from "../api/services";

// ─── Helpers ────────────────────────────────────────────────────────────────

const PHONE_REGEX = /^(\+?212|0)[5-9]\d{8}$/;

/** "2026-11-18" → "lundi 18 novembre 2026" */
function formatDateFr(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** "2026-11-18T09:00:00.000Z" → "09:00" (local time display) */
function formatTime(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  return d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function buildWhatsAppMessage({ customerName, phone, service, serviceType, address, date, slot }) {
  const serviceNameFr = service?.nameFr || "";
  const serviceNameAr = service?.nameAr || "";
  const typeLine = serviceType === "DOMICILE" ? "À domicile" : "Au centre";
  const hour = slot ? formatTime(slot.startAt) : "";
  const dateFr = formatDateFr(date);

  let msg = `Bonjour By Wijo – Love Your Body 🌸\n\nJe souhaite réserver une prestation.\n\n`;
  msg += `👤 Nom : ${customerName}\n`;
  msg += `📞 Téléphone : ${phone}\n`;
  msg += `💆 Prestation : ${serviceNameFr} (${serviceNameAr})\n`;
  msg += `📍 Type : ${typeLine}\n`;
  if (serviceType === "DOMICILE" && address) msg += `🏠 Adresse : ${address}\n`;
  msg += `📅 Date : ${dateFr}\n`;
  msg += `🕒 Heure : ${hour}\n`;
  msg += `\nMerci de me confirmer la disponibilité de mon rendez-vous.`;
  return msg;
}

// ─── Step indicator ──────────────────────────────────────────────────────────

const STEP_LABELS = [
  "Informations",
  "Prestation",
  "Calendrier",
  "Heure",
];

function StepBar({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold border-2 transition-all ${
                  done
                    ? "bg-forest border-forest text-ivory"
                    : active
                    ? "bg-forest border-forest text-ivory scale-110 shadow-md"
                    : "bg-cream border-gold/50 text-muted"
                }`}
              >
                {done ? <CheckCircle2 size={18} /> : step}
              </div>
              <span
                className={`mt-1 hidden sm:block text-[10px] font-semibold tracking-wide ${
                  active ? "text-forest" : "text-muted"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`h-0.5 w-8 sm:w-14 mx-1 mt-[-12px] sm:mt-[-20px] transition-all ${
                  done ? "bg-forest" : "bg-gold/40"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Field wrapper ───────────────────────────────────────────────────────────

function Field({ label, error, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-forest">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-2xl border border-gold/50 bg-cream py-3 px-4 text-sm outline-none focus:border-forest transition placeholder:text-muted/60";

// ─── Calendar ────────────────────────────────────────────────────────────────

const DAYS_HEADER = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function Calendar({ availableDates, selectedDate, onSelect }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const availableSet = new Set(availableDates || []);

  // first day of month (0=Sun … 6=Sat)
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  function pad(n) { return String(n).padStart(2, "0"); }

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-cream text-forest hover:border-forest transition"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="font-heading text-lg text-forest font-semibold">
          {MONTHS_FR[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-cream text-forest hover:border-forest transition"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_HEADER.map((h) => (
          <div key={h} className="text-center text-[10px] font-bold uppercase tracking-wider text-muted py-1">
            {h}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
          const cellDate = new Date(viewYear, viewMonth, day);
          const isPast = cellDate < today;
          const isAvailable = availableSet.has(dateStr);
          const isSelected = dateStr === selectedDate;

          let cls = "flex h-9 w-full items-center justify-center rounded-xl text-sm font-medium transition ";

          if (isSelected) {
            cls += "bg-forest text-ivory shadow-md";
          } else if (isPast) {
            cls += "text-muted/40 cursor-not-allowed";
          } else if (isAvailable) {
            cls += "bg-cream border border-forest/50 text-forest cursor-pointer hover:bg-forest hover:text-ivory";
          } else {
            cls += "text-muted/50 line-through cursor-not-allowed";
          }

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isPast || !isAvailable}
              onClick={() => isAvailable && !isPast && onSelect(dateStr)}
              className={cls}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function HijamaBooking() {
  // Steps: 1=info, 2=service, 3=calendar, 4=slots, 5=confirm, 6=success
  const [step, setStep] = useState(1);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState("CENTRE"); // "CENTRE" | "DOMICILE"
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedService, setSelectedService] = useState(null); // { id, nameFr, nameAr, emoji }
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);

  // API state
  const [apiServices, setApiServices] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Validation errors
  const [errors, setErrors] = useState({});

  // Build merged service list (5 first, exclude domicile)
  const localServices = BYWIJO_SERVICES.filter((s) => s.id !== "domicile").slice(0, 5);
  const mergedServices = localServices.map((local) => {
    const api = apiServices.find((a) => a.name?.toLowerCase().includes(local.nameFr.toLowerCase().split(" ")[0]));
    return {
      id: local.id,
      nameFr: api?.name || local.nameFr,
      nameAr: local.nameAr,
      emoji: local.emoji,
      apiId: api?.id || null,
    };
  });

  // Load API services on mount (step 2)
  useEffect(() => {
    getServices().then((data) => setApiServices(data || [])).catch(() => {});
  }, []);

  // Load available dates on mount
  useEffect(() => {
    setLoadingDates(true);
    getAvailableDates()
      .then((dates) => setAvailableDates(dates || []))
      .catch(() => setAvailableDates([]))
      .finally(() => setLoadingDates(false));
  }, []);

  // Load slots when date is selected
  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setAvailableSlots([]);
    setSelectedSlot(null);
    getAvailableSlots(selectedDate)
      .then((slots) => setAvailableSlots(slots || []))
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  // ── Validation ──────────────────────────────────────────────────────────────

  function validateStep1() {
    const e = {};
    if (!customerName.trim() || customerName.trim().length < 2)
      e.customerName = "Le nom doit contenir au moins 2 caractères.";
    if (!phone.trim() || !PHONE_REGEX.test(phone.trim()))
      e.phone = "Format marocain requis : 06XXXXXXXX ou +212XXXXXXXXX";
    if (serviceType === "DOMICILE" && !address.trim())
      e.address = "L'adresse est obligatoire pour le service à domicile.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    if (!selectedService) {
      setErrors({ service: "Veuillez choisir une prestation." });
      return false;
    }
    setErrors({});
    return true;
  }

  // ── Navigation ──────────────────────────────────────────────────────────────

  function handleNext() {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => s + 1);
  }

  function handleBack() {
    setErrors({});
    setStep((s) => s - 1);
  }

  // When date selected on step 3, auto-advance to step 4
  function handleDateSelect(date) {
    setSelectedDate(date);
    setStep(4);
  }

  // When slot selected on step 4, auto-advance to confirm
  function handleSlotSelect(slot) {
    setSelectedSlot(slot);
    setStep(5);
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleConfirm() {
    if (!selectedSlot) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await createAppointment({
        slotId: selectedSlot.id,
        customerName: customerName.trim(),
        phone: phone.trim(),
        serviceType,
        address: serviceType === "DOMICILE" ? address.trim() : undefined,
        notes: notes.trim() || undefined,
      });

      // Open WhatsApp
      const msg = buildWhatsAppMessage({
        customerName: customerName.trim(),
        phone: phone.trim(),
        service: selectedService,
        serviceType,
        address: address.trim(),
        date: selectedDate,
        slot: selectedSlot,
      });
      window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`, "_blank");
      setStep(6);
    } catch (err) {
      if (err.status === 409) {
        setSubmitError("Ce créneau vient d'être réservé. Veuillez en choisir un autre.");
        setStep(3);
        setSelectedSlot(null);
        setSelectedDate("");
      } else {
        setSubmitError(err.message || "Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const containerClass =
    "rounded-3xl border border-gold/40 bg-ivory shadow-xs p-6 sm:p-10";

  // Success screen
  if (step === 6) {
    return (
      <div className="min-h-screen bg-cream py-12 px-4">
        <PageContainer>
          <div className={`${containerClass} text-center max-w-lg mx-auto`}>
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-forest/10 text-forest">
                <CheckCircle2 size={48} />
              </div>
            </div>
            <h1 className="font-heading text-3xl text-forest mb-3">Demande envoyée !</h1>
            <p className="text-muted text-sm mb-6">
              Votre demande de réservation a été enregistrée et le message WhatsApp a été préparé.
              Notre équipe vous confirmera votre rendez-vous très prochainement.
            </p>
            <button
              onClick={() => {
                setStep(1);
                setCustomerName(""); setPhone(""); setAddress(""); setNotes("");
                setSelectedService(null); setSelectedDate(""); setSelectedSlot(null);
                setServiceType("CENTRE");
              }}
              className="bg-forest text-ivory rounded-full px-6 py-3 text-sm font-semibold hover:bg-forest/90 transition"
            >
              Faire une autre réservation
            </button>
          </div>
        </PageContainer>

        <section className="bg-gold/20 border-t border-gold/40 py-8 px-5 mt-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-heading text-2xl text-forest" dir="rtl" lang="ar">
              « {HIJAMA_QUOTE} »
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <section className="bg-forest py-12 px-5 text-center text-ivory">
        <h1 className="font-heading text-4xl sm:text-5xl mb-2">Réserver une séance</h1>
        <p className="text-sage text-sm">By Wijo – Love Your Body</p>
      </section>

      <section className="py-10 px-4">
        <div className="mx-auto max-w-2xl">
          {/* Progress bar */}
          {step <= 4 && <StepBar current={step} />}

          {/* Error banner */}
          {submitError && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* ── STEP 1: Personal info ─────────────────────────────────── */}
          {step === 1 && (
            <div className={containerClass}>
              <h2 className="font-heading text-2xl text-forest mb-6">Vos informations</h2>
              <div className="flex flex-col gap-5">

                {/* Name */}
                <Field label="Nom et prénom" required error={errors.customerName}>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3.5 text-muted" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex: Fatima Zahra El Mansouri"
                      className={`${inputClass} pl-10 ${errors.customerName ? "border-red-300" : ""}`}
                    />
                  </div>
                </Field>

                {/* Phone */}
                <Field label="Téléphone" required error={errors.phone}>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-3.5 text-muted" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06XXXXXXXX ou +212XXXXXXXXX"
                      className={`${inputClass} pl-10 ${errors.phone ? "border-red-300" : ""}`}
                    />
                  </div>
                </Field>

                {/* Service type */}
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-forest">
                    Type de prestation <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setServiceType("CENTRE")}
                      className={`flex items-center gap-3 rounded-2xl border p-4 text-left text-sm font-medium transition ${
                        serviceType === "CENTRE"
                          ? "border-forest bg-forest/10 text-forest"
                          : "border-gold/50 bg-cream text-charcoal hover:border-forest/40"
                      }`}
                    >
                      <Store size={20} className="shrink-0" />
                      <div>
                        <p className="font-semibold">Au centre</p>
                        <p className="text-xs text-muted">Iziki, Marrakech</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setServiceType("DOMICILE")}
                      className={`flex items-center gap-3 rounded-2xl border p-4 text-left text-sm font-medium transition ${
                        serviceType === "DOMICILE"
                          ? "border-forest bg-forest/10 text-forest"
                          : "border-gold/50 bg-cream text-charcoal hover:border-forest/40"
                      }`}
                    >
                      <Home size={20} className="shrink-0" />
                      <div>
                        <p className="font-semibold">À domicile</p>
                        <p className="text-xs text-muted">Sur Marrakech</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Address (if domicile) */}
                {serviceType === "DOMICILE" && (
                  <Field label="Votre adresse complète" required error={errors.address}>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-3.5 text-muted" />
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Quartier, rue, numéro… (Marrakech)"
                        rows={2}
                        className={`${inputClass} pl-10 resize-none ${errors.address ? "border-red-300" : ""}`}
                      />
                    </div>
                  </Field>
                )}

                {/* Notes */}
                <Field label="Notes (facultatif)">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Informations complémentaires, précisions sur votre état de santé…"
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </Field>

                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-forest text-ivory rounded-full px-6 py-3 text-sm font-semibold hover:bg-forest/90 transition w-full"
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Choose service ───────────────────────────────── */}
          {step === 2 && (
            <div className={containerClass}>
              <h2 className="font-heading text-2xl text-forest mb-2">Choisir une prestation</h2>
              <p className="text-muted text-sm mb-6">Sélectionnez le soin souhaité</p>

              {errors.service && (
                <p className="mb-4 flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle size={14} /> {errors.service}
                </p>
              )}

              <div className="flex flex-col gap-3 mb-6">
                {mergedServices.map((svc) => {
                  const isSelected = selectedService?.id === svc.id;
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => setSelectedService(svc)}
                      className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? "border-forest bg-forest/10"
                          : "border-gold/40 bg-cream hover:border-forest/40"
                      }`}
                    >
                      <span className="text-3xl">{svc.emoji}</span>
                      <div className="flex flex-col">
                        <span
                          className="text-base font-medium text-charcoal"
                          dir="rtl"
                          lang="ar"
                        >
                          {svc.nameAr}
                        </span>
                        <span className="text-sm text-muted">{svc.nameFr}</span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 size={20} className="ml-auto text-forest shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 rounded-full border border-gold/50 bg-cream py-3 text-sm font-semibold text-charcoal hover:border-forest/40 transition"
                >
                  ← Précédent
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-forest text-ivory rounded-full px-6 py-3 text-sm font-semibold hover:bg-forest/90 transition"
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Calendar ─────────────────────────────────────── */}
          {step === 3 && (
            <div className={containerClass}>
              <h2 className="font-heading text-2xl text-forest mb-2">Choisir une date</h2>
              <p className="text-muted text-sm mb-6">Sélectionnez un jour disponible</p>

              {loadingDates ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={36} className="animate-spin text-forest" />
                </div>
              ) : (
                <Calendar
                  availableDates={availableDates}
                  selectedDate={selectedDate}
                  onSelect={handleDateSelect}
                />
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 rounded-full border border-gold/50 bg-cream py-3 text-sm font-semibold text-charcoal hover:border-forest/40 transition"
                >
                  ← Précédent
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Time slots ───────────────────────────────────── */}
          {step === 4 && (
            <div className={containerClass}>
              <h2 className="font-heading text-2xl text-forest mb-1">Choisir l'heure</h2>
              <p className="text-muted text-sm mb-6">
                Créneaux disponibles le <strong className="text-charcoal">{formatDateFr(selectedDate)}</strong>
              </p>

              {loadingSlots ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={36} className="animate-spin text-forest" />
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="rounded-2xl border border-gold/40 bg-cream/60 p-6 text-center text-sm text-muted">
                  <Clock size={32} className="mx-auto mb-3 text-muted/50" />
                  Aucun créneau disponible pour cette date. Veuillez choisir une autre date.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot?.id === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => handleSlotSelect(slot)}
                        className={`flex flex-col items-center justify-center rounded-2xl border py-3 px-2 text-sm font-semibold transition ${
                          isSelected
                            ? "bg-forest text-ivory border-forest shadow-md"
                            : "bg-cream border-gold/50 text-charcoal hover:border-forest hover:text-forest"
                        }`}
                      >
                        <Clock size={14} className="mb-1 opacity-70" />
                        {formatTime(slot.startAt)}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 rounded-full border border-gold/50 bg-cream py-3 text-sm font-semibold text-charcoal hover:border-forest/40 transition"
                >
                  ← Changer de date
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 5: Summary + confirm ────────────────────────────── */}
          {step === 5 && (
            <div className={containerClass}>
              <h2 className="font-heading text-2xl text-forest mb-6">Récapitulatif</h2>

              <div className="rounded-2xl border border-gold/30 bg-cream/60 divide-y divide-gold/20 mb-6">
                {[
                  { label: "Nom", value: customerName },
                  { label: "Téléphone", value: phone },
                  { label: "Prestation", value: selectedService ? `${selectedService.emoji} ${selectedService.nameFr}` : "—" },
                  { label: "Type", value: serviceType === "DOMICILE" ? "À domicile" : "Au centre" },
                  ...(serviceType === "DOMICILE" && address ? [{ label: "Adresse", value: address }] : []),
                  { label: "Date", value: formatDateFr(selectedDate) },
                  { label: "Heure", value: selectedSlot ? formatTime(selectedSlot.startAt) : "—" },
                  ...(notes ? [{ label: "Notes", value: notes }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-3 px-4 py-3 text-sm">
                    <span className="text-muted font-medium">{label}</span>
                    <span className="text-charcoal text-right">{value}</span>
                  </div>
                ))}
              </div>

              {/* Aperçu WhatsApp */}
              <div className="rounded-2xl border border-sage/40 bg-sage/10 p-4 mb-6">
                <p className="text-xs font-semibold text-forest uppercase tracking-wider mb-2">
                  Aperçu du message WhatsApp
                </p>
                <pre className="whitespace-pre-wrap text-xs text-charcoal/80 font-sans leading-relaxed">
                  {buildWhatsAppMessage({
                    customerName: customerName.trim(),
                    phone: phone.trim(),
                    service: selectedService,
                    serviceType,
                    address: address.trim(),
                    date: selectedDate,
                    slot: selectedSlot,
                  })}
                </pre>
              </div>

              {submitError && (
                <div className="mb-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  {submitError}
                </div>
              )}

              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] py-4 text-sm font-bold text-white shadow-lg transition hover:bg-[#1a9e4e] active:scale-[0.98] disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <MessageCircle size={20} />
                )}
                {submitting ? "Envoi en cours…" : "Confirmer ma demande via WhatsApp"}
              </button>

              <p className="mt-3 text-center text-xs text-muted">
                En cliquant, WhatsApp s'ouvrira avec votre message prérempli.
                La réservation sera confirmée après validation par notre équipe.
              </p>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex-1 rounded-full border border-gold/50 bg-cream py-3 text-sm font-semibold text-charcoal hover:border-forest/40 transition"
                >
                  ← Modifier
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Hadith quote */}
      <section className="bg-gold/20 border-t border-gold/40 py-8 px-5">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-heading text-2xl text-forest" dir="rtl" lang="ar">
            « {HIJAMA_QUOTE} »
          </p>
        </div>
      </section>
    </div>
  );
}
