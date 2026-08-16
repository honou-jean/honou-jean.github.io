// supabase/functions/create-student/index.ts
//
// Lets an authenticated TEACHER create a new STUDENT auth account (with a
// server-generated temporary password) and link that student to themselves
// via public.students, in one atomic-ish call. Requires the service-role
// key for admin.createUser / admin.deleteUser and to bypass RLS on the
// students insert — that key lives only in this server-side function's
// environment and must never be echoed back to the client.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Simple, pragmatic email check — not a full RFC 5322 parser, just enough
// to reject obvious garbage before we hit Supabase auth.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CreateStudentBody {
  email?: unknown;
  fullName?: unknown;
  cohort?: unknown;
}

interface ValidatedInput {
  email: string;
  fullName: string;
  cohort: string | null;
}

function validateBody(
  body: CreateStudentBody,
): { ok: true; data: ValidatedInput } | { ok: false; error: string } {
  const rawEmail = body.email;
  if (typeof rawEmail !== "string") {
    return { ok: false, error: "email is required." };
  }
  const email = rawEmail.trim();
  if (email.length === 0 || email.length > 254 || !EMAIL_RE.test(email)) {
    return { ok: false, error: "email must be a valid email address." };
  }

  const rawFullName = body.fullName;
  if (typeof rawFullName !== "string") {
    return { ok: false, error: "fullName is required." };
  }
  const fullName = rawFullName.trim();
  if (fullName.length === 0 || fullName.length > 120) {
    return {
      ok: false,
      error: "fullName must be between 1 and 120 characters.",
    };
  }

  let cohort: string | null = null;
  if (body.cohort !== undefined && body.cohort !== null) {
    if (typeof body.cohort !== "string") {
      return { ok: false, error: "cohort must be a string if provided." };
    }
    const trimmedCohort = body.cohort.trim();
    if (trimmedCohort.length > 0) {
      if (trimmedCohort.length > 120) {
        return {
          ok: false,
          error: "cohort must be at most 120 characters.",
        };
      }
      cohort = trimmedCohort;
    }
  }

  return { ok: true, data: { email, fullName, cohort } };
}

// CSPRNG-backed temporary password: 20 characters drawn from a mixed
// upper/lower/digit/symbol alphabet via crypto.getRandomValues — Math.random()
// is not appropriate here since this password is handed to a real account.
// Uses rejection sampling (rather than a plain `% alphabet.length`) so every
// symbol is equally likely — otherwise 2^32 not being a multiple of the
// alphabet size would introduce a (tiny, but avoidable) modulo bias.
function generateTemporaryPassword(length = 20): string {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+";
  const alphabetLength = alphabet.length;
  const maxUnbiased =
    Math.floor(0x100000000 / alphabetLength) * alphabetLength;

  let password = "";
  const buf = new Uint32Array(1);
  while (password.length < length) {
    crypto.getRandomValues(buf);
    if (buf[0] < maxUnbiased) {
      password += alphabet[buf[0] % alphabetLength];
    }
  }
  return password;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed." });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
    // Never include the actual env values in this message.
    console.error("create-student: missing required environment variables.");
    return jsonResponse(500, { error: "Server misconfiguration." });
  }

  // Everything below can, in principle, throw instead of resolving to an
  // { error } object (e.g. a transient platform 5xx returning an HTML body
  // that fails JSON parsing inside the SDK). Without this catch-all, such a
  // throw would skip straight past our rollback logic and also skip
  // jsonResponse()/corsHeaders entirely, which — from a browser calling via
  // functions.invoke() — looks like an opaque CORS/network failure rather
  // than a clean error.
  try {
    // Privileged client: used for auth admin operations and for the students
    // insert, which must bypass RLS because the acting "user" here is the
    // service role itself, not the teacher's session.
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Resolve the caller's identity from their own JWT — never trust a
    // client-supplied teacher/user id.
    const authHeader = req.headers.get("Authorization") ?? "";
    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    const callerToken = bearerMatch?.[1];

    if (!callerToken) {
      return jsonResponse(401, {
        error: "Missing or invalid Authorization header.",
      });
    }

    const callerClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: callerData, error: callerError } = await callerClient.auth
      .getUser(callerToken);

    if (callerError || !callerData?.user) {
      return jsonResponse(401, { error: "Invalid or expired session." });
    }

    const callerId = callerData.user.id;

    // Confirm the caller genuinely has a 'teacher' profile role in the
    // database — do not infer this from claims or session metadata.
    const { data: callerProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", callerId)
      .maybeSingle();

    if (profileError) {
      console.error(
        "create-student: failed to load caller profile.",
        profileError,
      );
      return jsonResponse(500, { error: "Unable to verify caller." });
    }

    if (!callerProfile || callerProfile.role !== "teacher") {
      return jsonResponse(403, {
        error: "Only teachers can create student accounts.",
      });
    }

    let body: CreateStudentBody;
    try {
      const parsed = await req.json();
      // `req.json()` happily resolves `null`/numbers/strings/etc. as valid
      // JSON — only a body that is a genuine object is usable here.
      if (typeof parsed !== "object" || parsed === null) {
        return jsonResponse(400, { error: "Request body must be a JSON object." });
      }
      body = parsed as CreateStudentBody;
    } catch {
      return jsonResponse(400, { error: "Request body must be valid JSON." });
    }

    const validation = validateBody(body);
    if (!validation.ok) {
      return jsonResponse(400, { error: validation.error });
    }
    const { email, fullName, cohort } = validation.data;

    const temporaryPassword = generateTemporaryPassword();

    const { data: createdUser, error: createUserError } = await adminClient
      .auth
      .admin.createUser({
        email,
        password: temporaryPassword,
        // Intentional: the teacher hands the temporary password directly to
        // the student, so there is no email-confirmation flow to complete.
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

    if (createUserError || !createdUser?.user) {
      // Prefer the SDK's stable structured error code over pattern-matching
      // prose, which can drift across Supabase versions/config; keep the
      // regex only as a fallback for older/edge-case error shapes.
      const code = (createUserError as { code?: string } | null)?.code;
      const message = createUserError?.message ?? "";
      const alreadyRegistered = code === "email_exists" ||
        /already.*registered|already.*exists/i.test(message);
      return jsonResponse(alreadyRegistered ? 409 : 400, {
        error: alreadyRegistered
          ? "This email is already registered."
          : "Unable to create this account.",
      });
    }

    const newUserId = createdUser.user.id;

    // Guard the insert itself so a thrown error (not just a resolved
    // { error }) still routes into the rollback path below.
    let studentInsertError: unknown = null;
    try {
      const { error } = await adminClient.from("students").insert({
        user_id: newUserId,
        teacher_id: callerId,
        cohort,
        active: true,
      });
      studentInsertError = error;
    } catch (insertException) {
      studentInsertError = insertException;
    }

    if (studentInsertError) {
      // The auth user now exists but isn't linked to a teacher — roll it
      // back rather than leaving an orphaned account. This path should be
      // rare given the step-4 role check, so it's worth investigating if it
      // fires.
      console.error(
        "create-student: students insert failed after auth user creation; " +
          "rolling back orphaned auth user.",
        { newUserId, error: studentInsertError },
      );

      try {
        const { error: deleteError } = await adminClient.auth.admin
          .deleteUser(newUserId);
        if (deleteError) {
          console.error(
            "create-student: rollback deleteUser also failed — manual " +
              "cleanup required for orphaned auth user.",
            { newUserId, error: deleteError },
          );
        }
      } catch (deleteException) {
        console.error(
          "create-student: rollback deleteUser threw — manual cleanup " +
            "required for orphaned auth user.",
          { newUserId, error: deleteException },
        );
      }

      return jsonResponse(500, {
        error: "Unable to link the new student account. Please try again.",
      });
    }

    // This response is the only place the plaintext temporary password ever
    // appears — nothing server-side persists or logs it.
    return jsonResponse(200, {
      email,
      temporaryPassword,
      userId: newUserId,
      fullName,
      cohort,
    });
  } catch (unexpectedError) {
    console.error("create-student: unexpected error.", unexpectedError);
    return jsonResponse(500, { error: "Unexpected error. Please try again." });
  }
});
