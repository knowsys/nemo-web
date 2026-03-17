rec {
  description = "Web frontend for the Nemo rule engine";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
    dream2nix = {
      url = "github:nix-community/dream2nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    nemo = {
      url = "github:knowsys/nemo";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    nemo-vscode-extension = {
      url = "github:knowsys/nemo-vscode-extension";
      inputs = {
        nixpkgs.follows = "nixpkgs";
        dream2nix.follows = "dream2nix";
        nemo.follows = "nemo";
      };
    };

    nev = {
      url = "github:imldresden/nev";
      flake = false;
    };
  };

  outputs =
    inputs@{
      self,
      nixpkgs,
      nemo,
      nemo-vscode-extension,
      dream2nix,
      ...
    }:
    let
      inherit (nixpkgs) lib;
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
        "x86_64-darwin"
      ];
      forAllSystems' = systems: f: lib.genAttrs systems f;
      forAllSystems = forAllSystems' systems;

      perSystem =
        system:
        let
          pkgs = import nixpkgs {
            inherit system;
            overlays = [
              nemo.overlays.default
              nemo-vscode-extension.overlays.default
            ];
          };
          npmMeta = builtins.fromJSON (builtins.readFile ./package.json);
          inherit (npmMeta) version;

          meta = {
            inherit description;
            homepage = "https://github.com/knowsys/nemo-web";
          };

          nemo-web-source =
            config:
            pkgs.runCommandLocal "nemo-web-source" { } ''
              mkdir -p $out/nemoVSIX $out/public
              cp -R ${pkgs.lib.cleanSource ./.}/* $out
              cp -R ${config.deps.nemo-wasm-bundler}/lib/node_modules/nemo-wasm/ $out/nemoWASMBundler
              cp ${config.deps.nemo-vscode-extension-vsix}/nemo-*.vsix $out/nemoVSIX/nemo.vsix
              cp -R ${config.deps.nev}/dist $out/public/ev
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
                    inherit meta;

                    src = nemo-web-source config;

                    installPhase = ''
                      runHook preInstall

                      cp -R dist $out

                      runHook postInstall
                    '';
                  };

                  deps =
                    { nixpkgs, ... }:
                    lib.mkMerge [
                      {
                        inherit (nixpkgs) stdenv;
                        nodejs = nixpkgs.nodejs_20; # generate-license-file is broken on 22
                        nemo-wasm-web = lib.mkDefault nemo.packages.${system}.nemo-wasm-web;
                        nemo-wasm-bundler = lib.mkDefault nemo.packages.${system}.nemo-wasm-bundler;
                        nemo-vscode-extension-vsix =
                          lib.mkDefault
                            nemo-vscode-extension.packages.${system}.nemo-vscode-extension-vsix;
                        nev = lib.mkDefault self.packages.${system}.nev;
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

          nev = dream2nix.lib.evalModules {
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
                  name = "nev";
                  inherit version;

                  imports = [
                    dream2nix.modules.dream2nix.nodejs-package-lock-v3
                    dream2nix.modules.dream2nix.nodejs-granular-v3
                  ];

                  mkDerivation = {
                    meta.homepage = "https://github.com/imldresden/nev";

                    src = inputs.nev;

                    installPhase = ''
                      runHook preInstall

                      cp -R dist $out

                      runHook postInstall
                    '';
                  };

                  deps =
                    { nixpkgs, ... }:
                    lib.mkMerge [
                      {
                        inherit (nixpkgs) stdenv;
                        nodejs = nixpkgs.nodejs_20; # generate-license-file is broken on 22
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
            inherit nemo-web nev;
            default = nemo-web;
          };

          apps =
            let
              mkApp =
                { drv, ... }:
                {
                  type = "app";
                  program = lib.getExe drv;
                };

              nemo-web-preview = mkApp {
                drv = pkgs.writeShellApplication {
                  name = "nemo-web-preview";

                  runtimeInputs = [
                    pkgs.nodejs
                  ];

                  text = ''
                    cd "$(mktemp --directory)"
                    cp -R ${self.packages.${system}.nemo-web}/lib/node_modules/nemo-web/* .
                    chmod -R +w node_modules
                    mkdir wrapper
                    ln -s ${
                      self.packages.${system}.nemo-web
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
                    lib.mkMerge [
                      {
                        inherit (nixpkgs) stdenv;
                        nemo-wasm-web = lib.mkDefault nemo.packages.${system}.nemo-wasm-web;
                        nemo-wasm-bundler = lib.mkDefault nemo.packages.${system}.nemo-wasm-bundler;
                        nemo-vscode-extension-vsix =
                          lib.mkDefault
                            nemo-vscode-extension.packages.${system}.nemo-vscode-extension-vsix;
                        nev = lib.mkDefault self.packages.${system}.nev;
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

          formatter = pkgs.nixfmt-rfc-style;
        };

      shared = {
        overlays = {
          default = final: prev: {
            inherit (self.packages.${final.stdenv.hostPlatform.system}) nemo-web;
          };
          nemo = nemo.overlays.default;
          nemo-vscode-extension = nemo-vscode-extension.overlays.default;
        };
      };

    in
    shared
    // (lib.genAttrs [
      "apps"
      "packages"
      "devShells"
      "formatter"
    ] (output: forAllSystems (system: (perSystem system).${output})));
}
