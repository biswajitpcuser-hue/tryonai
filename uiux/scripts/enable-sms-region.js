// Enable SMS region for Firebase Phone Auth
// Usage: node scripts/enable-sms-region.js <path-to-service-account-key.json>
const https = require("https");

const PROJECT_ID = "trxtrader1-d7dde";

async function getAccessToken(keyFile) {
  const { GoogleAuth } = require("google-auth-library");
  const auth = new GoogleAuth({
    keyFile,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

async function enableSmsRegion(accessToken) {
  const data = JSON.stringify({
    sms_region_config: {
      allowlist_only: {
        allowed_regions: ["IN"],
      },
    },
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "identitytoolkit.googleapis.com",
        path: `/admin/v2/projects/${PROJECT_ID}/config?updateMask=sms_region_config`,
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          console.log("Status:", res.statusCode);
          console.log("Response:", body);
          if (res.statusCode === 200) {
            resolve(JSON.parse(body));
          } else {
            reject(new Error(`${res.statusCode}: ${body}`));
          }
        });
      },
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

const keyPath = process.argv[2];
if (!keyPath) {
  console.error("Usage: node scripts/enable-sms-region.js <path-to-key.json>");
  process.exit(1);
}

(async () => {
  try {
    const token = await getAccessToken(keyPath);
    await enableSmsRegion(token);
    console.log("✓ India (+91) SMS region enabled!");
  } catch (e) {
    console.error("Error:", e.message);
  }
})();
