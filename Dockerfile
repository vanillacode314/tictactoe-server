# syntax=docker/dockerfile:1

FROM oven/bun
WORKDIR /app
COPY . .
RUN bun install
CMD ["bun", "run", "src/index.ts"]
EXPOSE 3000
