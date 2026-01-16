FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose the port the app runs on
EXPOSE 3005
# Expose HL7 port
EXPOSE 2575

CMD ["npm", "run", "dev"]
