"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { GraduationCap, Search, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  fetchFormConfig,
  submitApplication,
  checkStatus,
  type FormConfig,
  type ApplicationResult,
  type ApplicationStatus,
} from "./api";

// ── Status badge colours ────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-800",
  DOCUMENTS_PENDING: "bg-amber-100 text-amber-800",
  TEST_SCHEDULED: "bg-purple-100 text-purple-800",
  TEST_COMPLETED: "bg-indigo-100 text-indigo-800",
  OFFERED: "bg-emerald-100 text-emerald-800",
  WAITLISTED: "bg-orange-100 text-orange-800",
  REJECTED: "bg-red-100 text-red-800",
  CONFIRMED: "bg-green-100 text-green-800",
  ENROLLED: "bg-teal-100 text-teal-800",
  EXPIRED: "bg-gray-100 text-gray-600",
  WITHDRAWN: "bg-gray-100 text-gray-600",
};

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const RELATION_OPTIONS = [
  { value: "FATHER", label: "Father" },
  { value: "MOTHER", label: "Mother" },
  { value: "GUARDIAN", label: "Guardian" },
  { value: "OTHER", label: "Other" },
];

// ── Field wrapper ───────────────────────────────────────────
function Field({
  label,
  required,
  error,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label className="text-label font-medium text-fg">
        {label}
        {required && <span className="ml-0.5 text-error">*</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-caption text-error">
          {error}
        </p>
      )}
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────
export default function PublicAdmissionPage() {
  const params = useParams<{ schoolCode: string }>();
  const schoolCode = params.schoolCode;

  const [tab, setTab] = useState<"apply" | "status">("apply");
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [configError, setConfigError] = useState("");
  const [loading, setLoading] = useState(true);

  // Form state
  const [branchId, setBranchId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [classId, setClassId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [previousSchool, setPreviousSchool] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianRelation, setGuardianRelation] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianCnic, setGuardianCnic] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState<ApplicationResult | null>(null);

  // Status checker
  const [statusQuery, setStatusQuery] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusResult, setStatusResult] = useState<ApplicationStatus | null>(null);

  // Filter sessions by branch
  const filteredSessions = useMemo(
    () => (config?.sessions ?? []).filter((s) => s.branchId === branchId),
    [config?.sessions, branchId],
  );

  useEffect(() => {
    fetchFormConfig(schoolCode)
      .then(setConfig)
      .catch((err) => setConfigError(err.message))
      .finally(() => setLoading(false));
  }, [schoolCode]);

  // Reset session when branch changes
  useEffect(() => {
    setSessionId("");
  }, [branchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    try {
      const data = {
        branchId,
        sessionId,
        classId,
        child: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          dob,
          gender,
          previousSchool: previousSchool.trim() || undefined,
        },
        guardians: [
          {
            name: guardianName.trim(),
            relation: guardianRelation,
            phone: guardianPhone.trim(),
            email: guardianEmail.trim() || undefined,
            cnic: guardianCnic.replace(/-/g, "").trim() || undefined,
            isPrimary: true,
          },
        ],
        notes: notes.trim() || undefined,
      };
      const res = await submitApplication(schoolCode, data);
      setResult(res);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusError("");
    setStatusResult(null);
    setStatusLoading(true);
    try {
      const res = await checkStatus(statusQuery.trim());
      setStatusResult(res);
    } catch (err: unknown) {
      setStatusError(err instanceof Error ? err.message : "Could not find application");
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Loading / error states ──────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (configError || !config) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <AlertCircle className="size-12 text-error" />
          <h1 className="text-card-title font-semibold text-fg">School Not Found</h1>
          <p className="text-body text-fg-muted">
            {configError || "Could not load school information. Please check the URL and try again."}
          </p>
        </div>
      </div>
    );
  }

  // ── Success state ───────────────────────────────────────
  if (result) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4 py-10">
        <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl border border-border bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="size-16 text-emerald-500" />
          <div className="flex flex-col gap-2">
            <h1 className="text-card-title font-semibold text-fg">Application Submitted!</h1>
            <p className="text-body text-fg-muted">
              Your admission application has been received successfully.
            </p>
          </div>
          <div className="w-full rounded-lg bg-surface p-4">
            <div className="flex flex-col gap-3 text-left">
              <div className="flex justify-between">
                <span className="text-label text-fg-muted">Application No</span>
                <span className="font-semibold text-fg">{result.applicationNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-label text-fg-muted">Student Name</span>
                <span className="text-fg">{result.childName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-label text-fg-muted">Class</span>
                <span className="text-fg">{result.className}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-label text-fg-muted">Status</span>
                <span className={`rounded-full px-2.5 py-0.5 text-caption font-medium ${STATUS_COLORS[result.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {result.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>
          <p className="text-caption text-fg-muted">
            Please save your application number <strong>{result.applicationNo}</strong> to check your status later.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setResult(null);
              setTab("status");
              setStatusQuery(result.applicationNo);
            }}
          >
            Check Status
          </Button>
        </div>
      </div>
    );
  }

  // ── Main form view ──────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="grid size-14 place-items-center rounded-2xl bg-primary/10">
          <GraduationCap className="size-7 text-primary" />
        </div>
        <div>
          <h1 className="text-[26px] font-semibold leading-8 text-fg">{config.school.name}</h1>
          <p className="mt-1 text-body text-fg-muted">Online Admission Application</p>
        </div>
        {config.school.address && (
          <p className="text-caption text-fg-muted">{config.school.address}</p>
        )}
      </div>

      {/* Tab toggle */}
      <div className="mb-6 flex rounded-lg border border-border bg-white p-1">
        <button
          type="button"
          onClick={() => setTab("apply")}
          className={`flex-1 rounded-md px-4 py-2.5 text-label font-medium transition-colors ${
            tab === "apply"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-fg-muted hover:text-fg"
          }`}
        >
          Apply Now
        </button>
        <button
          type="button"
          onClick={() => setTab("status")}
          className={`flex-1 rounded-md px-4 py-2.5 text-label font-medium transition-colors ${
            tab === "status"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-fg-muted hover:text-fg"
          }`}
        >
          Check Status
        </button>
      </div>

      {/* ── Status checker tab ───────────────────────────── */}
      {tab === "status" && (
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <Search className="size-5 text-primary" />
            <h2 className="text-card-title font-semibold text-fg">Check Application Status</h2>
          </div>
          <form onSubmit={handleStatusCheck} className="flex flex-col gap-4">
            <Field label="Application Number" required>
              <Input
                placeholder="e.g. APP-2026-0001"
                value={statusQuery}
                onChange={(e) => setStatusQuery(e.target.value)}
                required
              />
            </Field>
            <Button type="submit" loading={statusLoading}>
              Check Status
            </Button>
          </form>

          {statusError && (
            <div className="mt-4 rounded-lg bg-error-soft p-4 text-body text-error">
              {statusError}
            </div>
          )}

          {statusResult && (
            <div className="mt-4 rounded-lg border border-border bg-surface p-4">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-label text-fg-muted">Application No</span>
                  <span className="font-semibold text-fg">{statusResult.applicationNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-label text-fg-muted">Student Name</span>
                  <span className="text-fg">{statusResult.childName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-label text-fg-muted">Class</span>
                  <span className="text-fg">{statusResult.className}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-label text-fg-muted">Status</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-caption font-medium ${STATUS_COLORS[statusResult.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {statusResult.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-label text-fg-muted">Applied On</span>
                  <span className="text-fg">
                    {new Date(statusResult.createdAt).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Application form tab ─────────────────────────── */}
      {tab === "apply" && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Branch, session, class */}
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-card-title font-semibold text-fg">Admission Details</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Branch" required>
                <Select value={branchId} onValueChange={setBranchId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {config.branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Academic Session" required>
                <Select
                  value={sessionId}
                  onValueChange={setSessionId}
                  disabled={!branchId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={branchId ? "Select session" : "Select branch first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSessions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Class" required>
                <Select value={classId} onValueChange={setClassId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {config.classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>

          {/* Student info */}
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-card-title font-semibold text-fg">Student Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First Name" required>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  required
                  maxLength={60}
                />
              </Field>
              <Field label="Last Name" required>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  required
                  maxLength={60}
                />
              </Field>
              <Field label="Date of Birth" required>
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
              </Field>
              <Field label="Gender" required>
                <Select value={gender} onValueChange={setGender} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Previous School" className="sm:col-span-2">
                <Input
                  value={previousSchool}
                  onChange={(e) => setPreviousSchool(e.target.value)}
                  placeholder="Name of previous school (if any)"
                  maxLength={150}
                />
              </Field>
            </div>
          </div>

          {/* Guardian info */}
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-card-title font-semibold text-fg">Guardian Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Guardian Name" required>
                <Input
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="Full name"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </Field>
              <Field label="Relation" required>
                <Select value={guardianRelation} onValueChange={setGuardianRelation} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relation" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELATION_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Phone Number" required>
                <Input
                  type="tel"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="e.g. 03001234567"
                  required
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  placeholder="email@example.com"
                  maxLength={254}
                />
              </Field>
              <Field label="CNIC" className="sm:col-span-2">
                <Input
                  value={guardianCnic}
                  onChange={(e) => setGuardianCnic(e.target.value)}
                  placeholder="e.g. 35202-1234567-1"
                  maxLength={15}
                />
              </Field>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-card-title font-semibold text-fg">Additional Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information you would like to share..."
              maxLength={2000}
              rows={3}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-body text-fg outline-none transition-colors placeholder:text-fg-muted focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Submit */}
          {submitError && (
            <div className="rounded-lg bg-error-soft p-4 text-body text-error">{submitError}</div>
          )}

          <Button type="submit" size="lg" loading={submitting} className="w-full">
            Submit Application
          </Button>

          {config.school.phone && (
            <p className="text-center text-caption text-fg-muted">
              Need help? Contact us at{" "}
              <a href={`tel:${config.school.phone}`} className="text-primary underline">
                {config.school.phone}
              </a>
              {config.school.email && (
                <>
                  {" "}or{" "}
                  <a href={`mailto:${config.school.email}`} className="text-primary underline">
                    {config.school.email}
                  </a>
                </>
              )}
            </p>
          )}
        </form>
      )}

      {/* Footer */}
      <footer className="mt-8 border-t border-border pt-4 text-center text-caption text-fg-muted">
        Powered by eSchool Management System
      </footer>
    </div>
  );
}
