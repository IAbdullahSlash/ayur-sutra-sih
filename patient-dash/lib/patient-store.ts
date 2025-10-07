// Simple client-side data layer using localStorage + SWR.
// Data model is intentionally compatible with a future API/Express backend.

import useSWR, { mutate } from "swr"

export type Session = {
  id: string
  therapyType: string
  date: string // ISO date (YYYY-MM-DD)
  time: string // HH:mm
  therapist?: string
  status: "scheduled" | "completed" | "canceled"
}

export type NotificationPref = {
  inApp: boolean
  email: boolean
  sms: boolean
}

export type NotificationItem = {
  id: string
  type: "pre" | "post" | "system"
  title: string
  message: string
  createdAt: string
  read: boolean
}

export type FeedbackMedia = {
  url: string
  type: "image" | "video" | "file"
  name?: string
}

export type FeedbackItem = {
  id: string
  sessionId?: string
  improved: "yes" | "no"
  sideEffects: string[]
  notes?: string
  rating: number // 1-5
  createdAt: string
  media?: FeedbackMedia[]
}

export type ProgressPoint = {
  date: string // YYYY-MM-DD
  pain: number // 1-10 (lower is better)
  energy: number // 1-10 (higher is better)
  sleep: number // hours (0-12)
}

export type Milestone = {
  id: string
  label: string
  achieved: boolean
  date?: string
}

export type Profile = {
  name: string
  age?: number
  email?: string
  phone?: string
  medicalHistory?: string
  therapyPreferences?: string
  notificationPref: NotificationPref
  goalSessions: number
}

export type PatientData = {
  profile: Profile
  sessions: Session[]
  notifications: NotificationItem[]
  feedback: FeedbackItem[]
  progress?: ProgressPoint[]
  milestones?: Milestone[]
}

const KEY = "pk_patient_data"

function seedProgress(now = new Date()): { progress: ProgressPoint[]; milestones: Milestone[] } {
  const day = 24 * 60 * 60 * 1000
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  const d0 = new Date(now.getTime() - 6 * day)
  const d1 = new Date(now.getTime() - 5 * day)
  const d2 = new Date(now.getTime() - 4 * day)
  const d3 = new Date(now.getTime() - 3 * day)
  const d4 = new Date(now.getTime() - 2 * day)
  const d5 = new Date(now.getTime() - 1 * day)
  const d6 = new Date(now)

  const progress: ProgressPoint[] = [
    { date: fmt(d0), pain: 7, energy: 4, sleep: 5 },
    { date: fmt(d1), pain: 6, energy: 5, sleep: 6 },
    { date: fmt(d2), pain: 6, energy: 5, sleep: 6 },
    { date: fmt(d3), pain: 5, energy: 6, sleep: 6.5 },
    { date: fmt(d4), pain: 4, energy: 6, sleep: 7 },
    { date: fmt(d5), pain: 4, energy: 7, sleep: 7.5 },
    { date: fmt(d6), pain: 3, energy: 8, sleep: 8 },
  ]

  const milestones: Milestone[] = [
    { id: crypto.randomUUID(), label: "Initial Assessment", achieved: true, date: fmt(d0) },
    { id: crypto.randomUUID(), label: "First Therapy Completed", achieved: true, date: fmt(d4) },
    { id: crypto.randomUUID(), label: "Sleep Improvement", achieved: true, date: fmt(d5) },
    { id: crypto.randomUUID(), label: "Halfway to Goal", achieved: false },
  ]

  return { progress, milestones }
}

function seedData(): PatientData {
  const now = new Date()
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  const day = 24 * 60 * 60 * 1000

  const today = new Date(now)
  const yesterday = new Date(now.getTime() - day)
  const twoDaysAgo = new Date(now.getTime() - 2 * day)
  const tomorrow = new Date(now.getTime() + day)
  const inThreeDays = new Date(now.getTime() + 3 * day)

  const sCompleted1 = crypto.randomUUID()
  const sCompleted2 = crypto.randomUUID()
  const sScheduled1 = crypto.randomUUID()
  const sScheduled2 = crypto.randomUUID()
  const sCanceled = crypto.randomUUID()

  const pm = seedProgress(now)

  return {
    profile: {
      name: "Guest",
      age: 30,
      email: "",
      phone: "",
      medicalHistory: "Goals: Reduce stress | Symptoms: Stress, Insomnia",
      therapyPreferences: "Abhyanga",
      notificationPref: { inApp: true, email: false, sms: false },
      goalSessions: 7,
    },
    sessions: [
      {
        id: sCompleted1,
        therapyType: "Abhyanga",
        date: fmt(twoDaysAgo),
        time: "10:30",
        therapist: "Therapist A",
        status: "completed",
      },
      {
        id: sCompleted2,
        therapyType: "Shirodhara",
        date: fmt(yesterday),
        time: "15:00",
        therapist: "Therapist B",
        status: "completed",
      },
      {
        id: sScheduled1,
        therapyType: "Udwartana",
        date: fmt(tomorrow),
        time: "09:00",
        therapist: "Therapist C",
        status: "scheduled",
      },
      {
        id: sScheduled2,
        therapyType: "Pizhichil",
        date: fmt(inThreeDays),
        time: "14:00",
        therapist: "Therapist D",
        status: "scheduled",
      },
      {
        id: sCanceled,
        therapyType: "Swedana",
        date: fmt(new Date(now.getTime() - 3 * day)),
        time: "11:00",
        therapist: "Therapist E",
        status: "canceled",
      },
    ],
    notifications: [
      {
        id: crypto.randomUUID(),
        type: "system",
        title: "Welcome",
        message: "Welcome to your Panchakarma dashboard.",
        createdAt: new Date(now.getTime() - 2 * day).toISOString(),
        read: false,
      },
      {
        id: crypto.randomUUID(),
        type: "system",
        title: "Program Started",
        message: "Your 7-session wellness program has been initialized.",
        createdAt: new Date(now.getTime() - 2 * day + 60 * 60 * 1000).toISOString(),
        read: true,
      },
      {
        id: crypto.randomUUID(),
        type: "system",
        title: "Diet Tip",
        message: "Light meals and hydration recommended before therapies.",
        createdAt: new Date(now.getTime() - day).toISOString(),
        read: true,
      },
    ],
    feedback: [
      {
        id: crypto.randomUUID(),
        sessionId: sCompleted1,
        improved: "yes",
        sideEffects: [],
        notes: "Felt relaxed and slept better.",
        rating: 5,
        createdAt: new Date(now.getTime() - day).toISOString(),
        media: [],
      },
    ],
    progress: pm.progress,
    milestones: pm.milestones,
  }
}

function ensureDataShape(raw: any): PatientData {
  let changed = false
  const data = raw as PatientData

  if (!data.profile) {
    changed = true
    Object.assign(raw, seedData())
  }
  if (!data.profile.notificationPref) {
    data.profile.notificationPref = { inApp: true, email: false, sms: false }
    changed = true
  }
  if (!("progress" in data) || !data.progress || !Array.isArray(data.progress) || data.progress.length === 0) {
    const pm = seedProgress()
    data.progress = pm.progress
    data.milestones = pm.milestones
    changed = true
  }
  if (!("milestones" in data) || !data.milestones) {
    data.milestones = seedProgress().milestones
    changed = true
  }
  if (Array.isArray(data.feedback)) {
    for (const f of data.feedback) {
      if (!("media" in f)) {
        f.media = []
        changed = true
      }
    }
  }

  if (changed) write(data)
  return data
}

function read(): PatientData {
  if (typeof window === "undefined") return seedData()
  const raw = localStorage.getItem(KEY)
  if (!raw) {
    const fresh = seedData()
    localStorage.setItem(KEY, JSON.stringify(fresh))
    return fresh
  }
  try {
    return ensureDataShape(JSON.parse(raw))
  } catch {
    const fresh = seedData()
    localStorage.setItem(KEY, JSON.stringify(fresh))
    return fresh
  }
}

function write(data: PatientData) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY, JSON.stringify(data))
}

function composeDateTimeISO(date: string, time: string) {
  // local date+time to ISO
  const [h, m] = time.split(":").map((s) => Number.parseInt(s, 10))
  const dt = new Date(date + "T00:00:00")
  dt.setHours(h, m, 0, 0)
  return dt.toISOString()
}

function generateDueNotifications(data: PatientData): PatientData {
  const now = new Date()
  let changed = false
  const haveIds = new Set(data.notifications.map((n) => n.id))
  for (const s of data.sessions) {
    const dtISO = composeDateTimeISO(s.date, s.time)
    const sessionTime = new Date(dtISO)
    const preTime = new Date(sessionTime.getTime() - 60 * 60 * 1000) // 1h before
    const postTime = new Date(sessionTime.getTime() + 60 * 60 * 1000) // 1h after

    // Pre reminder
    if (now >= preTime && now < sessionTime) {
      const exists = data.notifications.some(
        (n) => n.type === "pre" && n.title.includes(s.therapyType) && n.message.includes(s.date),
      )
      if (!exists) {
        data.notifications.unshift({
          id: crypto.randomUUID(),
          type: "pre",
          title: `Pre-procedure for ${s.therapyType}`,
          message: `Your session is at ${s.time} on ${s.date}. Please follow light diet and rest.`,
          createdAt: new Date().toISOString(),
          read: false,
        })
        changed = true
      }
    }

    // Post reminder
    if (now >= postTime && s.status === "scheduled") {
      const exists = data.notifications.some(
        (n) => n.type === "post" && n.title.includes(s.therapyType) && n.message.includes(s.date),
      )
      if (!exists) {
        data.notifications.unshift({
          id: crypto.randomUUID(),
          type: "post",
          title: `Post-procedure for ${s.therapyType}`,
          message: "Hydrate well and follow your after-care routine. Share feedback about today’s session.",
          createdAt: new Date().toISOString(),
          read: false,
        })
        // mark session as completed for demo purposes
        s.status = "completed"
        changed = true
      }
    }
  }
  if (changed) write(data)
  return data
}

export function usePatientData() {
  const { data } = useSWR<PatientData>(
    KEY,
    () => {
      const d = read()
      return generateDueNotifications(d)
    },
    { revalidateOnFocus: true },
  )
  return data ?? seedData()
}

export function updateProfile(patch: Partial<Profile>) {
  const data = read()
  data.profile = { ...data.profile, ...patch }
  write(data)
  mutate(KEY, data, false)
}

export function bookSession(input: Omit<Session, "id" | "status" | "therapist">) {
  const data = read()
  data.sessions.push({
    id: crypto.randomUUID(),
    therapyType: input.therapyType,
    date: input.date,
    time: input.time,
    therapist: "Assigned",
    status: "scheduled",
  })
  write(data)
  mutate(KEY, data, false)
  // simulate confirmation notification
  data.notifications.unshift({
    id: crypto.randomUUID(),
    type: "system",
    title: "Booking Confirmed",
    message: `${input.therapyType} on ${input.date} at ${input.time} has been confirmed.`,
    createdAt: new Date().toISOString(),
    read: false,
  })
  write(data)
  mutate(KEY, data, false)
}

export function modifySession(id: string, patch: Partial<Pick<Session, "date" | "time" | "therapyType">>) {
  const data = read()
  const s = data.sessions.find((x) => x.id === id)
  if (s) {
    Object.assign(s, patch)
    write(data)
    mutate(KEY, data, false)
  }
}

export function cancelSession(id: string) {
  const data = read()
  const s = data.sessions.find((x) => x.id === id)
  if (s) {
    s.status = "canceled"
    write(data)
    mutate(KEY, data, false)
  }
}

export function addFeedback(item: Omit<FeedbackItem, "id" | "createdAt">) {
  const data = read()
  data.feedback.unshift({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...item,
  })
  write(data)
  mutate(KEY, data, false)
}

export function addFeedbackWithMedia(input: {
  sessionId?: string
  improved: "yes" | "no"
  sideEffects: string[]
  notes?: string
  rating: number
  mediaFiles?: File[]
}) {
  const data = read()
  const media: FeedbackMedia[] =
    input.mediaFiles?.map((file) => {
      const url = URL.createObjectURL(file)
      let type: FeedbackMedia["type"] = "file"
      if (file.type.startsWith("image/")) type = "image"
      else if (file.type.startsWith("video/")) type = "video"
      return { url, type, name: file.name }
    }) ?? []

  data.feedback.unshift({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    sessionId: input.sessionId,
    improved: input.improved,
    sideEffects: input.sideEffects,
    notes: input.notes,
    rating: input.rating,
    media,
  })

  write(data)
  mutate(KEY, data, false)
}

export function markNotificationRead(id: string) {
  const data = read()
  const n = data.notifications.find((x) => x.id === id)
  if (n) {
    n.read = true
    write(data)
    mutate(KEY, data, false)
  }
}

export function setNotificationPrefs(p: NotificationPref) {
  const data = read()
  data.profile.notificationPref = p
  write(data)
  mutate(KEY, data, false)
}

export function sessionsCompletedCount(data: PatientData) {
  return data.sessions.filter((s) => s.status === "completed").length
}
