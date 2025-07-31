FROM node:lts-alpine

# 必要なパッケージをインストール
RUN apk add --no-cache \
    git \
    curl \
    bash \
    vim

# 作業ディレクトリを設定
WORKDIR /workspace

# グローバルパッケージをインストール
RUN npm install -g \
    yo \
    generator-code \
    vsce \
    typescript

# 権限を設定
RUN chown -R node:node /workspace && \
    chmod -R 755 /workspace && \
    mkdir -p /workspace/node_modules && \
    chown -R node:node /workspace/node_modules
USER node

# デフォルトコマンド
CMD ["/bin/bash"] 
