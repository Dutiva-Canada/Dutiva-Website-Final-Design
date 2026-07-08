import { describe, expect, it } from 'vitest'
import * as data from './index'
import { cases, caseNotes } from './cases'
import { chats, followupReplies, lightFlows } from './chats'
import { communicationDetails, communications } from './communications'
import { complianceItems } from './compliance'
import { documentTemplates, documentTemplatesByKey } from './documents'
import { compChanges, employeeDetails, employees, orgStructure, supportSignals } from './employees'
import { tasks } from './tasks'

const employeeIds = new Set(employees.map((e) => e.id))
const caseIds = new Set(cases.map((c) => c.id))
const chatIds = new Set(chats.map((c) => c.id))
const docKeys = new Set(documentTemplates.map((d) => d.key))
const followupKeys = new Set(Object.keys(followupReplies))

describe('fixture ids', () => {
  it('keeps prototype ids unique per collection', () => {
    expect(employeeIds.size).toBe(employees.length)
    expect(caseIds.size).toBe(cases.length)
    expect(chatIds.size).toBe(chats.length)
    expect(docKeys.size).toBe(documentTemplates.length)

    const messageIds = chats.flatMap((c) => c.messages.map((m) => m.id))
    expect(new Set(messageIds).size).toBe(messageIds.length)
  })
})

describe('cross-references resolve', () => {
  it('tasks link to existing chats', () => {
    for (const task of tasks) {
      expect(chatIds.has(task.chatId), `task ${task.id} → chat ${task.chatId}`).toBe(true)
    }
  })

  it('cases link to existing employees and chats', () => {
    for (const c of cases) {
      expect(employeeIds.has(c.empId), `case ${c.id} → employee ${c.empId}`).toBe(true)
      expect(chatIds.has(c.chatId), `case ${c.id} → chat ${c.chatId}`).toBe(true)
    }
  })

  it('compliance items link to existing chats', () => {
    for (const item of complianceItems) {
      expect(chatIds.has(item.chatId), `${item.id} → chat ${item.chatId}`).toBe(true)
    }
  })

  it('employee risk flags link to existing chats (when linked)', () => {
    for (const emp of employees) {
      if (emp.risk?.chatId != null) {
        expect(chatIds.has(emp.risk.chatId), `${emp.id} risk → chat ${emp.risk.chatId}`).toBe(true)
      }
    }
  })

  it('every employee has a detail record whose references resolve', () => {
    for (const emp of employees) {
      const det = employeeDetails[emp.id]
      expect(det, `detail for ${emp.id}`).toBeDefined()
      if (!det) continue
      expect(det.employeeId).toBe(emp.id)
      for (const key of det.docs) {
        expect(docKeys.has(key), `${emp.id} doc "${key}"`).toBe(true)
      }
      for (const caseId of det.cases) {
        expect(caseIds.has(caseId), `${emp.id} case ${caseId}`).toBe(true)
      }
      for (const ev of det.timeline) {
        if (ev.docKey != null) {
          expect(docKeys.has(ev.docKey), `${emp.id} timeline doc "${ev.docKey}"`).toBe(true)
        }
        if (ev.caseId != null) {
          expect(caseIds.has(ev.caseId), `${emp.id} timeline case ${ev.caseId}`).toBe(true)
        }
      }
    }
  })

  it('chat messages reference existing documents and followup replies', () => {
    for (const chat of chats) {
      for (const msg of chat.messages) {
        for (const key of msg.docs ?? []) {
          expect(docKeys.has(key), `${chat.id}/${msg.id} doc "${key}"`).toBe(true)
        }
        for (const label of msg.followups ?? []) {
          expect(followupKeys.has(label), `${chat.id}/${msg.id} followup "${label}"`).toBe(true)
        }
      }
    }
  })

  it('light flows reference existing documents and followup replies', () => {
    for (const [flowKey, flow] of Object.entries(lightFlows)) {
      for (const key of flow.docs ?? []) {
        expect(docKeys.has(key), `${flowKey} doc "${key}"`).toBe(true)
      }
      for (const label of flow.followups ?? []) {
        expect(followupKeys.has(label), `${flowKey} followup "${label}"`).toBe(true)
      }
    }
  })

  it('followup replies are keyed by their EN label and reference existing documents', () => {
    for (const [key, reply] of Object.entries(followupReplies)) {
      expect(reply.label.en).toBe(key)
      for (const docKey of reply.docs ?? []) {
        expect(docKeys.has(docKey), `"${key}" doc "${docKey}"`).toBe(true)
      }
    }
  })

  it('documentTemplatesByKey is a complete lookup', () => {
    for (const template of documentTemplates) {
      expect(documentTemplatesByKey[template.key]).toBe(template)
    }
  })

  it('case notes attach to existing cases', () => {
    for (const caseId of Object.keys(caseNotes)) {
      expect(caseIds.has(caseId), `note → case ${caseId}`).toBe(true)
    }
  })

  it('comp changes, support signals, and org graph reference existing employees', () => {
    for (const change of compChanges) {
      expect(employeeIds.has(change.employeeId), `${change.id} → ${change.employeeId}`).toBe(true)
    }
    for (const signal of supportSignals) {
      if (signal.employeeId != null) {
        expect(employeeIds.has(signal.employeeId), `${signal.id} → ${signal.employeeId}`).toBe(true)
      }
    }
    for (const branch of orgStructure) {
      expect(employeeIds.has(branch.managerId), `org manager ${branch.managerId}`).toBe(true)
      for (const reportId of branch.reportIds) {
        expect(employeeIds.has(reportId), `org report ${reportId}`).toBe(true)
      }
    }
  })

  it('communications ids are unique and each has a detail record', () => {
    expect(new Set(communications.map((c) => c.id)).size).toBe(communications.length)
    for (const comm of communications) {
      const det = communicationDetails[comm.id]
      expect(det, `detail for ${comm.id}`).toBeDefined()
      expect(det?.communicationId).toBe(comm.id)
    }
  })
})

describe('bilingual completeness', () => {
  const isBi = (value: unknown): value is { en: string; fr: string } =>
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>)['en'] === 'string' &&
    typeof (value as Record<string, unknown>)['fr'] === 'string'

  it('every Bi field has non-empty en and fr', () => {
    const visited = new Set<object>()
    const walk = (value: unknown, path: string): void => {
      if (typeof value !== 'object' || value === null) return
      if (visited.has(value)) return
      visited.add(value)
      if (isBi(value)) {
        expect(value.en.trim().length, `${path}.en is empty`).toBeGreaterThan(0)
        expect(value.fr.trim().length, `${path}.fr is empty`).toBeGreaterThan(0)
        return
      }
      if (Array.isArray(value)) {
        value.forEach((item, i) => walk(item, `${path}[${i}]`))
        return
      }
      for (const [key, child] of Object.entries(value)) {
        walk(child, `${path}.${key}`)
      }
    }
    walk(data, 'data')
    // Sanity: the walk actually saw a meaningful amount of data.
    expect(visited.size).toBeGreaterThan(500)
  })
})
