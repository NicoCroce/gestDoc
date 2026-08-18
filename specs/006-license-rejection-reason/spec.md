# Feature Specification: License Rejection Reason

**Feature Branch**: `006-license-rejection-reason`

**Created**: 2026-08-18

**Status**: Draft

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Admin Rejects a License with a Reason (Priority: P1)

An admin is reviewing pending licenses on the company dashboard. When they select "Rechazado" from the status dropdown of a license, the application interrupts the immediate submission and instead opens a modal asking for the reason for the rejection. The admin types the reason and confirms. Only then is the status change persisted.

For all other status transitions (pendiente, validando, aprobado), the dropdown behaves exactly as before — no modal, immediate submission.

**Why this priority**: Core value of the feature. Without this, the rest cannot function. The rejection reason cannot reach the employee if it is never captured.

**Independent Test**: Can be tested by switching any license to "Rechazado" in the admin dashboard and verifying the modal appears, and that confirming without filling in the reason is blocked. No email integration required to test this story.

**Acceptance Scenarios**:

1. **Given** an admin is on the licenses dashboard and a license has status "pendiente", **When** the admin selects "Rechazado" in the status dropdown, **Then** a modal appears requesting the rejection reason before any change is submitted.
2. **Given** the rejection modal is open, **When** the admin submits the form with a non-empty reason, **Then** the license status is updated to "rechazado" and the reason is stored against that license record.
3. **Given** the rejection modal is open, **When** the admin attempts to confirm with an empty or whitespace-only reason, **Then** the form is invalid, submission is blocked, and an inline error message is shown.
4. **Given** the rejection modal is open, **When** the admin clicks "Cancelar" or dismisses the modal, **Then** the status dropdown reverts to the previous value and no change is submitted.
5. **Given** a license is being updated to any status other than "rechazado", **When** the admin selects that status, **Then** no modal appears and the status change is submitted immediately as before.

---

### User Story 2 — Employee Receives Rejection Email with the Reason (Priority: P2)

When the rejection is confirmed and persisted, the employee receives the existing "license status change" notification email. The email body now includes a dedicated section displaying the rejection reason entered by the admin.

**Why this priority**: The primary motivation for capturing the reason is communication. Without it, the stored reason has no external value.

**Independent Test**: Can be tested by completing US1, then checking the employee's email notification. The rejection reason text must appear as a distinct labeled field in the email body.

**Acceptance Scenarios**:

1. **Given** a license has just been set to "rechazado" with a rejection reason, **When** the status-change notification email is sent to the employee, **Then** the email body includes a "Motivo del rechazo" section displaying the exact text entered by the admin.
2. **Given** a license is set to "aprobado" (which also sends a notification), **When** the email is delivered, **Then** no "Motivo del rechazo" section appears in the email — the field is only included for rejection events.
3. **Given** historical license records that were rejected before this feature existed (no rejection reason on file), **When** a status-change email is triggered for them, **Then** the email is sent successfully without errors, omitting the rejection reason section gracefully.

---

### Edge Cases

- What happens if the admin closes the browser tab after the modal opens but before confirming? The status change must not be submitted — it is client-side pending state only.
- What is the maximum length of a rejection reason? The system must accept reasons up to 500 characters. Longer input must be blocked at the UI with a visible character count or error.
- What happens if the email notification fails to send after the status is already persisted? The status update is committed; the email failure is logged server-side and does not roll back the status change (same behavior as today for approved/rejected notifications).
- Can the rejection reason be edited after submission? Out of scope for this feature — `rejectionReason` is write-once via this flow.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: When an admin changes a license status to "rechazado", the system MUST display a confirmation modal before submitting the change, and the modal MUST require a non-empty rejection reason.
- **FR-002**: The rejection reason MUST be submitted together with the status change in a single operation — the status MUST NOT change without a reason, and the reason MUST NOT be stored without the corresponding status change.
- **FR-003**: The system MUST store the rejection reason alongside the license record so it can be retrieved later.
- **FR-004**: The rejection reason field MUST accept plain text up to 500 characters and MUST reject empty or whitespace-only input.
- **FR-005**: For all status transitions other than "rechazado", the current behavior (immediate status update, no modal) MUST remain unchanged.
- **FR-006**: The existing "license status change" notification email MUST include the rejection reason when the new status is "rechazado".
- **FR-007**: The email template MUST NOT include the rejection reason section when the new status is "aprobado" — it is conditional on rejection.
- **FR-008**: License records that existed before this feature (no rejection reason stored) MUST continue to work without errors in all existing flows, including email notifications.

### Key Entities

- **Certificate**: Existing entity representing a leave/license request. Gains a new optional attribute `rejectionReason` (text, up to 500 characters, null for non-rejected or pre-feature records).
- **License Status Change Event**: The act of transitioning a Certificate's status. For the "rechazado" case, it now carries an additional mandatory payload: the rejection reason.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: An admin can complete the full rejection flow — selecting "Rechazado", entering a reason, and confirming — in under 30 seconds from the moment the dropdown opens.
- **SC-002**: 100% of licenses set to "rechazado" after this feature is deployed have a non-null, non-empty `rejectionReason` stored.
- **SC-003**: 100% of rejection notification emails sent after this feature is deployed include the rejection reason text in the email body.
- **SC-004**: Zero regressions in the status-change flow for non-rejection statuses (aprobado, validando, pendiente) — confirmed by existing automated tests passing unchanged.
- **SC-005**: Attempting to confirm a rejection modal with an empty reason is blocked at the UI, with no network request sent.

## Assumptions

- The rejection reason is required for any new rejection — there is no "skip reason" path.
- Existing "rechazado" records (pre-feature) have `rejectionReason = null`; this is acceptable and will not cause any runtime errors.
- The rejection reason is a single free-text field; structured options (e.g., dropdown of preset reasons) are out of scope for this version.
- The rejection reason is visible to the admin at the time of entry but is not surfaced back in any other UI view (e.g., license detail page) in this version — only in the email.
- The modal is a lightweight inline dialog, not a full-page route change.
- The feature applies only to the `admin` variant of `CertificateActions`; the `owner` variant does not include status-change actions.
- The `rejectionReason` field will require a database migration to add the new nullable column to the certificates table.
- No change to the `aprobado` notification email is in scope; only the `rechazado` path gains the rejection reason.
