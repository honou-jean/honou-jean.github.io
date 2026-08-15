(function initialiseTeachingPortalBackend(global) {
  "use strict";

  const RESOURCE_BUCKET = "teaching-resources";
  const SUBMISSION_BUCKET = "student-submissions";
  const SIGNED_URL_LIFETIME_SECONDS = 600;
  const MAX_FILES_PER_SUBMISSION = 5;
  const MAX_FILE_BYTES = 6 * 1024 * 1024;
  const MAX_QUESTION_LENGTH = 4000;
  const MAX_SUBMISSION_MESSAGE_LENGTH = 4000;
  const SUBMISSION_TYPES_BY_EXTENSION = Object.freeze({
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".odt": "application/vnd.oasis.opendocument.text",
    ".txt": "text/plain",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg"
  });
  const GENERIC_BROWSER_FILE_TYPES = new Set(["", "application/octet-stream"]);

  let client = null;

  class PortalBackendError extends Error {
    constructor(code, message, cause) {
      super(message);
      this.name = "PortalBackendError";
      this.code = code;
      if (cause) this.cause = cause;
    }
  }

  function fail(code, message, cause) {
    throw new PortalBackendError(code, message, cause);
  }

  function config() {
    return global.SUPABASE_CONFIG || {};
  }

  function decodeLegacyKeyRole(key) {
    try {
      const parts = key.split(".");
      if (parts.length !== 3) return null;
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
      const payload = JSON.parse(global.atob(padded));
      return typeof payload.role === "string" ? payload.role : null;
    } catch (_error) {
      return null;
    }
  }

  function containsDocumentationPlaceholder(value) {
    return typeof value === "string"
      && (value.includes("YOUR_PROJECT_REF") || value.includes("REPLACE_WITH"));
  }

  function isBrowserSafeKey(value) {
    if (typeof value !== "string") return false;
    const key = value.trim();
    if (containsDocumentationPlaceholder(key)) return false;
    if (/^sb_publishable_[A-Za-z0-9_-]{16,}$/.test(key)) return true;
    if (/^sb_secret_/i.test(key)) return false;
    return decodeLegacyKeyRole(key) === "anon";
  }

  function isSafeProjectUrl(value) {
    if (typeof value !== "string" || !value.trim() || containsDocumentationPlaceholder(value)) return false;

    try {
      const url = new URL(value.trim());
      if (url.username || url.password || url.search || url.hash) return false;
      if (url.protocol === "https:") return true;
      return url.protocol === "http:" && ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
    } catch (_error) {
      return false;
    }
  }

  function safeHttpsExternalUrl(value) {
    if (
      typeof value !== "string"
      || value !== value.trim()
      || value.length > 2048
      || /\s/u.test(value)
    ) return null;

    try {
      const url = new URL(value);
      if (url.protocol !== "https:" || url.username || url.password || !url.hostname) return null;
      return value;
    } catch (_error) {
      return null;
    }
  }

  function publicKey() {
    const settings = config();
    return String(settings.publishableKey || settings.anonKey || "").trim();
  }

  function hasSdk() {
    return Boolean(global.supabase && typeof global.supabase.createClient === "function");
  }

  function isConfigured() {
    return isSafeProjectUrl(config().url) && isBrowserSafeKey(publicKey()) && hasSdk();
  }

  function getClient() {
    if (client) return client;

    const settings = config();
    const key = publicKey();

    if (!isSafeProjectUrl(settings.url) || !isBrowserSafeKey(key)) {
      fail("NOT_CONFIGURED", "The teaching portal backend is not configured with a safe public key.");
    }
    if (!hasSdk()) {
      fail("SDK_UNAVAILABLE", "The Supabase JavaScript client is unavailable.");
    }

    client = global.supabase.createClient(settings.url.trim(), key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      db: { schema: "public" }
    });

    return client;
  }

  function validUuid(value) {
    return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  function normalizeText(value, maximumLength, required) {
    const text = typeof value === "string" ? value.trim() : "";
    if (required && !text) fail("INVALID_INPUT", "A required text value is missing.");
    if (text.length > maximumLength) fail("INVALID_INPUT", `Text must not exceed ${maximumLength} characters.`);
    return text;
  }

  function backendFailure(error, fallbackCode, fallbackMessage) {
    if (error instanceof PortalBackendError) throw error;
    fail(fallbackCode, fallbackMessage, error);
  }

  async function queryOrFail(query, code, message) {
    const { data, error } = await query;
    if (error) fail(code, message, error);
    return data;
  }

  async function getSession() {
    try {
      const { data, error } = await getClient().auth.getSession();
      if (error) fail("AUTH_ERROR", "The current session could not be read.", error);
      return data.session || null;
    } catch (error) {
      return backendFailure(error, "AUTH_ERROR", "The current session could not be read.");
    }
  }

  async function authenticatedContext() {
    const supabaseClient = getClient();
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !userData.user) {
      fail("AUTH_REQUIRED", "A verified signed-in user is required.", userError || undefined);
    }

    const profile = await queryOrFail(
      supabaseClient
        .from("profiles")
        .select("id, role, full_name, created_at, updated_at")
        .eq("id", userData.user.id)
        .single(),
      "PROFILE_UNAVAILABLE",
      "The signed-in account does not have an accessible portal profile."
    );

    if (!profile || !["teacher", "student"].includes(profile.role)) {
      fail("ACCESS_DENIED", "The signed-in account has no valid portal role.");
    }

    return { client: supabaseClient, user: userData.user, profile };
  }

  async function signIn(credentials) {
    const email = normalizeText(credentials && credentials.email, 254, true).toLowerCase();
    const password = typeof (credentials && credentials.password) === "string" ? credentials.password : "";
    if (!password) fail("INVALID_INPUT", "A password is required.");

    try {
      const { data, error } = await getClient().auth.signInWithPassword({ email, password });
      if (error || !data.session || !data.user) {
        fail("SIGN_IN_FAILED", "Sign-in failed. Check the credentials and account status.", error || undefined);
      }
      return { session: data.session, user: data.user };
    } catch (error) {
      return backendFailure(error, "SIGN_IN_FAILED", "Sign-in failed.");
    }
  }

  async function signOut() {
    try {
      const { error } = await getClient().auth.signOut({ scope: "local" });
      if (error) fail("SIGN_OUT_FAILED", "The local session could not be closed.", error);
      return true;
    } catch (error) {
      return backendFailure(error, "SIGN_OUT_FAILED", "The local session could not be closed.");
    }
  }

  function onAuthStateChange(callback) {
    if (typeof callback !== "function") fail("INVALID_INPUT", "An authentication callback is required.");

    const { data } = getClient().auth.onAuthStateChange((event, session) => {
      callback(event, session || null);
    });

    return function unsubscribe() {
      data.subscription.unsubscribe();
    };
  }

  async function signedResourceRows(rows) {
    return Promise.all((rows || []).map(async (resource) => {
      if (resource.external_url) {
        const externalUrl = safeHttpsExternalUrl(resource.external_url);
        if (!externalUrl || resource.storage_path) {
          fail("RESOURCE_URL_FAILED", "A teaching resource link is invalid.");
        }
        return {
          ...resource,
          resource_kind: "link",
          url: externalUrl,
          signed_url: null,
          signed_url_expires_in: null
        };
      }

      if (!resource.storage_path) {
        fail("RESOURCE_URL_FAILED", "A teaching resource has no valid source.");
      }
      const { data, error } = await getClient()
        .storage
        .from(RESOURCE_BUCKET)
        .createSignedUrl(resource.storage_path, SIGNED_URL_LIFETIME_SECONDS, { download: true });
      if (error || !data || !data.signedUrl) {
        fail("RESOURCE_URL_FAILED", "A private teaching resource could not be authorized.", error || undefined);
      }
      return {
        ...resource,
        resource_kind: "file",
        url: data.signedUrl,
        signed_url: data.signedUrl,
        signed_url_expires_in: SIGNED_URL_LIFETIME_SECONDS
      };
    }));
  }

  async function signedSubmissionRows(rows) {
    return Promise.all((rows || []).map(async (submission) => {
      const files = await Promise.all((submission.file_paths || []).map(async (path) => {
        const { data, error } = await getClient()
          .storage
          .from(SUBMISSION_BUCKET)
          .createSignedUrl(path, SIGNED_URL_LIFETIME_SECONDS, { download: true });
        if (error || !data || !data.signedUrl) {
          fail("SUBMISSION_URL_FAILED", "A private submission file could not be authorized.", error || undefined);
        }
        return {
          path,
          name: path.split("/").pop() || "submission",
          url: data.signedUrl,
          signed_url: data.signedUrl,
          signed_url_expires_in: SIGNED_URL_LIFETIME_SECONDS
        };
      }));
      return { ...submission, files };
    }));
  }

  async function getTeacherDashboard(context) {
    const teacherId = context.user.id;
    const [studentRows, assignments, questions] = await Promise.all([
      queryOrFail(
        context.client
          .from("students")
          .select("user_id, teacher_id, cohort, active, created_at, updated_at")
          .eq("teacher_id", teacherId)
          .order("created_at", { ascending: true }),
        "DASHBOARD_FAILED",
        "Assigned students could not be loaded."
      ),
      queryOrFail(
        context.client
          .from("assignments")
          .select("id, teacher_id, student_id, title, description, instructions, due_at, status, published_at, created_at, updated_at")
          .eq("teacher_id", teacherId)
          .order("created_at", { ascending: false }),
        "DASHBOARD_FAILED",
        "Assignments could not be loaded."
      ),
      queryOrFail(
        context.client
          .from("questions")
          .select("id, assignment_id, student_id, teacher_id, message, answer, status, answered_at, created_at, updated_at")
          .eq("teacher_id", teacherId)
          .order("created_at", { ascending: false }),
        "DASHBOARD_FAILED",
        "Questions could not be loaded."
      )
    ]);

    const assignmentIds = assignments.map((assignment) => assignment.id);
    const studentIds = studentRows.map((student) => student.user_id);

    const [studentProfiles, resources, submissions] = await Promise.all([
      studentIds.length
        ? queryOrFail(
          context.client.from("profiles").select("id, role, full_name").in("id", studentIds),
          "DASHBOARD_FAILED",
          "Student profiles could not be loaded."
        )
        : [],
      assignmentIds.length
        ? queryOrFail(
          context.client
            .from("resources")
            .select("id, assignment_id, title, description, storage_path, external_url, mime_type, file_size_bytes, visible, created_at, updated_at")
            .in("assignment_id", assignmentIds)
            .order("created_at", { ascending: false }),
          "DASHBOARD_FAILED",
          "Teaching resources could not be loaded."
        )
        : [],
      assignmentIds.length
        ? queryOrFail(
          context.client
            .from("submissions")
            .select("id, assignment_id, student_id, file_paths, message, status, submitted_at, feedback, grade, reviewed_at, created_at, updated_at")
            .in("assignment_id", assignmentIds)
            .order("submitted_at", { ascending: false }),
          "DASHBOARD_FAILED",
          "Student submissions could not be loaded."
        )
        : []
    ]);

    const profileById = new Map(studentProfiles.map((profile) => [profile.id, profile]));

    return {
      student: null,
      teacher: context.profile,
      students: studentRows.map((student) => ({ ...student, profile: profileById.get(student.user_id) || null })),
      assignments,
      resources: await signedResourceRows(resources),
      submissions: await signedSubmissionRows(submissions),
      questions
    };
  }

  async function getStudentDashboard(context) {
    const student = await queryOrFail(
      context.client
        .from("students")
        .select("user_id, teacher_id, cohort, active, created_at, updated_at")
        .eq("user_id", context.user.id)
        .maybeSingle(),
      "DASHBOARD_FAILED",
      "The student assignment could not be loaded."
    );

    if (!student || !student.active) {
      fail("PROFILE_INCOMPLETE", "This student profile is not assigned to an active teacher relationship.");
    }

    const [teacher, assignments, submissions, questions] = await Promise.all([
      queryOrFail(
        context.client.from("profiles").select("id, role, full_name").eq("id", student.teacher_id).single(),
        "DASHBOARD_FAILED",
        "The assigned teacher profile could not be loaded."
      ),
      queryOrFail(
        context.client
          .from("assignments")
          .select("id, teacher_id, student_id, title, description, instructions, due_at, status, published_at, created_at, updated_at")
          .eq("student_id", context.user.id)
          .in("status", ["published", "closed"])
          .order("created_at", { ascending: false }),
        "DASHBOARD_FAILED",
        "Assignments could not be loaded."
      ),
      queryOrFail(
        context.client
          .from("submissions")
          .select("id, assignment_id, student_id, file_paths, message, status, submitted_at, feedback, grade, reviewed_at, created_at, updated_at")
          .eq("student_id", context.user.id)
          .order("submitted_at", { ascending: false }),
        "DASHBOARD_FAILED",
        "Submissions could not be loaded."
      ),
      queryOrFail(
        context.client
          .from("questions")
          .select("id, assignment_id, student_id, teacher_id, message, answer, status, answered_at, created_at, updated_at")
          .eq("student_id", context.user.id)
          .order("created_at", { ascending: false }),
        "DASHBOARD_FAILED",
        "Questions could not be loaded."
      )
    ]);

    const assignmentIds = assignments.map((assignment) => assignment.id);
    const resources = assignmentIds.length
      ? await queryOrFail(
        context.client
          .from("resources")
          .select("id, assignment_id, title, description, storage_path, external_url, mime_type, file_size_bytes, visible, created_at, updated_at")
          .in("assignment_id", assignmentIds)
          .eq("visible", true)
          .order("created_at", { ascending: false }),
        "DASHBOARD_FAILED",
        "Teaching resources could not be loaded."
      )
      : [];

    return {
      student,
      teacher,
      students: [],
      assignments,
      resources: await signedResourceRows(resources),
      submissions: await signedSubmissionRows(submissions),
      questions
    };
  }

  async function getDashboardData() {
    try {
      const context = await authenticatedContext();
      const roleData = context.profile.role === "teacher"
        ? await getTeacherDashboard(context)
        : await getStudentDashboard(context);

      return {
        role: context.profile.role,
        profile: context.profile,
        ...roleData,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      return backendFailure(error, "DASHBOARD_FAILED", "The portal dashboard could not be loaded.");
    }
  }

  async function submitQuestion(input) {
    const assignmentId = input && input.assignmentId;
    const message = normalizeText(input && input.message, MAX_QUESTION_LENGTH, true);
    if (!validUuid(assignmentId)) fail("INVALID_INPUT", "A valid assignment identifier is required.");

    try {
      const context = await authenticatedContext();
      if (context.profile.role !== "student") fail("ACCESS_DENIED", "Only students can submit questions.");

      return await queryOrFail(
        context.client
          .from("questions")
          .insert({ assignment_id: assignmentId, message })
          .select("id, assignment_id, student_id, teacher_id, message, answer, status, answered_at, created_at, updated_at")
          .single(),
        "QUESTION_FAILED",
        "The question could not be submitted."
      );
    } catch (error) {
      return backendFailure(error, "QUESTION_FAILED", "The question could not be submitted.");
    }
  }

  function safeFileName(value) {
    const original = typeof value === "string" ? value.split(/[\\/]/).pop() : "file";
    const normalized = original
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z0-9._-]+/g, "-")
      .replace(/\.{2,}/g, ".")
      .replace(/^-+|-+$/g, "")
      .slice(-100);
    return normalized || "file";
  }

  function uniqueId() {
    if (!global.crypto || typeof global.crypto.randomUUID !== "function") {
      fail("BROWSER_UNSUPPORTED", "Secure UUID generation is unavailable in this browser context.");
    }
    return global.crypto.randomUUID();
  }

  function normalizedFiles(files) {
    const list = files ? Array.from(files) : [];
    if (!list.length || list.length > MAX_FILES_PER_SUBMISSION) {
      fail("INVALID_INPUT", `Choose between 1 and ${MAX_FILES_PER_SUBMISSION} files.`);
    }

    return list.map((file) => {
      if (
        !file
        || typeof file.name !== "string"
        || typeof file.type !== "string"
        || !Number.isSafeInteger(file.size)
      ) {
        fail("INVALID_INPUT", "Every submission item must be a browser File object.");
      }
      if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
        fail("FILE_TOO_LARGE", "Each file must be non-empty and no larger than 6 MiB.");
      }

      const baseName = file.name.split(/[\\/]/).pop() || "";
      const dotIndex = baseName.lastIndexOf(".");
      const extension = dotIndex > 0 ? baseName.slice(dotIndex).toLowerCase() : "";
      const canonicalType = SUBMISSION_TYPES_BY_EXTENSION[extension];
      const declaredType = file.type.trim().toLowerCase();

      if (
        !canonicalType
        || (!GENERIC_BROWSER_FILE_TYPES.has(declaredType) && declaredType !== canonicalType)
      ) {
        fail(
          "UNSUPPORTED_FILE_TYPE",
          "Files must be PDF, DOCX, ODT, TXT, PNG, JPG, or JPEG, with a matching file type."
        );
      }

      return { file, contentType: canonicalType };
    });
  }

  async function uploadSubmission(input) {
    const assignmentId = input && input.assignmentId;
    const message = normalizeText(input && input.message, MAX_SUBMISSION_MESSAGE_LENGTH, false);
    if (!validUuid(assignmentId)) fail("INVALID_INPUT", "A valid assignment identifier is required.");
    const files = normalizedFiles(input && input.files);
    const uploadedPaths = [];
    let submissionCreated = false;

    try {
      const context = await authenticatedContext();
      if (context.profile.role !== "student") fail("ACCESS_DENIED", "Only students can upload submissions.");

      const assignment = await queryOrFail(
        context.client
          .from("assignments")
          .select("id, student_id, status")
          .eq("id", assignmentId)
          .single(),
        "ASSIGNMENT_UNAVAILABLE",
        "The assignment is unavailable to this student."
      );
      if (assignment.student_id !== context.user.id) {
        fail("ASSIGNMENT_UNAVAILABLE", "The assignment is not assigned to this student.");
      }
      if (assignment.status !== "published") fail("ASSIGNMENT_CLOSED", "This assignment is not accepting submissions.");

      for (const normalizedFile of files) {
        const { file, contentType } = normalizedFile;
        const path = `${context.user.id}/${assignmentId}/${uniqueId()}-${safeFileName(file.name)}`;
        const { error } = await context.client.storage.from(SUBMISSION_BUCKET).upload(path, file, {
          cacheControl: "3600",
          contentType,
          upsert: false
        });
        if (error) fail("UPLOAD_FAILED", "A submission file could not be uploaded.", error);
        uploadedPaths.push(path);
      }

      const submission = await queryOrFail(
        context.client
          .from("submissions")
          .insert({ assignment_id: assignmentId, file_paths: uploadedPaths, message: message || null })
          .select("id, assignment_id, student_id, file_paths, message, status, submitted_at, feedback, grade, reviewed_at, created_at, updated_at")
          .single(),
        "SUBMISSION_FAILED",
        "The submission record could not be created."
      );
      submissionCreated = true;

      return (await signedSubmissionRows([submission]))[0];
    } catch (error) {
      if (!submissionCreated && uploadedPaths.length && client) {
        try {
          await client.storage.from(SUBMISSION_BUCKET).remove(uploadedPaths);
        } catch (_cleanupError) {
          // The original failure remains authoritative. Orphans can be audited by path.
        }
      }
      return backendFailure(error, "SUBMISSION_FAILED", "The submission could not be uploaded.");
    }
  }

  global.TEACHING_PORTAL_BACKEND = Object.freeze({
    isConfigured,
    getSession,
    signIn,
    signOut,
    onAuthStateChange,
    getDashboardData,
    submitQuestion,
    uploadSubmission
  });
})(window);
