import { verifyNgrokReviewReady } from "./client-review-ngrok-preflight";
verifyNgrokReviewReady()
  .then(() =>
    console.log(
      "PASS: exact ngrok origin, Google OAuth allowlist policy/hash, application GET/login POST, Secure/HttpOnly/Strict cookie, admin/media/write denial and token revocation. No tunnel was started.",
    ),
  )
  .catch(() => {
    console.error(
      "ngrok preview preflight refused. Verify private configuration/policy, fresh viewing code, and the intended loopback review server. No values printed; no tunnel was started.",
    );
    process.exitCode = 1;
  });
