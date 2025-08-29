FROM mcr.microsoft.com/playwright:v1.55.0 AS base

FROM base AS image-local
COPY . /screen-play-wright
WORKDIR /screen-play-wright
RUN if test -f '/screen-play-wright/.npmrc'; then rm /screen-play-wright/.npmrc; fi
