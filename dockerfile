# Usar a imagem base oficial do Node.js
FROM node:18

# Definir o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copiar os arquivos package.json e package-lock.json para o diretório de trabalho
COPY package*.json ./

# Instalar todas as dependências (produção e desenvolvimento)
RUN npm install

# Copiar o restante do código da aplicação para o diretório de trabalho
COPY . .

COPY .env .env

# Fazer o build da aplicação
RUN npm run build

# Expor a porta em que a aplicação será executada
EXPOSE 3000

# Definir o comando para iniciar a aplicação
CMD ["npm", "start"]