FROM ubuntu:25.04
WORKDIR /usr/src/nemo-all

ARG BRANCH="feature/nemo-trace-visualization"

RUN apt update && \
    apt install -y git && \
    apt install -y curl && \
    apt install -y build-essential 

RUN git config --global user.name "docker" && \
    git config --global user.email "docker@not-an-email.com"

RUN git clone --branch ${BRANCH} https://github.com/knowsys/nemo.git && \
    git clone --branch ${BRANCH} https://github.com/knowsys/nemo-web.git && \
    git clone https://github.com/knowsys/nemo-vscode-extension.git

# rust 
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y 
ENV PATH=/root/.cargo/bin:$PATH
RUN cargo install wasm-pack

# node
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash && \
    apt-get install nodejs -y && \
    node -v && npm -v

# compile nemo
RUN cd /usr/src/nemo-all/nemo/nemo-wasm && \
    wasm-pack build --out-dir nemoWASMBundler --target bundler --weak-refs --release && \
    wasm-pack build --out-dir nemoWASMWeb --target web --weak-refs --release 

# compile vs extension
RUN cd /usr/src/nemo-all/nemo-vscode-extension && \
    cp -r /usr/src/nemo-all/nemo/nemo-wasm/nemoWASMWeb . && \
    npm install && \
    npm run package

# nemo-web
WORKDIR /usr/src/nemo-all/nemo-web/

RUN mkdir nemoVSIX && \ 
    cp -r /usr/src/nemo-all/nemo-vscode-extension/nemo-0.0.17.vsix ./nemoVSIX/nemo.vsix && \
    cp -r /usr/src/nemo-all/nemo/nemo-wasm/nemoWASMBundler ./nemoWASMBundler && \
    npm install 

# for development... 
# EXPOSE 5173
# ENTRYPOINT [ "npm", "run", "dev" ]

ENV NODE_OPTIONS=--max_old_space_size=4096
RUN npm run build

# the static files for nemo-web are in this directory: 
WORKDIR /usr/src/nemo-all/nemo-web/dist

# replace the next lines with your own node server, simply serve the nemo files statically 
RUN npm install serve -g 
EXPOSE 8000
ENTRYPOINT [ "serve", "-p", "8000" ]

