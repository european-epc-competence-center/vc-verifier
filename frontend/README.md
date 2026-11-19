# Legacy frontend

This Vue.js UI is no longer released. CI does not build or publish it. The API in `../api` is the supported release.

Run it locally against an API on port 3000:

```bash
npm install
npm run dev
```

The dev server listens on port 8080. Set `VUE_APP_VERIFIER_API` to the API base URL (for example `http://localhost:3000/api/verifier`). `VC_REGISTRY` and `OPENID_ENDPOINT` configure registry lookup and presentation requests.

`npm run build` writes a static bundle to `dist/`. The Dockerfile in this folder still builds an nginx image locally:

```bash
docker build -t vc-verifier-frontend \
  --build-arg PUBLIC_PATH=verifier \
  --build-arg NODE_ENV=production \
  --build-arg BASE_URL=https://ssi.eecc.de \
  --build-arg VERIFIER_API=https://ssi.eecc.de/api/verifier \
  .
```
