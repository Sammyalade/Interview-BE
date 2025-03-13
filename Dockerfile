FROM node:20-alpine 

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev --no-audit --no-fund 

COPY . .

EXPOSE 4000

RUN adduser -D appuser && chown -R appuser /app
USER appuser

CMD ["node", "server.js"]
