"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("assets/js/supabase-client.js", "utf8");
const studentId = "10000000-0000-4000-8000-000000000001";
const teacherId = "20000000-0000-4000-8000-000000000002";
const assignmentId = "30000000-0000-4000-8000-000000000003";
// Rejection-only synthetic fixtures are assembled so no credential-shaped literal is committed.
const rejectedSecretFixture = `${["sb", "secret"].join("_")}_${"x".repeat(16)}`;
const acceptedPublishableFixture = `${["sb", "publishable"].join("_")}_${"x".repeat(16)}`;
const documentationPlaceholderKey = `${["sb", "publishable"].join("_")}_${[
  "REPLACE", "WITH", "THE", "REAL", "PUBLIC", "KEY"
].join("_")}`;

function loadAdapter(config, sdk) {
  const browser = {
    SUPABASE_CONFIG: config,
    supabase: sdk,
    atob: globalThis.atob,
    crypto: globalThis.crypto
  };

  vm.runInNewContext(source, {
    window: browser,
    URL,
    Set,
    Map,
    Promise,
    Array,
    Object,
    String,
    Boolean,
    Error,
    JSON,
    Math,
    Date,
    RegExp
  });

  return browser.TEACHING_PORTAL_BACKEND;
}

function queryResult(table, filters, externalUrl) {
  if (table === "profiles") {
    const id = filters.get("id");
    return id === studentId
      ? { id: studentId, role: "student", full_name: "Student" }
      : { id: teacherId, role: "teacher", full_name: "Teacher" };
  }
  if (table === "students") {
    return {
      user_id: studentId,
      teacher_id: teacherId,
      cohort: null,
      active: true
    };
  }
  if (table === "assignments") {
    return [{
      id: assignmentId,
      teacher_id: teacherId,
      student_id: studentId,
      title: "Assignment",
      status: "published"
    }];
  }
  if (table === "resources") {
    return [{
      id: "40000000-0000-4000-8000-000000000004",
      assignment_id: assignmentId,
      title: "Reference",
      storage_path: null,
      external_url: externalUrl,
      visible: true
    }];
  }
  return [];
}

function fakeSdk(externalUrl) {
  const observedFilters = [];
  const client = {
    auth: {
      async getUser() {
        return { data: { user: { id: studentId } }, error: null };
      }
    },
    from(table) {
      const filters = new Map();
      const builder = {
        select() { return builder; },
        eq(column, value) {
          filters.set(column, value);
          observedFilters.push({ table, column, value });
          return builder;
        },
        in() { return builder; },
        order() { return builder; },
        async single() { return { data: queryResult(table, filters, externalUrl), error: null }; },
        async maybeSingle() { return { data: queryResult(table, filters, externalUrl), error: null }; },
        then(resolve, reject) {
          return Promise.resolve({ data: queryResult(table, filters, externalUrl), error: null })
            .then(resolve, reject);
        }
      };
      return builder;
    },
    storage: {
      from() {
        return {
          createSignedUrl() {
            throw new Error("External resources must not use Storage signing.");
          }
        };
      }
    }
  };

  return { observedFilters, createClient() { return client; } };
}

function fakeUploadSdk() {
  const uploads = [];
  let insertedSubmission = null;
  const client = {
    auth: {
      async getUser() {
        return { data: { user: { id: studentId } }, error: null };
      }
    },
    from(table) {
      const builder = {
        select() { return builder; },
        eq() { return builder; },
        insert(value) { insertedSubmission = value; return builder; },
        async single() {
          if (table === "profiles") {
            return { data: { id: studentId, role: "student", full_name: "Student" }, error: null };
          }
          if (table === "assignments") {
            return {
              data: { id: assignmentId, student_id: studentId, status: "published" },
              error: null
            };
          }
          if (table === "submissions") {
            return {
              data: {
                id: "50000000-0000-4000-8000-000000000005",
                student_id: studentId,
                status: "submitted",
                ...insertedSubmission
              },
              error: null
            };
          }
          throw new Error(`Unexpected table: ${table}`);
        }
      };
      return builder;
    },
    storage: {
      from(bucket) {
        assert.equal(bucket, "student-submissions");
        return {
          async upload(path, file, options) {
            uploads.push({ path, file, options });
            return { data: { path }, error: null };
          },
          async createSignedUrl(path) {
            return { data: { signedUrl: `https://signed.example/${path}` }, error: null };
          },
          async remove() {
            return { data: [], error: null };
          }
        };
      }
    }
  };

  return { uploads, createClient() { return client; } };
}

async function main() {
  const methodNames = [
    "getDashboardData",
    "getSession",
    "isConfigured",
    "onAuthStateChange",
    "signIn",
    "signOut",
    "submitQuestion",
    "uploadSubmission"
  ];
  const empty = loadAdapter({ url: "", publishableKey: "" });

  assert.deepEqual(Object.keys(empty).sort(), methodNames);
  assert.equal(Object.isFrozen(empty), true);
  assert.equal(empty.isConfigured(), false);
  await assert.rejects(empty.getSession(), (error) => error.code === "NOT_CONFIGURED");
  await assert.rejects(empty.uploadSubmission({
    assignmentId,
    files: [{
      name: "submission.odt",
      size: 6 * 1024 * 1024,
      type: "application/vnd.oasis.opendocument.text"
    }],
    message: ""
  }), (error) => error.code === "NOT_CONFIGURED");
  await assert.rejects(empty.uploadSubmission({
    assignmentId,
    files: [{
      name: "too-large.odt",
      size: (6 * 1024 * 1024) + 1,
      type: "application/vnd.oasis.opendocument.text"
    }],
    message: ""
  }), (error) => error.code === "FILE_TOO_LARGE");
  await assert.rejects(empty.uploadSubmission({
    assignmentId,
    files: [{ name: "disguised.html", size: 10, type: "application/pdf" }],
    message: ""
  }), (error) => error.code === "UNSUPPORTED_FILE_TYPE");
  await assert.rejects(empty.uploadSubmission({
    assignmentId,
    files: [{ name: "mismatched.pdf", size: 10, type: "image/png" }],
    message: ""
  }), (error) => error.code === "UNSUPPORTED_FILE_TYPE");
  await assert.rejects(empty.uploadSubmission({
    assignmentId,
    files: [{ name: "legacy.doc", size: 10, type: "application/msword" }],
    message: ""
  }), (error) => error.code === "UNSUPPORTED_FILE_TYPE");

  const neverCreate = { createClient() { throw new Error("isConfigured must not initialize."); } };
  assert.equal(loadAdapter({
    url: "https://example.invalid",
    publishableKey: rejectedSecretFixture
  }, neverCreate).isConfigured(), false);
  assert.equal(loadAdapter({
    url: "https://example.invalid",
    publishableKey: acceptedPublishableFixture
  }, neverCreate).isConfigured(), true);
  assert.equal(loadAdapter({
    url: "https://YOUR_PROJECT_REF.supabase.co",
    publishableKey: acceptedPublishableFixture
  }, neverCreate).isConfigured(), false);
  assert.equal(loadAdapter({
    url: "https://example.invalid",
    publishableKey: documentationPlaceholderKey
  }, neverCreate).isConfigured(), false);

  const anonPayload = Buffer.from(JSON.stringify({ role: "anon" })).toString("base64url");
  const rejectedPrivilegedRole = ["service", "role"].join("_");
  const servicePayload = Buffer.from(JSON.stringify({ role: rejectedPrivilegedRole })).toString("base64url");
  assert.equal(loadAdapter({
    url: "https://example.invalid",
    anonKey: `x.${anonPayload}.x`
  }, neverCreate).isConfigured(), true);
  assert.equal(loadAdapter({
    url: "https://example.invalid",
    anonKey: `x.${servicePayload}.x`
  }, neverCreate).isConfigured(), false);

  const configured = {
    url: "https://example.invalid",
    publishableKey: acceptedPublishableFixture
  };
  const uploadSdk = fakeUploadSdk();
  await loadAdapter(configured, uploadSdk).uploadSubmission({
    assignmentId,
    files: [
      { name: "answer.PDF", size: 10, type: "" },
      {
        name: "essay.docx",
        size: 10,
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      },
      { name: "notes.odt", size: 10, type: "application/octet-stream" },
      { name: "sources.txt", size: 10, type: "text/plain" },
      { name: "diagram.png", size: 10, type: "image/png" }
    ],
    message: "Completed work"
  });
  await loadAdapter(configured, uploadSdk).uploadSubmission({
    assignmentId,
    files: [
      { name: "photo.jpg", size: 10, type: "application/octet-stream" },
      { name: "scan.jpeg", size: 10, type: "image/jpeg" }
    ],
    message: "Image work"
  });
  assert.deepEqual(
    uploadSdk.uploads.map((upload) => upload.options.contentType),
    [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.oasis.opendocument.text",
      "text/plain",
      "image/png",
      "image/jpeg",
      "image/jpeg"
    ]
  );

  const linkSdk = fakeSdk("https://trusted.example.edu/reference");
  const dashboard = await loadAdapter(configured, linkSdk).getDashboardData();
  assert.equal(dashboard.assignments[0].student_id, studentId);
  assert.equal(linkSdk.observedFilters.some((filter) => (
    filter.table === "assignments"
      && filter.column === "student_id"
      && filter.value === studentId
  )), true);
  assert.equal(dashboard.resources[0].resource_kind, "link");
  assert.equal(dashboard.resources[0].url, "https://trusted.example.edu/reference");
  assert.equal(dashboard.resources[0].signed_url, null);

  await assert.rejects(
    loadAdapter(configured, fakeSdk("http://unsafe.example/reference")).getDashboardData(),
    (error) => error.code === "RESOURCE_URL_FAILED"
  );

  console.log("adapter-contract: ok");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
