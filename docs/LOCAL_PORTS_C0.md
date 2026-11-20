# Ports locaux Konnaxion (C0)

Web `21130`; API Django `21131`; Koali-managed web `21134` and API `21135`.

The local Docker publication is `127.0.0.1:21131:8000`, keeping the container port `8000`. The Konnaxion frontend proxies to `http://127.0.0.1:21131/api`. These are developer-host ports, not production or publicly exposed ports.

Interaction Kernel: Orgo -> Konnaxion ingress is `/api/integrations/ik/konnaxion/interactions/`. Konnaxion -> Orgo output is `/api/v3/ik/interactions` through `IK_ORGO_INTERACTIONS_URL` when configured. Do not enable a bridge automatically: tokens, HTTPS and organization scoping remain mandatory. If Orgo runs inside Docker, `host.docker.internal:21131` needs separate network verification and an appropriate firewall policy.

Do not bulk-replace `8000` in Docker service DNS, nor the remote-droplet Agent `8765`.
