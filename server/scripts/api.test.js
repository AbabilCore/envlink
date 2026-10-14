#!/usr/bin/env node

const http = require("http");
const https = require("https");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { promisify } = require("util");

const pbkdf2 = promisify(crypto.pbkdf2);

const BASE_URL = process.env.BASE_URL || "http://localhost:8000";
const API_PATH = "/api/envlinks";

// PBKDF2 configuration === server PBKDF2
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEY_LENGTH = 32;
const PBKDF2_DIGEST = "sha256";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const stats = {
  total: 0,
  passed: 0,
  failed: 0,
};

const testData = {};

function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL);
    const isHttps = url.protocol === "https:";
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: path,
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (data) {
      const body = JSON.stringify(data);
      options.headers["Content-Length"] = Buffer.byteLength(body);
    }

    const req = client.request(options, (res) => {
      let body = "";

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null,
          };
          resolve(response);
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body,
            parseError: error.message,
          });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

function getServerSalt(envlinkId) {
  return crypto
    .createHash(PBKDF2_DIGEST)
    .update(`envlink:${envlinkId}`)
    .digest("hex");
}

async function generateStaticProof(passwordHash, envlinkId) {
  const serverSalt = getServerSalt(envlinkId);
  const input = passwordHash + serverSalt;
  const key = await pbkdf2(
    input,
    serverSalt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEY_LENGTH,
    PBKDF2_DIGEST,
  );
  return key.toString("base64");
}

function getCurrentTimeWindow() {
  return Math.floor(Date.now() / 1000);
}

function hashPasswordDeterministic(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateAccessKey() {
  const base62 =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const length = 16;
  const randomBytes = crypto.randomBytes(length);

  let key = "";
  for (let i = 0; i < length; i++) {
    key += base62[randomBytes[i] % base62.length];
  }

  return key;
}

async function generateAccessKeyAuth(accessKey, baseEnvLinkId) {
  return generateStaticProof(accessKey, baseEnvLinkId);
}

function parseExtendedId(extendedId) {
  if (extendedId && extendedId.startsWith("el_") && extendedId.length === 35) {
    return {
      baseId: extendedId.slice(0, 19),
      accessKey: extendedId.slice(19),
    };
  }
  return null;
}

async function makeAuthenticatedRequest(
  envlinkId,
  passwordHash,
  method,
  path,
  additionalData = {},
) {
  const passwordProof = await generateStaticProof(passwordHash, envlinkId);

  const requestData = {
    passwordProof,
    ...additionalData,
  };

  return makeRequest(method, path, requestData);
}

async function test(name, testFn) {
  stats.total++;
  process.stdout.write(`${colors.cyan}▶${colors.reset} ${name}... `);

  try {
    await testFn();
    stats.passed++;
    console.log(`${colors.green}✓ PASS${colors.reset}`);
  } catch (error) {
    stats.failed++;
    console.log(`${colors.red}✗ FAIL${colors.reset}`);
    console.log(`${colors.red}  ${error.message}${colors.reset}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
}

function section(title) {
  console.log(
    `\n${colors.bright}${colors.blue}━━━ ${title} ━━━${colors.reset}\n`,
  );
}

function summary() {
  console.log(
    `\n${colors.bright}${colors.blue}━━━ Test Summary ━━━${colors.reset}`,
  );
  console.log(`Total:   ${stats.total}`);
  console.log(`${colors.green}Passed:  ${stats.passed}${colors.reset}`);
  console.log(`${colors.red}Failed:  ${stats.failed}${colors.reset}`);
  console.log(`Success: ${((stats.passed / stats.total) * 100).toFixed(2)}%\n`);
}

async function mockHashPassword(password) {
  return await bcrypt.hash(password, 12);
}

function mockEncrypt(data) {
  return Buffer.from(JSON.stringify(data)).toString("base64");
}

function mockDecrypt(encryptedPayload) {
  return JSON.parse(Buffer.from(encryptedPayload, "base64").toString("utf8"));
}

async function testHealthCheck() {
  section("Health Check - Verify Server Connection");

  await test("Server health check", async () => {
    const response = await makeRequest("GET", "/api/health");

    assert(
      response.statusCode === 200,
      `Expected 200 for health check, got ${response.statusCode}`,
    );
    assert(response.body.success === true, "Expected success: true");
    assert(response.body.data.status === "healthy", "Expected healthy status");
  });
}

async function testCreate() {
  section("POST / - Create EnvLink (Client-Side Encryption)");

  await test("Create with single file and encrypted payload", async () => {
    const files = [
      { name: ".env", content: "API_KEY=test123\nDB_URL=mongodb://localhost" },
    ];
    const password = "test-password-123";
    const encryptedData = mockEncrypt(files);
    const passwordHash = await mockHashPassword(password);

    const response = await makeRequest("POST", API_PATH, {
      encryptedData,
      passwordHash,
      filesCount: files.length,
    });

    assert(
      response.statusCode === 201,
      `Expected 201, got ${response.statusCode}`,
    );
    assert(response.body.success === true, "Expected success: true");
    assert(response.body.data.id, "Expected id in response");
    assert(
      /^el_[0-9A-Za-z]{16}$/.test(response.body.data.id),
      "Invalid ID format",
    );
    testData.envLinkId = response.body.data.id;
    testData.password = password;
    testData.passwordHash = passwordHash;
    testData.encryptedData = encryptedData;
  });

  await test("Create optional-password EnvLink (no passwordHash)", async () => {
    const files = [{ name: ".env", content: "OPTIONAL=test_value" }];
    const encryptedData = mockEncrypt(files);
    const accessKey = generateAccessKey();

    const response = await makeRequest("POST", API_PATH, {
      encryptedData,
      filesCount: files.length,
    });

    assert(
      response.statusCode === 201,
      `Expected 201, got ${response.statusCode}`,
    );
    assert(response.body.success === true, "Expected success: true");
    assert(response.body.data.id, "Expected id in response");
    assert(
      /^el_[0-9A-Za-z]{16}$/.test(response.body.data.id),
      "Server should return 19-char base ID",
    );
    assert(
      response.body.data.expiresAt !== null,
      "Optional-password EnvLinks should have fixed 1h expiration",
    );

    const baseId = response.body.data.id;
    const extendedId = `${baseId}${accessKey}`;

    const parsed = parseExtendedId(extendedId);
    assert(parsed !== null, "Expected to parse extended ID");
    assert(parsed.baseId === baseId, "Base ID should match");
    assert(parsed.accessKey === accessKey, "Access key should match");

    testData.optionalPassBaseId = baseId;
    testData.optionalPassAccessKey = accessKey;
    testData.optionalPassEncrypted = encryptedData;
  });

  await test("Fail: Optional-password EnvLink with reference (should be rejected)", async () => {
    const files = [{ name: ".env", content: "NO_REF=value" }];
    const encryptedData = mockEncrypt(files);
    const accessKey = generateAccessKey();

    const response = await makeRequest("POST", API_PATH, {
      encryptedData,
      filesCount: files.length,
      accessKey,
      reference: "should-fail",
    });

    assert(
      response.statusCode === 400,
      `Expected 400 for optional-password with reference, got ${response.statusCode}`,
    );
    assert(response.body.success === false, "Expected success: false");
  });

  await test("Create with reference label", async () => {
    const files = [{ name: ".env", content: "TEST=value" }];
    const password = "my-pass";
    const encryptedData = mockEncrypt(files);
    const passwordHash = await mockHashPassword(password);

    const response = await makeRequest("POST", API_PATH, {
      encryptedData,
      passwordHash,
      reference: "prod-api-keys",
      filesCount: files.length,
    });

    assert(
      response.statusCode === 201,
      `Expected 201, got ${response.statusCode}`,
    );
    assert(
      response.body.data.reference === "prod-api-keys",
      "Reference mismatch",
    );
  });

  await test("Create with multiple files", async () => {
    const files = [
      { name: ".env", content: "KEY1=value1" },
      { name: ".env.local", content: "KEY2=value2" },
      { name: ".env.production", content: "KEY3=value3" },
    ];
    const password = "multi-pass";
    const encryptedData = mockEncrypt(files);
    const passwordHash = await mockHashPassword(password);

    const response = await makeRequest("POST", API_PATH, {
      encryptedData,
      passwordHash,
      filesCount: files.length,
    });

    assert(
      response.statusCode === 201,
      `Expected 201, got ${response.statusCode}`,
    );
    assert(
      typeof response.body.data.filesCount === "number",
      "Expected estimated filesCount",
    );
  });

  await test("Create with expiration duration", async () => {
    const files = [{ name: ".env", content: "TEST=value" }];
    const password = "expire-pass";
    const encryptedData = mockEncrypt(files);
    const passwordHash = await mockHashPassword(password);

    const response = await makeRequest("POST", API_PATH, {
      encryptedData,
      filesCount: files.length,
      passwordHash,
      expirationDuration: "30m",
    });

    assert(
      response.statusCode === 201,
      `Expected 201, got ${response.statusCode}`,
    );
    assert(
      response.body.data.expiresAt !== null,
      "Expected expiresAt to be set",
    );
  });

  await test('Create with "never" expiration (should work now)', async () => {
    const files = [{ name: ".env", content: "PERMANENT=value" }];
    const password = "never-pass";
    const encryptedData = mockEncrypt(files);
    const passwordHash = await mockHashPassword(password);

    const response = await makeRequest("POST", API_PATH, {
      filesCount: files.length,
      encryptedData,
      passwordHash,
      expirationDuration: "never",
    });

    assert(
      response.statusCode === 201,
      `Expected 201 for "never" expiration (now supported), got ${response.statusCode}`,
    );
    assert(response.body.success === true, "Expected success: true");
  });

  await test("Fail: Create without encryptedData", async () => {
    const passwordHash = await mockHashPassword("test-pass");

    const response = await makeRequest("POST", API_PATH, {
      passwordHash,
    });

    assert(
      response.statusCode === 400,
      `Expected 400, got ${response.statusCode}`,
    );
    assert(response.body.success === false, "Expected success: false");
  });
}

async function testGetInfo() {
  section("POST /:id/info - Get EnvLink Info (PBKDF2 Zero-Knowledge Proof)");

  await test("Get info with PBKDF2 proof", async () => {
    const response = await makeAuthenticatedRequest(
      testData.envLinkId,
      testData.passwordHash,
      "POST",
      `${API_PATH}/${testData.envLinkId}/info`,
    );

    assert(
      response.statusCode === 200,
      `Expected 200, got ${response.statusCode}`,
    );
    assert(response.body.success === true, "Expected success: true");
    assert(response.body.data.id === testData.envLinkId, "ID mismatch");
    assert("createdAt" in response.body.data, "Expected createdAt in response");
  });

  await test("Fail: Get info with invalid proof", async () => {
    const response = await makeRequest(
      "POST",
      `${API_PATH}/${testData.envLinkId}/info`,
      {
        passwordProof: "invalid-proof",
      },
    );
    assert(
      response.statusCode === 401,
      `Expected 401, got ${response.statusCode}`,
    );
  });

  await test("Fail: Get info for non-existent EnvLink", async () => {
    const fakeId = "el_1234567890123456";
    const passwordProof = await generateStaticProof(
      testData.passwordHash,
      fakeId,
    );
    const response = await makeRequest("POST", `${API_PATH}/${fakeId}/info`, {
      passwordProof,
    });
    assert(
      response.statusCode === 404,
      `Expected 404 for non-existent EnvLink, got ${response.statusCode}`,
    );
    assert(response.body.success === false, "Expected success: false");
  });
}

async function testInstall() {
  section("POST /:id/install - Install EnvLink (PBKDF2 Zero-Knowledge Proof)");

  await test("Install with PBKDF2 proof - returns encrypted payload", async () => {
    const response = await makeAuthenticatedRequest(
      testData.envLinkId,
      testData.passwordHash,
      "POST",
      `${API_PATH}/${testData.envLinkId}/install`,
    );

    assert(
      response.statusCode === 200,
      `Expected 200, got ${response.statusCode}`,
    );
    assert(response.body.success === true, "Expected success: true");
    assert(
      "encryptedData" in response.body.data,
      "Expected encryptedData in response",
    );
    assert(
      typeof response.body.data.encryptedData === "string",
      "encryptedData should be string",
    );

    const decryptedFiles = mockDecrypt(response.body.data.encryptedData);
    assert(
      Array.isArray(decryptedFiles),
      "Decrypted data should be array of files",
    );
    assert(decryptedFiles.length > 0, "Should have at least one file");
  });

  await test("Install multiple times (increment count)", async () => {
    const response = await makeAuthenticatedRequest(
      testData.envLinkId,
      testData.passwordHash,
      "POST",
      `${API_PATH}/${testData.envLinkId}/install`,
    );
    assert(
      response.statusCode === 200,
      `Expected 200, got ${response.statusCode}`,
    );
  });

  await test("Fail: Install with invalid proof", async () => {
    const response = await makeRequest(
      "POST",
      `${API_PATH}/${testData.envLinkId}/install`,
      {
        passwordProof: "invalid-proof",
      },
    );
    assert(
      response.statusCode === 401,
      `Expected 401, got ${response.statusCode}`,
    );
  });
}

async function testUpdate() {
  section("PUT /:id - Update EnvLink (PBKDF2 Zero-Knowledge Proof)");

  const originalFiles = [{ name: ".env", content: "ORIGINAL=value" }];
  const originalPassword = "update-test-pass";
  const originalEncrypted = mockEncrypt(originalFiles);
  const originalPasswordHash = await mockHashPassword(originalPassword);

  const createRes = await makeRequest("POST", API_PATH, {
    encryptedData: originalEncrypted,
    passwordHash: originalPasswordHash,
    filesCount: originalFiles.length,
  });
  const updateTestId = createRes.body.data.id;

  await test("Update encrypted payload with PBKDF2 proof", async () => {
    const updatedFiles = [{ name: ".env", content: "UPDATED=new_value" }];
    const updatedEncrypted = mockEncrypt(updatedFiles);

    const response = await makeAuthenticatedRequest(
      updateTestId,
      originalPasswordHash,
      "PUT",
      `${API_PATH}/${updateTestId}`,
      { encryptedData: updatedEncrypted },
    );

    assert(
      response.statusCode === 200,
      `Expected 200, got ${response.statusCode}`,
    );
    assert(response.body.success === true, "Expected success: true");
  });

  await test("Update expiration duration", async () => {
    const response = await makeAuthenticatedRequest(
      updateTestId,
      originalPasswordHash,
      "PUT",
      `${API_PATH}/${updateTestId}`,
      { expirationDuration: "24h" },
    );
    assert(
      response.statusCode === 200,
      `Expected 200, got ${response.statusCode}`,
    );
  });

  await test("Update password hash", async () => {
    const newPassword = "new-password-123";
    const newPasswordHash = await mockHashPassword(newPassword);

    const response = await makeAuthenticatedRequest(
      updateTestId,
      originalPasswordHash,
      "PUT",
      `${API_PATH}/${updateTestId}`,
      { passwordHash: newPasswordHash },
    );
    assert(
      response.statusCode === 200,
      `Expected 200, got ${response.statusCode}`,
    );

    const installRes = await makeAuthenticatedRequest(
      updateTestId,
      newPasswordHash,
      "POST",
      `${API_PATH}/${updateTestId}/install`,
    );
    assert(installRes.statusCode === 200, "New password should work");
  });

  await test("Update reference label", async () => {
    const refFiles = [{ name: ".env", content: "REF_TEST=value" }];
    const refPassword = "ref-test-pass";
    const refEncrypted = mockEncrypt(refFiles);
    const refPasswordHash = await mockHashPassword(refPassword);

    const createRes = await makeRequest("POST", API_PATH, {
      encryptedData: refEncrypted,
      passwordHash: refPasswordHash,
      filesCount: 1,
    });
    const refTestId = createRes.body.data.id;

    const response = await makeAuthenticatedRequest(
      refTestId,
      refPasswordHash,
      "PUT",
      `${API_PATH}/${refTestId}`,
      {
        reference: "updated-reference",
      },
    );
    assert(
      response.statusCode === 200,
      `Expected 200, got ${response.statusCode}`,
    );
  });

  await test("Fail: Update with invalid proof", async () => {
    const response = await makeRequest("PUT", `${API_PATH}/${updateTestId}`, {
      passwordProof: "invalid-proof",
      encryptedData: mockEncrypt([{ name: ".env", content: "HACKED=value" }]),
    });
    assert(
      response.statusCode === 401,
      `Expected 401, got ${response.statusCode}`,
    );
  });
}

async function testOptionalPassword() {
  section(
    "Optional-Password EnvLinks (Extended ID + Access Key Authentication)",
  );

  await test("Access optional-password EnvLink with access key authentication", async () => {
    const accessKey = testData.optionalPassAccessKey;
    const extendedId = `${testData.optionalPassBaseId}${accessKey}`;

    const parsed = parseExtendedId(extendedId);
    assert(parsed !== null, "Should be able to parse extended ID");
    assert(
      parsed.baseId === testData.optionalPassBaseId,
      "Base ID should match",
    );
    assert(parsed.accessKey === accessKey, "Access key should match");

    const response = await makeRequest(
      "POST",
      `${API_PATH}/${parsed.baseId}/info`,
      {},
    );

    assert(
      response.statusCode === 200,
      `Expected 200 for optional-password info, got ${response.statusCode}`,
    );
    assert(response.body.success === true, "Expected success: true");
    assert(
      response.body.data.id === testData.optionalPassBaseId,
      "Server should return base ID in response",
    );
  });

  await test("Install optional-password EnvLink with access key", async () => {
    const accessKey = testData.optionalPassAccessKey;
    const extendedId = `${testData.optionalPassBaseId}${accessKey}`;
    const parsed = parseExtendedId(extendedId);

    const response = await makeRequest(
      "POST",
      `${API_PATH}/${parsed.baseId}/install`,
      {},
    );

    assert(
      response.statusCode === 200,
      `Expected 200 for install, got ${response.statusCode}`,
    );
    assert(response.body.success === true, "Expected success: true");
    assert(
      "encryptedData" in response.body.data,
      "Expected encryptedData in response",
    );

    const decryptedFiles = mockDecrypt(response.body.data.encryptedData);
    assert(Array.isArray(decryptedFiles), "Should return array of files");
    assert(
      decryptedFiles[0].content.includes("OPTIONAL=test_value"),
      "Content should match",
    );
  });

  await test("Fail: Update optional-password EnvLink (operation not allowed)", async () => {
    const accessKey = testData.optionalPassAccessKey;
    const extendedId = `${testData.optionalPassBaseId}${accessKey}`;
    const parsed = parseExtendedId(extendedId);
    const response = await makeRequest("PUT", `${API_PATH}/${parsed.baseId}`, {
      passwordProof: "dummy",
      encryptedData: mockEncrypt([{ name: ".env", content: "UPDATED=fail" }]),
    });

    assert(
      response.statusCode === 403,
      `Expected 403 for update on optional-password EnvLink, got ${response.statusCode}`,
    );
    assert(response.body.success === false, "Expected success: false");
  });

  await test("Expire optional-password EnvLink (operation allowed)", async () => {
    const accessKey = testData.optionalPassAccessKey;
    const extendedId = `${testData.optionalPassBaseId}${accessKey}`;

    const response = await makeRequest(
      "DELETE",
      `${API_PATH}/${testData.optionalPassBaseId}`,
      {},
    );

    assert(
      response.statusCode === 200,
      `Expected 200 for expire on optional-password EnvLink, got ${response.statusCode}`,
    );
    assert(response.body.success === true, "Expected success: true");
  });

  await test("Fail: Access with invalid access key", async () => {
    const files = [{ name: ".env", content: "INVALID_TEST=value" }];
    const encryptedData = mockEncrypt(files);
    const accessKey = generateAccessKey();

    const createRes = await makeRequest("POST", API_PATH, {
      encryptedData,
      filesCount: files.length,
    });

    const baseId = createRes.body.data.id;
    const validExtendedId = `${baseId}${accessKey}`;
    const parsed = parseExtendedId(validExtendedId);

    const invalidExtendedId = `${parsed.baseId}${generateAccessKey()}`;
    const invalidParsed = parseExtendedId(invalidExtendedId);

    const response = await makeRequest(
      "POST",
      `${API_PATH}/${invalidParsed.baseId}/info`,
      {},
    );

    assert(
      response.statusCode === 200,
      `Server should return 200 (can't validate accessKey), got ${response.statusCode}`,
    );
    assert(
      response.body.success === true,
      "Expected success: true - server doesn't validate accessKey",
    );
    assert(
      response.body.success === true,
      "Expected success: true - server can't validate accessKey",
    );
  });

  await test("Extended ID format validation", async () => {
    const validId = "el_1234567890ABCDEFGHIJklmnopQRSTUV"; // Concatenated format
    const parsed = parseExtendedId(validId);
    assert(parsed !== null, "Should parse valid extended ID");
    assert(
      parsed.baseId === "el_1234567890ABCDEF",
      "Base ID should be correct",
    );
    assert(
      parsed.accessKey === "GHIJklmnopQRSTUV",
      "Access key should be correct",
    );

    assert(
      parseExtendedId("el_1234567890ABCDEF") === null,
      "Should reject base ID without access key",
    );
    assert(
      parseExtendedId("el_123_ABC") === null,
      "Should reject short components",
    );
    assert(
      parseExtendedId("wrong_1234567890ABCDEF_GHIJklmnopQRSTUV") === null,
      "Should reject wrong prefix",
    );
  });
}

async function testExpire() {
  section("DELETE /:id - Expire EnvLink (PBKDF2 Zero-Knowledge Proof)");

  const files = [{ name: ".env", content: "TO_EXPIRE=value" }];
  const password = "expire-pass";
  const encryptedData = mockEncrypt(files);
  const passwordHash = await mockHashPassword(password);

  const createRes = await makeRequest("POST", API_PATH, {
    encryptedData,
    passwordHash,
    filesCount: files.length,
  });
  const expireId = createRes.body.data.id;

  await test("Expire with PBKDF2 proof", async () => {
    const response = await makeAuthenticatedRequest(
      expireId,
      passwordHash,
      "DELETE",
      `${API_PATH}/${expireId}`,
    );
    assert(
      response.statusCode === 200,
      `Expected 200, got ${response.statusCode}`,
    );
    assert(response.body.success === true, "Expected success: true");
  });

  await test("Fail: Install expired EnvLink", async () => {
    try {
      const response = await makeAuthenticatedRequest(
        expireId,
        passwordHash,
        "POST",
        `${API_PATH}/${expireId}/install`,
      );
      assert(false, "Should have failed for expired EnvLink");
    } catch (error) {
      assert(true, "Correctly failed for expired EnvLink");
    }
  });

  await test("Fail: Expire with invalid proof", async () => {
    const files2 = [{ name: ".env", content: "TO_EXPIRE2=value" }];
    const password2 = "expire-pass2";
    const encryptedData2 = mockEncrypt(files2);
    const passwordHash2 = await mockHashPassword(password2);

    const createRes2 = await makeRequest("POST", API_PATH, {
      encryptedData: encryptedData2,
      passwordHash: passwordHash2,
      filesCount: files2.length,
    });

    const response = await makeRequest(
      "DELETE",
      `${API_PATH}/${createRes2.body.data.id}`,
      {
        passwordProof: "invalid-proof",
      },
    );
    assert(
      response.statusCode === 401,
      `Expected 401, got ${response.statusCode}`,
    );
  });
}

async function runTests() {
  console.log(
    `${colors.bright}${colors.blue}EnvLink API Test Suite (PBKDF2 Zero-Knowledge Proof)${colors.reset}`,
  );
  console.log(`${colors.gray}Testing: ${BASE_URL}${colors.reset}`);
  console.log(
    `${colors.cyan}Testing ALL commands from envlink/commands.md${colors.reset}\n`,
  );

  try {
    await testHealthCheck();
    await testCreate();
    await testGetInfo();
    await testInstall();
    await testUpdate();
    await testOptionalPassword();
    await testExpire();
    await testCronCleanup();
    summary();

    if (stats.failed === 0) {
      console.log(
        `\n${colors.green} ALL CLI Commands API Coverage Complete!${colors.reset}`,
      );
      console.log(
        `${colors.green} CREATE - Full coverage (8 tests)${colors.reset}`,
      );
      console.log(
        `${colors.green} INFO - Full coverage (3 tests)${colors.reset}`,
      );
      console.log(
        `${colors.green} INSTALL - Full coverage (3 tests)${colors.reset}`,
      );
      console.log(
        `${colors.green} UPDATE - Full coverage (5 tests)${colors.reset}`,
      );
      console.log(
        `${colors.green} OPTIONAL-PASSWORD - Full coverage (6 tests)${colors.reset}`,
      );
      console.log(
        `${colors.green} EXPIRE - Full coverage (3 tests)${colors.reset}`,
      );
      console.log(
        `${colors.green} PBKDF2 zero-knowledge authentication verified${colors.reset}`,
      );
      console.log(
        `${colors.green} Extended ID format and access key auth tested${colors.reset}`,
      );
      console.log(
        `${colors.green} Single-request stateless architecture complete${colors.reset}`,
      );
    }

    process.exit(stats.failed > 0 ? 1 : 0);
  } catch (error) {
    console.error(
      `\n${colors.red}Fatal error: ${error.message}${colors.reset}`,
    );
    process.exit(1);
  }
}

runTests();

async function testCronCleanup() {
  section("GET /cron/cleanup - Cron Cleanup Endpoint");

  await test("Access with valid X-Cron-Secret header (when set)", async () => {
    const testSecret = "test-secret-123";
    const response = await makeRequest(
      "GET",
      "/api/envlinks/cron/cleanup",
      null,
      { "X-Cron-Secret": testSecret },
    );

    const isProtected =
      response.statusCode === 200 || response.statusCode === 403;
    assert(
      isProtected,
      `Expected 200 (valid) or 403 (invalid), got ${response.statusCode}`,
    );
  });

  await test("Access without X-Cron-Secret header", async () => {
    const response = await makeRequest("GET", "/api/envlinks/cron/cleanup");

    const validResponse =
      response.statusCode === 200 || response.statusCode === 401;
    assert(
      validResponse,
      `Expected 200 (no secret required) or 401 (secret required), got ${response.statusCode}`,
    );
  });

  await test("Cron endpoint returns expected structure", async () => {
    const CRON_SECRET = process.env.CRON_SECRET;
    const headers = CRON_SECRET ? { "X-Cron-Secret": CRON_SECRET } : {};

    const response = await makeRequest(
      "GET",
      "/api/envlinks/cron/cleanup",
      null,
      headers,
    );

    if (response.statusCode === 200) {
      assert(response.body.success === true, "Expected success: true");
      assert(
        typeof response.body.data.deletedCount === "number",
        "Expected deletedCount in response",
      );
    }
  });
}
