# This Dockerfile mimics the manual build chain described in the READMEs of nemo projects.
# The nix build is always preferable to get something more stable! This is only for "cutting-edge" development and will likely be fundamentally reworked or removed at some point.
# DON'T USE THIS DOCKERFILE UNLESS YOU READ AND UNDERSTOOD THE ABOVE!

FROM nixos/nix:latest as rust
ARG BRANCH="feature/nemo-trace-visualization"
WORKDIR /nemo

RUN git clone --branch ${BRANCH} https://github.com/knowsys/nemo.git

RUN cd nemo && \
    nix --extra-experimental-features "nix-command flakes" build .\#{nemo-wasm-bundler,nemo-wasm-web}

FROM node:20-alpine as node-builder

RUN apk update && apk add git 

FROM node-builder as vscode-extension 
WORKDIR /vsx 

RUN git clone https://github.com/knowsys/nemo-vscode-extension.git nemo-vsx

COPY --from=rust /nemo/nemo/result-1/lib/node_modules/nemo-wasm /vsx/nemo-vsx/nemoWASMWeb

RUN cd nemo-vsx && npm i
RUN cd nemo-vsx && npm run package

FROM node-builder as nemo-web 
ARG BRANCH="feature/nemo-trace-visualization"
WORKDIR /web

RUN git clone --branch ${BRANCH} https://github.com/knowsys/nemo-web.git

COPY --from=vscode-extension /vsx/nemo-vsx/nemo-0.0.17.vsix /web/nemo-web/nemoVSIX/nemo.vsix
COPY --from=rust /nemo/nemo/result/lib/node_modules/nemo-wasm /web/nemo-web/nemoWASMBundler

RUN cd nemo-web && npm i
RUN cd nemo-web && NODE_OPTIONS=--max_old_space_size=4096 npm run build

FROM nginx

COPY --from=nemo-web /web/nemo-web/dist /usr/share/nginx/html

