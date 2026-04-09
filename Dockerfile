FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --ignore-scripts
COPY . .

EXPOSE 5173index

CMD ["npm", "run", "dev", "--", "--host"]
