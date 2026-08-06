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
#
# NO LogFile / UpdateLogFile IN EITHER FILE. Both daemons run in the foreground
# here, which already puts their output on stdout where a container wants it.
# Naming a log file adds a write that can fail as the unprivileged clamav user
# and buys nothing. Note also that the two configs do NOT share a vocabulary:
# `LogFile` is clamd-only, and freshclam rejects it outright — the first cut of
# this image set it in both, so freshclam refused to parse its config and no
# signatures were baked at all.
RUN printf '%s\n' \
      'Foreground yes' \
      'TCPSocket 3310' \
      'TCPAddr 127.0.0.1' \
      'StreamMaxLength 25M' \
      'MaxFileSize 25M' \
      'MaxScanSize 100M' \
      'MaxThreads 4' \
      'LogSyslog no' \
      'User clamav' \
      'AlertEncryptedArchive yes' \
      'AlertEncryptedDoc yes' \
    > /etc/clamav/clamd.conf \
 && printf '%s\n' \
      'Foreground true' \
      'Checks 12' \
      'DatabaseMirror database.clamav.net' \
      'LogSyslog no' \
      'DatabaseOwner clamav' \
    > /etc/clamav/freshclam.conf \
 && mkdir -p /var/lib/clamav && chown -R clamav:clamav /var/lib/clamav

# Bake the signature database so a cold start does not spend minutes on it.
#
# NOT tolerated with `|| true`. An earlier version swallowed the failure, the
# build reported success, and the breakage only surfaced as a container that
# exited at startup. If this cannot download signatures, the image is not
# usable and the build should say so here.
RUN freshclam --stdout

WORKDIR /app
COPY server.js package.json ./
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENV PORT=8080 CLAMD_HOST=127.0.0.1 CLAMD_PORT=3310
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=180s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8080)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
