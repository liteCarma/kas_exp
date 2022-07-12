FROM node:lts-alpine
WORKDIR /app
ENV NODE_ENV="production"
ENV DATABASE_URL="file:sqllite.db"
COPY ["package*.json", "prisma", "./"]
RUN npm install --production --silent
COPY . .
RUN npm run install
RUN chown -R node /app
USER node
EXPOSE 8080
CMD ["npm", "start"]
