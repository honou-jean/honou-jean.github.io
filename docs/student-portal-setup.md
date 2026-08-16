# Student portal: Supabase setup and security

The teaching portal is an optional browser integration. With the public config left empty, `window.TEACHING_PORTAL_BACKEND.isConfigured()` returns `false` and no network client is created.

## Security model

- Browser code may contain only a Supabase **publishable** key (`sb_publishable_...`) or, for an older project, the legacy **anon** key.
- Never put an `sb_secret_...`, legacy `service_role`, database password, JWT signing secret, or server credential in this repository. Secret/service-role keys bypass Row Level Security (RLS).
- Authentication identifies the person. RLS, column grants, constraints and private Storage policies authorize every row and object.
- New Auth users receive the `student` role. Teacher promotion is deliberately an administrator-only SQL action; role data never comes from editable user metadata.
- Both Storage buckets are private. The adapter issues signed download URLs that expire after 10 minutes; do not persist or publish them.

Official references:

- [Understanding Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Securing frontend data access](https://supabase.com/docs/guides/database/secure-data)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Managing Auth user data](https://supabase.com/docs/guides/auth/managing-user-data)
- [Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [Private Storage buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Storage object ownership](https://supabase.com/docs/guides/storage/security/ownership)
- [Standard uploads](https://supabase.com/docs/guides/storage/uploads/standard-uploads)
- [JavaScript client initialization](https://supabase.com/docs/reference/javascript/initializing)

## 1. Create and migrate the project

1. Create a Supabase project in the appropriate organization and region.
2. Install the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) if migrations will be managed locally.
3. Link this repository to the correct project and review the target before applying anything:

   ```powershell
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push --dry-run
   supabase db push
   ```

   Alternatively, review and run `supabase/migrations/202608140001_student_portal.sql` once in the project SQL Editor.

The migration creates:

- `profiles`, `students`, `assignments`, `resources`, `submissions` and `questions`;
- teacher/student role and workflow enums;
- integrity constraints, indexes and `updated_at`/validation triggers;
- one explicit active student recipient for every assignment;
- least-privilege column grants and RLS policies;
- private `teaching-resources` and `student-submissions` buckets;
- object policies for teacher resources and student submissions.

Object path contracts are security-sensitive:

```text
teaching-resources/{student_uuid}/{assignment_uuid}/{safe_file_name}
student-submissions/{student_uuid}/{assignment_uuid}/{safe_file_name}
```

Do not change these layouts without updating the corresponding Storage policy helpers.

## 2. Configure Auth users and roles

Create accounts from **Authentication > Users**, through a trusted server/admin workflow, or by having a signed-in teacher use the dashboard's "Ajouter un élève" form (see [§7](#7-deploy-the-create-student-edge-function) and [§8](#8-teacher-dashboard-end-to-end-workflow)), which calls the `create-student` Edge Function instead of running SQL by hand. Do not expose public self-sign-up unless it is deliberately designed, rate-limited and reviewed.

The Auth trigger creates each profile as a student. Promote the verified teacher only from a trusted SQL/admin context:

```sql
update public.profiles
set role = 'teacher', full_name = 'Verified teacher name'
where id = '<TEACHER_AUTH_USER_UUID>'::uuid;
```

Assign a student after both Auth accounts exist:

```sql
insert into public.students (user_id, teacher_id, cohort)
values (
  '<STUDENT_AUTH_USER_UUID>'::uuid,
  '<TEACHER_AUTH_USER_UUID>'::uuid,
  'Optional cohort label'
);
```

Every assignment must name that student's UUID as `student_id`, and its `teacher_id` must match the student's active teacher relationship. A teacher may reassign only a draft assignment that has no resources, submissions or questions:

```sql
insert into public.assignments (teacher_id, student_id, title, status)
values (
  '<TEACHER_AUTH_USER_UUID>'::uuid,
  '<STUDENT_AUTH_USER_UUID>'::uuid,
  'Individual assignment title',
  'draft'
);
```

`supabase/seed.example.sql` contains commented placeholders only. Never commit real student identifiers, names, grades or credentials.

## 3. Add the public browser configuration

Open **Project Settings > API Keys** (or the project Connect dialog), then edit `assets/js/supabase-config.js`:

```javascript
window.SUPABASE_CONFIG = Object.freeze({
  url: "https://YOUR_PROJECT_REF.supabase.co",
  publishableKey: "sb_publishable_REPLACE_WITH_THE_REAL_PUBLIC_KEY"
});
```

Those strings are examples for documentation only; the repository config intentionally contains empty values. A legacy anon key is accepted through `publishableKey` or an optional `anonKey` property. The adapter rejects `sb_secret_...`, malformed keys and legacy JWTs whose role is not `anon`.

Load Supabase JS, config, then the adapter in that order on a teaching page. For a static site, pin a reviewed v2 release rather than using an unbounded version in production:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.102.0"></script>
<script src="../assets/js/supabase-config.js"></script>
<script src="../assets/js/supabase-client.js"></script>
```

The package's UMD build exposes `window.supabase`; the adapter feature-detects its `createClient` function. The version above is the reviewed integration version and should be updated deliberately, not floated automatically.

For stronger supply-chain control, self-host the reviewed `@supabase/supabase-js` build or use a normal package-lock/bundling workflow. Keep the site on HTTPS so sessions and `crypto.randomUUID()` operate in a secure context.

## 4. Adapter contract

The adapter exposes one frozen object:

```javascript
window.TEACHING_PORTAL_BACKEND
```

Methods:

- `isConfigured()` returns `true` only when the URL, safe public key and Supabase JS SDK are available.
- `getSession()` returns the locally persisted session or `null`. It is for interface state, not authorization decisions.
- `signIn({ email, password })` uses `signInWithPassword`.
- `signOut()` signs out only the current browser session (`scope: "local"`).
- `onAuthStateChange(callback)` returns an unsubscribe function.
- `getDashboardData()` verifies the user with `auth.getUser()`, loads only RLS-authorized data and returns short-lived private-file URLs.
- `submitQuestion({ assignmentId, message })` is student-only.
- `uploadSubmission({ assignmentId, files, message })` is student-only, accepts 1–5 PDF, DOCX, ODT, TXT, PNG, JPG or JPEG files of at most 6 MiB each, uses non-overwriting random paths, and removes uploaded objects if the database insert fails.

Submission validation checks the final filename extension and browser MIME together. A matching MIME is required when the browser supplies a specific value. An empty MIME or `application/octet-stream` is accepted only for an approved extension; the adapter then sends Storage the extension's canonical MIME. The private submission bucket allows only those six canonical MIME values. The teacher-resource bucket intentionally remains broader.

`getDashboardData()` returns:

```text
{
  role, profile, student, teacher, students,
  assignments, resources, submissions, questions, generatedAt
}
```

Supabase/Postgres errors are wrapped in an error with a stable `code`; do not display raw `cause` details to end users.

## 5. Teacher resource upload workflow

The teacher must own the assignment. A resource is exactly one of: a private Storage file or an external HTTPS link. For a file, the first path segment must be that assignment's `student_id`. Upload the object first to the exact path, then insert a matching `resources` row. Only the assigned student can read it, and not until `visible = true` and the assignment is published or closed.

```javascript
const path = `${studentId}/${assignmentId}/${crypto.randomUUID()}-lesson.pdf`;
await supabase.storage.from("teaching-resources").upload(path, file, { upsert: false });
await supabase.from("resources").insert({
  assignment_id: assignmentId,
  title: "Lesson title",
  storage_path: path,
  mime_type: file.type,
  file_size_bytes: file.size,
  visible: true
});
```

For a reviewed external link, leave `storage_path` and file metadata null:

```javascript
await supabase.from("resources").insert({
  assignment_id: assignmentId,
  title: "Reference link",
  external_url: "https://trusted.example.edu/course/reference",
  visible: true
});
```

External links must be HTTPS, contain no whitespace or embedded URL credentials, and be at most 2,048 characters. They are not protected by Supabase Storage or its signed URLs: review the destination and privacy terms, do not put access tokens or student data in the URL, and render links with `rel="noopener noreferrer"` when opening a new tab.

If the row insert fails, delete the uploaded object through the Storage API. Do not delete rows directly from `storage.objects`; Supabase documents that Storage object operations must go through the API.

## 6. RLS tests before production

Create at least two teacher accounts and two students assigned to different teachers. Test in separate private browser profiles so sessions cannot mix.

Expected student results:

1. Can read only their own profile/student row and their assigned teacher's minimal profile.
2. Can read only published/closed assignments explicitly addressed to them and the visible resources for those assignments.
3. Cannot read another student's submissions, questions or Storage objects.
4. Can insert a question for their own published/closed assignment, and a submission only for their own active published assignment.
5. Cannot change roles, grades, feedback, assignment status or resource visibility.
6. Cannot upload files outside PDF, DOCX, ODT, TXT, PNG, JPG/JPEG, files with mismatched extensions and MIME values, or files larger than 6 MiB.
7. Can remove an orphaned upload during failed-submission cleanup, but cannot delete a file once a `submissions.file_paths` row references it.

Expected teacher results:

1. Can read only students assigned to them and those students' profiles.
2. Can manage only assignments for their active assigned students, their own assignment rows/resources, and matching student/assignment resource paths.
3. Can read/review only submissions and questions attached to their assignments.
4. Cannot access another teacher's rows or either bucket's unrelated object paths.

Also test while signed out and with the publishable key alone: all six tables and both private buckets must return no protected data. Run the Supabase Security Advisor and inspect every finding before launch.

For local database tests, use the CLI stack and reset from migrations:

```powershell
supabase start
supabase db reset
supabase status
```

With Node.js available, run the repository's browser-adapter contract checks as well:

```powershell
node supabase/tests/adapter-contract.cjs
```

They verify the exact public API surface, fail-closed empty/secret/placeholder configuration, legacy anon-key role rejection, the 6 MiB boundary, approved extension/MIME pairing, canonical MIME inference for generic browser values, recipient-filtered assignment queries, and external-link handling without Storage signing.

The SQL Editor normally runs with elevated privileges and therefore does not reproduce browser RLS behavior. Use real authenticated JWT sessions or dedicated database tests with the `authenticated` role when testing policies.

## 7. Deploy the `create-student` Edge Function

The dashboard's "Ajouter un élève" form lets a signed-in teacher create a new student account without anyone touching the SQL Editor. It calls `supabase/functions/create-student/index.ts`, a Deno Edge Function that performs the privileged steps a browser can never safely do itself:

1. Verifies the caller's own JWT with `auth.getUser()` — it never trusts a client-supplied teacher or user id.
2. Confirms that caller's `profiles.role` is `teacher` (service-role read, bypassing RLS deliberately, since this check *is* the authorization gate for everything that follows).
3. Validates `email` / `fullName` (1–120 chars) / `cohort` (optional, 1–120 chars) against the same limits as the `students`/`profiles` constraints.
4. Generates a 20-character temporary password with `crypto.getRandomValues` and rejection sampling (not `Math.random`, and not a biased modulo).
5. Creates the Auth user via `auth.admin.createUser` with `email_confirm: true` (no confirmation email — the teacher hands the password to the student directly) and inserts the matching `students` row.
6. If the `students` insert fails, rolls back by deleting the just-created Auth user, so no orphaned account is left behind.
7. Returns `{ email, temporaryPassword, userId, fullName, cohort }` exactly once. Nothing server-side logs or persists the plaintext password.

Deploy it to the linked project:

```powershell
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy create-student
```

Supabase automatically injects `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` into every deployed Edge Function for the linked project — no manual secret-setting is needed for a normal hosted deployment. The service-role key never leaves this server-side environment and must never be added to `assets/js/supabase-config.js` or any other browser-loaded file.

To test locally before deploying, run it under the CLI stack with an untracked env file:

```powershell
supabase start
supabase functions serve create-student --env-file supabase/.env.local
```

Add `supabase/.env.local` to `.gitignore` if you create it; it would otherwise hold a service-role key.

The browser side is already wired: `assets/js/supabase-client.js`'s `inviteStudent()` checks `context.profile.role === "teacher"` (a cosmetic guard only) and calls `client.functions.invoke("create-student", { body })`, forwarding the teacher's own session token automatically. The function's CORS headers allow any origin because the real authorization boundary is the bearer JWT, not the origin; narrow `Access-Control-Allow-Origin` in `index.ts` to the production domain if you want defense in depth.

## 8. Teacher dashboard: end-to-end workflow

Everything below happens at `teaching/dashboard.html` once a teacher account exists (see §2) and is signed in.

1. **Sign in.** The page shows the teacher's own dashboard content (`#dashboard-content-teacher`) once `getDashboardData()` resolves `role: "teacher"`; a student session instead sees `#dashboard-content`.
2. **01 · Mes élèves.** The roster lists every student assigned to this teacher with an active/inactive pill. "Ajouter un élève" creates a new account through the Edge Function in §7; on success, a credential box appears once with the student's email and temporary password (`inviteStudent()` → `handleInviteStudent()` in `assets/js/teaching-portal.js`). This is the only time the password is shown anywhere — the teacher must copy it out and hand it to the student over a channel they trust (in person, a call, an existing secure message thread). It is never emailed by the app itself.
3. **02 · Mes activités.** "Créer une activité" builds a `assignments` row for one specific student, with a title, optional short description, optional detailed instructions, an optional due date, and a "publish immediately" checkbox. A draft is invisible to the student until published; `Publier`/`Clôturer` buttons on each row change its status in place (`handleAssignmentAction()`).
4. **03 · Documents & ressources.** "Ajouter une ressource" attaches exactly one of a private file upload (stored under `teaching-resources/{student_id}/{assignment_id}/…`, per the path contract in §1) or a reviewed external HTTPS link to an assignment, with a visibility toggle. The student can read it only once the resource is `visible` and its assignment is published or closed.
5. **04 · Devoirs remis.** Every submission the assigned student has uploaded appears with signed, time-limited download links to their files. The inline review form (`handleReviewSubmission()`) records feedback text and an optional 0–20 grade, and marks the submission `reviewed`.
6. **05 · Questions.** Student questions attached to the teacher's assignments list here; the inline answer form (`handleAnswerQuestion()`) submits the reply, and a database trigger sets the question's status to `answered` and stamps `answered_at` automatically — the client never sets those fields itself.

On the student's side (already implemented, `#dashboard-content`'s `#submission-form` and `#question-form`), a student who received credentials from their teacher signs in at the same page, sees only their own published/closed assignments and visible resources, uploads files against `uploadSubmission()` (§4's format/size limits apply), and can ask a question against `submitQuestion()`. Both actions are timestamped and tied to their own account by the server, never by a client-supplied id.

## Operational caveats

- RLS is authorization, not malware scanning. Add server-side scanning/quarantine before accepting untrusted documents in a higher-risk deployment.
- Browser MIME types and extensions can be spoofed. The adapter pairs approved extensions with canonical MIME values and the bucket repeats the MIME allow-list, but neither validates file contents; add server-side signature inspection and malware scanning for higher-risk deployments.
- Standard uploads are recommended for small files; Supabase recommends resumable TUS uploads above roughly 6 MB.
- Protect student data under applicable privacy/retention rules. Define deletion, export, backup and incident-response procedures before collecting real records.
- Do not put sensitive student details in filenames, logs, URLs, source maps or analytics.
- Review Auth password, email-confirmation, rate-limit, MFA and redirect settings. Teacher/admin accounts should use MFA when available.
- Signed URLs are bearer links until expiry. Generate them only when needed and never send them to unrelated users.
- Deleting a student relationship or assignment cascades database rows but does not remove the underlying private Storage objects. Delete objects through the Storage API first, then delete the database record, and run a periodic orphan audit.
- A publishable/anon key is intentionally visible. If it is abused, RLS must still prevent unauthorized access; rotate it as part of incident response, but do not treat rotation as a substitute for correct policies.
