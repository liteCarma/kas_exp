FROM node:lts-alpine
WORKDIR /app
ENV NODE_ENV="production"
ENV DATABASE_URL="file:sqllite.db"
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --production
RUN npm run install
COPY . .
RUN chown -R node /app
USER node
EXPOSE 9000
CMD ["npm", "start"]
