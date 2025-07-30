FROM node:20.18.1-alpine 
WORKDIR /usr/src/app 
COPY package*.json ./ 
RUN npm ci --omit=dev 
COPY . . 
RUN npm run build 
EXPOSE 5009
CMD ["node", "dist/server.js"]