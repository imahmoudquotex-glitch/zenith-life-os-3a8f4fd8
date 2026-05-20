# Webhook Security Conventions

- All incoming webhooks must verify the cryptographic signature (e.g., `stripe-signature`) using the `verifyWebhookSignature` utility.
- Nonce tables must be utilized to protect against replay attacks. Each webhook ID must be logged atomically and rejected if processed previously.
