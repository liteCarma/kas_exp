FROM node:lts-alpine
ENV NODE_ENV="production"
ENV DATABASE_URL="file:sqllite.db"
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --production
RUN npm run install
COPY . .
CMD ["npm", "start"]
