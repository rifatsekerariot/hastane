FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose Vite default port
EXPOSE 5173

# Run with --host to allow external access
CMD ["npm", "run", "dev", "--", "--host"]
