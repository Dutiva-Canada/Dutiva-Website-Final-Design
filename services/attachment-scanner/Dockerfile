# ClamAV + the scan endpoint in one container.
#
# MEMORY IS THE THING THAT BITES. clamd loads the whole signature database into
# RAM — budget 2 GB. On a 512 MB or 1 GB instance clamd is OOM-killed during
# startup, the endpoint answers 503 on /health, and every attachment comes back
# `scanner_unreachable`. That failure looks like a network problem and is not.
#
# Signatures are baked at build time so a cold start does not spend several
# minutes downloading ~250 MB before it can serve. freshclam then keeps them
# current at runtime.

FROM node:22-bookworm-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      clamav-daemon clamav-freshclam ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# clamd's Debian default is a unix socket; we want TCP on loopback only.
RUN printf '%s\n' \
      'Foreground yes' \
      'TCPSocket 3310' \
      'TCPAddr 127.0.0.1' \
      'StreamMaxLength 25M' \
      'MaxFileSize 25M' \
      'MaxScanSize 100M' \
      'MaxThreads 4' \
      'LogSyslog no' \
      'LogFile /dev/stdout' \
      'User clamav' \
      'AlertEncryptedArchive yes' \
      'AlertEncryptedDoc yes' \
    > /etc/clamav/clamd.conf \
 && printf '%s\n' \
      'Foreground false' \
      'Checks 12' \
      'DatabaseMirror database.clamav.net' \
      'LogSyslog no' \
      'LogFile /dev/stdout' \
      'DatabaseOwner clamav' \
    > /etc/clamav/freshclam.conf

# Bake the signature database. Tolerated if the build host has no egress —
# entrypoint.sh downloads it on first boot instead (slow, but it starts).
RUN freshclam --stdout || echo "freshclam failed at build; will fetch at startup"

WORKDIR /app
COPY server.js ./
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh \
 && mkdir -p /var/lib/clamav && chown -R clamav:clamav /var/lib/clamav

ENV PORT=8080 CLAMD_HOST=127.0.0.1 CLAMD_PORT=3310
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=180s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8080)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
