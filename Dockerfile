FROM node:latest

COPY . .

RUN npm i -g pnpm
RUN pnpm i

ENTRYPOINT ["npm"]

CMD ["run", "start"]