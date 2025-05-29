rec {
  description = "Web frontend for the Nemo rule engine";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    utils.url = "github:gytis-ivaskevicius/flake-utils-plus";
    dream2nix = {
      url = "github:nix-community/dream2nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    nemo = {
      url = "github:knowsys/nemo";
      inputs = {
        nixpkgs.follows = "nixpkgs";
        utils.follows = "utils";
      };
    };

    nemo-vscode-extension = {
      url = "github:knowsys/nemo-vscode-extension";
      inputs = {
        nixpkgs.follows = "nixpkgs";
        utils.follows = "utils";
        dream2nix.follows = "dream2nix";
        nemo.follows = "nemo";
      };
    };
  };

  outputs =
    inputs@{
      self,
      utils,
      nemo,
      nemo-vscode-extension,
      dream2nix,
      ...
    }:
    utils.lib.mkFlake {
      inherit self inputs;

      channels.nixpkgs.overlaysBuilder = channels: [
        nemo.overlays.default
        nemo-vscode-extension.overlays.default
      ];

      overlays = {
        default =
          final: prev:
          let
            pkgs = self.packages.${final.system};
          in
          {
            inherit (pkgs) nemo-web;
          };
        nemo = nemo.overlays.default;
        nemo-vscode-extension = nemo-vscode-extension.overlays.default;
      };

      outputsBuilder =
        channels:
        let
          pkgs = channels.nixpkgs;

          npmMeta = builtins.fromJSON (builtins.readFile ./package.json);
          inherit (npmMeta) version;

          meta = {
            inherit description;
            homepage = npmMeta.repository.url;
          };

          nemo-web-source =
            config:
            pkgs.runCommandLocal "nemo-web-source" { } ''
              mkdir -p $out/nemoVSIX
              cp -R ${pkgs.lib.cleanSource ./.}/* $out
              cp -R ${config.deps.nemo-wasm-bundler}/lib/node_modules/nemo-wasm/ $out/nemoWASMBundler
              cp ${config.deps.nemo-vscode-extension-vsix}/nemo-*.vsix $out/nemoVSIX/nemo.vsix
            '';

          nemo-web = dream2nix.lib.evalModules {
            packageSets.nixpkgs = pkgs;

            modules = [
              {
                paths = {
                  projectRoot = ./.;
                  projectRootFile = "flake.nix";
                  package = ./.;
                };
              }

              (
                {
                  lib,
                  config,
                  dream2nix,
                  ...
                }:
                {
                  name = "nemo-web";
                  inherit version;

                  imports = [
                    dream2nix.modules.dream2nix.nodejs-package-lock-v3
                    dream2nix.modules.dream2nix.nodejs-granular-v3
                  ];

                  mkDerivation = {
                    src = nemo-web-source config;

                    installPhase = ''
                      runHook preInstall

                      cp -R dist $out

                      runHook postInstall
                    '';
                  };

                  deps =
                    { nixpkgs, ... }:
                    let
                      inherit (nixpkgs) system;
                    in
                    lib.mkMerge [
                      {
                        inherit (nixpkgs) stdenv;
                        nodejs = nixpkgs.nodejs_20; # generate-license-file is broken on 22
                        nemo-wasm-web = lib.mkDefault nemo.packages.${system}.nemo-wasm-web;
                        nemo-wasm-bundler = lib.mkDefault nemo.packages.${system}.nemo-wasm-bundler;
                        nemo-vscode-extension-vsix =
                          lib.mkDefault
                            nemo-vscode-extension.packages.${system}.nemo-vscode-extension-vsix;
                      }
                      {
                        deps.nemo-vscode-extension-vsix.deps.nemo-wasm-web = config.deps.nemo-wasm-web;
                      }
                    ];

                  nodejs-package-lock-v3 = {
                    packageLockFile = "${config.mkDerivation.src}/package-lock.json";
                  };

                  nodejs-granular-v3 = {
                    buildScript = "NODE_OPTIONS=--max_old_space_size=4096 npm run build";
                  };
                }
              )
            ];
          };
        in
        {
          packages = {
            inherit nemo-web;
            default = nemo-web;
          };

          apps =
            let
              nemo-web-preview = utils.lib.mkApp {
                drv = pkgs.writeShellApplication {
                  name = "nemo-web-preview";

                  runtimeInputs = [
                    pkgs.nodejs
                  ];

                  text = ''
                    cd "$(mktemp --directory)"
                    cp -R ${self.packages.${pkgs.system}.nemo-web}/lib/node_modules/nemo-web/* .
                    chmod -R +w node_modules
                    mkdir wrapper
                    ln -s ${
                      self.packages.${pkgs.system}.nemo-web
                    }/lib/node_modules/nemo-web/node_modules/vite/bin/vite.js wrapper/vite
                    export PATH="''${PATH}:wrapper"
                    npm run preview
                  '';
                };
              };
            in
            rec {
              inherit nemo-web-preview;
              default = nemo-web-preview;
            };

          devShells.default = dream2nix.lib.evalModules {
            packageSets.nixpkgs = pkgs;

            modules = [
              {
                paths = {
                  projectRoot = ./.;
                  projectRootFile = "flake.nix";
                  package = ./.;
                };
              }
              (
                {
                  lib,
                  config,
                  dream2nix,
                  ...
                }:
                {
                  name = "nemo-web";
                  inherit version;

                  imports = [
                    dream2nix.modules.dream2nix.nodejs-package-lock-v3
                    dream2nix.modules.dream2nix.nodejs-devshell-v3
                  ];

                  mkDerivation = {
                    src = nemo-web-source config;

                    nativeBuildInputs = [
                      pkgs.nodejs
                    ];

                    buildPhase = "mkdir $out";
                  };

                  deps =
                    { nixpkgs, ... }:
                    let
                      inherit (nixpkgs) system;
                    in
                    lib.mkMerge [
                      {
                        inherit (nixpkgs) stdenv;
                        nemo-wasm-web = lib.mkDefault nemo.packages.${system}.nemo-wasm-web;
                        nemo-wasm-bundler = lib.mkDefault nemo.packages.${system}.nemo-wasm-bundler;
                        nemo-vscode-extension-vsix =
                          lib.mkDefault
                            nemo-vscode-extension.packages.${system}.nemo-vscode-extension-vsix;
                      }
                      {
                        deps.nemo-vscode-extension-vsix.deps.nemo-wasm-web = config.deps.nemo-wasm-web;
                      }
                    ];

                  nodejs-package-lock-v3 = {
                    packageLockFile = "${config.mkDerivation.src}/package-lock.json";
                  };
                }
              )
            ];
          };

          formatter = channels.nixpkgs.nixfmt-rfc-style;
        };

    };
}
