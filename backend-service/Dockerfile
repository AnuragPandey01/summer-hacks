# Build stage
FROM golang:1.25-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git ca-certificates

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server ./main.go

# Runtime stage
FROM alpine:latest

WORKDIR /pb

RUN apk add --no-cache ca-certificates

COPY --from=builder /app/server /pb/server
COPY --from=builder /app/config /pb/config

# Optional: mount a volume at /pb/pb_data for persistence (Cloud Run volume)
VOLUME ["/pb/pb_data"]

EXPOSE 8080

# Cloud Run requires listening on $PORT (default to 8080)
CMD ["/pb/server", "serve", "--http=0.0.0.0:8080"]