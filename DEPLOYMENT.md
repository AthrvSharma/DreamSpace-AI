# Render + TiDB Cloud Deployment

This project is configured as a single Render web service: Express serves the API, Socket.io, uploaded assets, generated files, exports, and the built Vite client from `client/dist`.

## TiDB Cloud

1. In TiDB Cloud, keep the connection type as `Public`.
2. Make sure the Render outbound IP policy is allowed in TiDB Cloud. If you do not have a stable outbound IP, allow the required Render egress range or use a private endpoint/static outbound IP plan.
3. Use these database environment variables in Render:

```env
TIDB_HOST=gateway01.ap-southeast-1.prod.alicloud.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=your_cluster_prefix.root
TIDB_PASSWORD=your_tidb_password
TIDB_DB_NAME=roomDecor
TIDB_ENABLE_SSL=true
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
DB_CREATE_IF_MISSING=true
DB_SYNC_ON_START=true
DB_SYNC_ALTER=false
DB_SEED_ON_START=true
```

TiDB Cloud public endpoints require TLS. The app enables TLS 1.2+ for any `*.tidbcloud.com` host. If your TiDB Cloud plan gives you a CA certificate path, set `TIDB_CA_PATH` or `DB_SSL_CA_PATH`.

## Render

Use `render.yaml` as the Blueprint. It sets:

- `buildCommand`: `npm run render:build`
- `startCommand`: `npm start`
- `healthCheckPath`: `/api/health`
- `STORAGE_DIR`: `/opt/render/project/src/server/storage`
- a persistent disk mounted at that same storage path

Use at least a paid `starter` web service if you want persistent uploads/generated images/PDF exports. Render free web services lose filesystem changes on redeploy/restart/spin-down and do not support persistent disks.

## Required Render Environment Variables

Set these before the first deploy:

```env
NODE_ENV=production
JWT_SECRET=generate_a_32_plus_character_secret
JWT_EXPIRES_IN=7d
TIDB_HOST=...
TIDB_PORT=4000
TIDB_USER=...
TIDB_PASSWORD=...
TIDB_DB_NAME=roomDecor
TIDB_ENABLE_SSL=true
FRONTEND_URL=https://your-service.onrender.com
CORS_ORIGIN=https://your-service.onrender.com
```

Also set the provider keys you use:

```env
FIREBASE_SERVICE_ACCOUNT=base64_encoded_service_account_json
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
GROQ_API_KEY=...
HUGGINGFACE_API_KEY=...
REPLICATE_API_TOKEN=...
POLY_PIZZA_API_KEY=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=...
MAIL_PASS=...
MAIL_FROM="DreamSpace AI" <no-reply@your-domain.com>
CONTACT_EMAIL=support@your-domain.com
```

Render also provides `RENDER_EXTERNAL_URL`; the app can use it for email links if `FRONTEND_URL` is not set. Setting `FRONTEND_URL` explicitly is still recommended.

## Local Checks

```bash
npm run install:all
npm run db:init
npm run db:test
npm run build
npm start
```

For local Vite development with the API proxy, set this in `client/.env`:

```env
VITE_DEV_API_TARGET=http://127.0.0.1:5000
```

## References

- TiDB Cloud public endpoints require TLS: https://docs.pingcap.com/tidbcloud/secure-connections-to-serverless-clusters/
- TiDB Cloud public connection setup: https://docs.pingcap.com/tidbcloud/connect-via-standard-connection-serverless/
- Render web services must bind to `0.0.0.0` and `PORT`: https://render.com/docs/web-services
- Render free services have ephemeral filesystems and no persistent disks: https://render.com/free
- Render Blueprint reference: https://render.com/docs/blueprint-spec
